// src/ai/ingestion.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmbeddingService } from './embedding.service';

@Injectable()
export class IngestionService implements OnModuleInit {
  private readonly logger = new Logger(IngestionService.name);
  private isIngesting = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async onModuleInit() {
    const columnOk = await this.validateVectorColumnDimension();
    if (!columnOk) {
      this.logger.error(
        '════════════════════════════════════════════════════════\n' +
        '  VECTOR DIMENSION MISMATCH — ingestion will be skipped.\n' +
        '  Run this SQL to fix:\n' +
        '    TRUNCATE TABLE search_embeddings;\n' +
        `    ALTER TABLE search_embeddings ALTER COLUMN embedding TYPE vector(${this.embeddingService.DIMENSION}) USING NULL;\n` +
        '  Then restart the server.\n' +
        '════════════════════════════════════════════════════════',
      );
      return;
    }

    await this.autoIngestIfEmpty();
  }

  // ─── Validate DB vector column dimension ──────────────────────────────────
  private async validateVectorColumnDimension(): Promise<boolean> {
    try {
      const result = await this.prisma.$queryRaw<{ atttypmod: number }[]>`
        SELECT a.atttypmod
        FROM   pg_attribute a
        JOIN   pg_class     c ON c.oid = a.attrelid
        WHERE  c.relname = 'search_embeddings'
          AND  a.attname = 'embedding'
          AND  a.atttypmod > 0
      `;

      if (result.length === 0) {
        this.logger.warn(
          'Could not read vector column dimension — proceeding anyway.',
        );
        return true;
      }

      const dbDimension = result[0].atttypmod;
      const expectedDimension = this.embeddingService.DIMENSION;

      if (dbDimension !== expectedDimension) {
        this.logger.error(
          `DB vector column is vector(${dbDimension}) but ` +
          `EmbeddingService.DIMENSION = ${expectedDimension}. ` +
          `These MUST match.`,
        );
        return false;
      }

      this.logger.log(
        `Vector column dimension check passed: vector(${dbDimension}) ✓`,
      );
      return true;
    } catch (error) {
      this.logger.warn(
        `Could not validate vector column dimension: ${error.message}`,
      );
      return true;
    }
  }

  // ─── Auto-ingest if empty ─────────────────────────────────────────────────
  private async autoIngestIfEmpty(): Promise<void> {
    try {
      const count = await this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) AS count FROM search_embeddings
      `;
      const total = Number(count[0].count);

      if (total === 0) {
        this.logger.warn(
          'search_embeddings table is empty — triggering auto-ingest...',
        );
        await this.ingestAll();
      } else {
        this.logger.log(
          `search_embeddings ready: ${total} documents already indexed.`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Failed to check/initialize embeddings on startup',
        error.stack,
      );
    }
  }

  // ─── Public ingest entry point ────────────────────────────────────────────
  async ingestAll() {
    if (this.isIngesting) {
      this.logger.warn(
        'Ingestion already in progress — skipping duplicate request.',
      );
      return { message: 'Ingestion already in progress', stats: {} };
    }

    this.isIngesting = true;
    this.logger.log('Starting full RAG ingestion...');
    const stats: Record<string, number> = {};

    try {
      await this.ingestAboutContent(stats);
      await this.ingestObjectives(stats);
      await this.ingestLeadership(stats);
      await this.ingestContact(stats);
      await this.ingestMemberProfiles(stats);
      await this.ingestProductListings(stats);
      await this.ingestServiceListings(stats);
      await this.ingestToolListings(stats);
      await this.ingestProductMarketAnalysis(stats);
      await this.ingestServiceMarketAnalysis(stats);
      await this.ingestMarketGapAnalysis(stats);
      await this.ingestSponsors(stats);

      // ── NEW: Ratings ingestion (3 sub-pipelines) ──────────────────────────
      // These are called AFTER listings because ratings reference products,
      // services, and members that must already be in context.
      await this.ingestRatingReviews(stats);
      await this.ingestMemberRatingSummaries(stats);
      await this.ingestListingRatingSummaries(stats);

      const total = Object.values(stats).reduce((a, b) => a + b, 0);
      this.logger.log(
        `RAG ingestion completed — ${total} total documents indexed.\n` +
        `Breakdown: ${JSON.stringify(stats, null, 2)}`,
      );

      return { message: 'Ingestion completed', stats, total };
    } catch (error) {
      this.logger.error('Ingestion failed', error.stack);
      throw error;
    } finally {
      this.isIngesting = false;
    }
  }

  // ─── Upsert helper ────────────────────────────────────────────────────────
  private async upsertEmbedding(
    type: string,
    relatedId: string,
    content: string,
    metadata: any,
    embedding: number[],
  ): Promise<void> {
    if (embedding.length !== this.embeddingService.DIMENSION) {
      throw new Error(
        `Refusing to upsert: got ${embedding.length}-dim vector, ` +
        `DB expects ${this.embeddingService.DIMENSION}-dim.`,
      );
    }

    const vectorString = `[${embedding.join(',')}]`;

    await this.prisma.$executeRaw`
      INSERT INTO search_embeddings
        (id, related_id, type, content, metadata, embedding, created_at, updated_at)
      VALUES
        (gen_random_uuid(), ${relatedId}, ${type}, ${content},
         ${JSON.stringify(metadata)}::jsonb, ${vectorString}::vector, NOW(), NOW())
      ON CONFLICT (type, related_id)
      DO UPDATE SET
        content    = EXCLUDED.content,
        metadata   = EXCLUDED.metadata,
        embedding  = EXCLUDED.embedding,
        updated_at = NOW()
    `;
  }

  private async ingestChunk(
    type: string,
    relatedId: string,
    text: string,
    metadata: any,
    stats: Record<string, number>,
  ): Promise<void> {
    if (!text.trim()) return;

    try {
      const embedding = await this.embeddingService.embed(text);
      await this.upsertEmbedding(type, relatedId, text, metadata, embedding);
      stats[type] = (stats[type] || 0) + 1;
    } catch (error) {
      this.logger.error(
        `Failed to ingest chunk [${type}:${relatedId}]: ${error.message}`,
      );
    }
  }

  // ─── 1. ABOUT CONTENT ─────────────────────────────────────────────────────
  private async ingestAboutContent(stats: Record<string, number>) {
    const items = await this.prisma.aboutContent.findMany({
      where: { isVisible: true },
    });
    for (const item of items) {
      const text = [item.title, item.subtitle, item.content]
        .filter(Boolean)
        .join('\n\n');
      await this.ingestChunk(
        'ABOUT_CONTENT',
        item.sectionKey,
        text,
        { title: item.title, sectionKey: item.sectionKey },
        stats,
      );
    }
    this.logger.log(`About content ingested: ${stats['ABOUT_CONTENT'] ?? 0}`);
  }

  // ─── 2. OBJECTIVES ────────────────────────────────────────────────────────
  private async ingestObjectives(stats: Record<string, number>) {
    const items = await this.prisma.foundationObjective.findMany({
      where: { isDisplayed: true },
    });
    for (const obj of items) {
      const text = [
        `Objective ${obj.objectiveNumber}: ${obj.title}`,
        obj.description,
        obj.shortDescription ? `Summary: ${obj.shortDescription}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');
      await this.ingestChunk(
        'OBJECTIVE',
        obj.id,
        text,
        { objectiveNumber: obj.objectiveNumber, title: obj.title },
        stats,
      );
    }
    this.logger.log(`Objectives ingested: ${stats['OBJECTIVE'] ?? 0}`);
  }

  // ─── 3. LEADERSHIP ────────────────────────────────────────────────────────
  private async ingestLeadership(stats: Record<string, number>) {
    const items = await this.prisma.leadershipProfile.findMany({
      where: { isActive: true, showOnAboutPage: true },
    });
    for (const l of items) {
      const roles = [
        l.isFounder && 'Founder',
        l.isChairman && 'Chairman',
        l.isTrustee && 'Trustee',
        l.isSecretary && 'Secretary',
        l.isTreasurer && 'Treasurer',
      ].filter(Boolean);

      const text = [
        `${l.title ? l.title + ' ' : ''}${l.fullName} is a leader of ROOTAF Foundation.`,
        roles.length ? `Roles: ${roles.join(', ')}` : '',
        `Position: ${l.position}`,
        l.shortBio ?? '',
        l.bio ?? '',
        l.email ? `Email: ${l.email}` : '',
        l.phoneNumber ? `Phone: ${l.phoneNumber}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      await this.ingestChunk(
        'LEADERSHIP',
        l.id,
        text,
        { fullName: l.fullName, position: l.position, roles },
        stats,
      );
    }
    this.logger.log(
      `Leadership profiles ingested: ${stats['LEADERSHIP'] ?? 0}`,
    );
  }

  // ─── 4. CONTACT ───────────────────────────────────────────────────────────
  private async ingestContact(stats: Record<string, number>) {
    const items = await this.prisma.contactInfo.findMany({
      where: { isActive: true },
    });
    for (const c of items) {
      const text = [
        c.label || 'Contact Information',
        `Address: ${c.address}${c.landmark ? `, near ${c.landmark}` : ''}`,
        `Location: ${c.city}, ${c.localGovernmentArea}, ${c.state}, ${c.country}`,
        c.phoneNumber1 ? `Phone: ${c.phoneNumber1}` : '',
        c.email ? `Email: ${c.email}` : '',
        c.alternateEmail ? `Alt Email: ${c.alternateEmail}` : '',
        c.website ? `Website: ${c.website}` : '',
      ]
        .filter(Boolean)
        .join('\n');
      await this.ingestChunk(
        'CONTACT',
        c.id,
        text,
        { label: c.label, city: c.city, state: c.state, isPrimary: c.isPrimary },
        stats,
      );
    }
    this.logger.log(`Contact info ingested: ${stats['CONTACT'] ?? 0}`);
  }

  // ─── 5. MEMBER PROFILES ───────────────────────────────────────────────────
  private async ingestMemberProfiles(stats: Record<string, number>) {
    const members = await this.prisma.memberProfile.findMany({
      where: { isProfileComplete: true },
      include: {
        user: { select: { fullName: true, verificationStatus: true } },
        specializations: { include: { category: true } },
      },
    });

    const verified = members.filter(
      (m) => m.user.verificationStatus === 'VERIFIED',
    );
    this.logger.log(
      `Member profiles found: ${members.length}, verified: ${verified.length}`,
    );

    for (const m of verified) {
      const specs = m.specializations
        .map(
          (s) =>
            `${s.category.name} (${s.specializationType})` +
            (s.specificSkills?.length
              ? ` — skills: ${s.specificSkills.join(', ')}`
              : '') +
            (s.isPrimary ? ' [Primary]' : ''),
        )
        .join('; ');

      const text = [
        `${m.user.fullName} — ${m.providerType} Provider`,
        `Location: ${m.address}, ${m.localGovernmentArea}, ${m.state}`,
        m.tagline ? `Tagline: ${m.tagline}` : '',
        `Specializations: ${specs || 'Not specified'}`,
        m.yearsOfExperience ? `Experience: ${m.yearsOfExperience} years` : '',
        m.bio ? `Bio: ${m.bio}` : '',
        `Rating: ${m.averageRating}/5 (${m.totalRatings} ratings)`,
        m.totalProducts
          ? `Products: ${m.totalProducts} (${m.activeProducts} active)`
          : '',
        m.totalServices
          ? `Services: ${m.totalServices} (${m.activeServices} active)`
          : '',
        m.totalTools
          ? `Tools: ${m.totalTools} (${m.activeTools} active)`
          : '',
      ]
        .filter(Boolean)
        .join('\n');

      await this.ingestChunk(
        'MEMBER',
        m.id,
        text,
        {
          name: m.user.fullName,
          providerType: m.providerType,
          state: m.state,
          lga: m.localGovernmentArea,
          rating: Number(m.averageRating),
        },
        stats,
      );
    }
    this.logger.log(`Member profiles ingested: ${stats['MEMBER'] ?? 0}`);
  }

  // ─── 6. PRODUCT LISTINGS ──────────────────────────────────────────────────
  private async ingestProductListings(stats: Record<string, number>) {
    const products = await this.prisma.product.findMany({
      where: { isActive: true, isApproved: true },
      include: {
        member: { include: { user: { select: { fullName: true } } } },
        category: true,
      },
    });
    this.logger.log(`Products to ingest: ${products.length}`);

    for (const p of products) {
      const pricing =
        p.pricingType === 'NEGOTIABLE'
          ? 'Negotiable'
          : p.pricingType === 'BOTH'
          ? `₦${p.priceAmount?.toLocaleString()} (Negotiable)`
          : `₦${p.priceAmount?.toLocaleString()}`;

      const text = [
        `Product: ${p.name}`,
        `Category: ${p.category.name}`,
        `Seller: ${p.member.user.fullName}`,
        `Location: ${p.member.localGovernmentArea}, ${p.member.state}`,
        `Price: ${pricing}${p.pricePerUnit ? ` ${p.pricePerUnit}` : ''}`,
        `Availability: ${p.availability.replace(/_/g, ' ')}`,
        p.availableQuantity
          ? `Quantity: ${p.availableQuantity} ${p.unitOfMeasure}`
          : '',
        p.bulkPriceAmount
          ? `Bulk Price: ₦${p.bulkPriceAmount?.toLocaleString()} (min ${p.bulkMinimumQuantity})`
          : '',
        `Rating: ${p.averageRating}/5 (${p.totalRatings} ratings)`,
        p.shortDescription ? `Summary: ${p.shortDescription}` : '',
        `Description: ${p.description}`,
        p.tags?.length ? `Tags: ${p.tags.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      await this.ingestChunk(
        'PRODUCT',
        p.id,
        text,
        {
          name: p.name,
          category: p.category.name,
          state: p.member.state,
          seller: p.member.user.fullName,
          price: Number(p.priceAmount || 0),
          pricingType: p.pricingType,
          rating: Number(p.averageRating),
        },
        stats,
      );
    }
    this.logger.log(`Products ingested: ${stats['PRODUCT'] ?? 0}`);
  }

  // ─── 7. SERVICE LISTINGS ──────────────────────────────────────────────────
  private async ingestServiceListings(stats: Record<string, number>) {
    const services = await this.prisma.service.findMany({
      where: { isActive: true, isApproved: true },
      include: {
        member: { include: { user: { select: { fullName: true } } } },
        category: true,
      },
    });
    this.logger.log(`Services to ingest: ${services.length}`);

    for (const s of services) {
      const pricing =
        s.pricingType === 'NEGOTIABLE'
          ? 'Negotiable'
          : `From ₦${s.startingPrice?.toLocaleString()}${s.priceBasis ? ` ${s.priceBasis}` : ''}`;

      const text = [
        `Service: ${s.name}`,
        `Category: ${s.category.name}`,
        `Provider: ${s.member.user.fullName}`,
        `Location: ${s.member.localGovernmentArea}, ${s.member.state}`,
        s.serviceArea ? `Service Area: ${s.serviceArea}` : '',
        `Price: ${pricing}`,
        `Availability: ${s.availability.replace(/_/g, ' ')}`,
        s.estimatedDuration ? `Duration: ${s.estimatedDuration}` : '',
        `Rating: ${s.averageRating}/5 (${s.totalRatings} ratings)`,
        s.completedJobsCount ? `Completed Jobs: ${s.completedJobsCount}` : '',
        s.shortDescription ? `Summary: ${s.shortDescription}` : '',
        `Description: ${s.description}`,
        s.tags?.length ? `Tags: ${s.tags.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      await this.ingestChunk(
        'SERVICE',
        s.id,
        text,
        {
          name: s.name,
          category: s.category.name,
          state: s.member.state,
          provider: s.member.user.fullName,
          startingPrice: Number(s.startingPrice || 0),
          rating: Number(s.averageRating),
        },
        stats,
      );
    }
    this.logger.log(`Services ingested: ${stats['SERVICE'] ?? 0}`);
  }

  // ─── 8. TOOL LISTINGS ─────────────────────────────────────────────────────
  private async ingestToolListings(stats: Record<string, number>) {
    const tools = await this.prisma.tool.findMany({
      where: { isActive: true },
      include: {
        member: { include: { user: { select: { fullName: true } } } },
        category: true,
      },
    });
    this.logger.log(`Tools to ingest: ${tools.length}`);

    for (const t of tools) {
      const priceInfo: string[] = [];
      if (t.listingPurpose === 'FOR_SALE' || t.listingPurpose === 'BOTH') {
        priceInfo.push(
          `Sale: ${
            t.salePricingType === 'NEGOTIABLE'
              ? 'Negotiable'
              : `₦${t.salePrice?.toLocaleString()}`
          }`,
        );
      }
      if (t.listingPurpose === 'FOR_LEASE' || t.listingPurpose === 'BOTH') {
        priceInfo.push(
          `Lease: ₦${t.leaseRate?.toLocaleString()}/${t.leaseRatePeriod
            ?.replace('PER_', '')
            .toLowerCase()}`,
        );
      }

      const text = [
        `Tool: ${t.name}`,
        `Category: ${t.category.name}`,
        `Owner: ${t.member.user.fullName}`,
        `Location: ${t.member.localGovernmentArea}, ${t.member.state}`,
        `Purpose: ${t.listingPurpose.replace(/_/g, ' ')}`,
        `Condition: ${t.condition.replace(/_/g, ' ')}`,
        priceInfo.join(' | '),
        `Availability: ${t.availabilityStatus.replace(/_/g, ' ')}`,
        t.deliveryAvailable ? 'Delivery Available: Yes' : '',
        t.shortDescription ? `Summary: ${t.shortDescription}` : '',
        `Description: ${t.description}`,
      ]
        .filter(Boolean)
        .join('\n');

      await this.ingestChunk(
        'TOOL',
        t.id,
        text,
        {
          name: t.name,
          category: t.category.name,
          state: t.member.state,
          listingPurpose: t.listingPurpose,
          condition: t.condition,
        },
        stats,
      );
    }
    this.logger.log(`Tools ingested: ${stats['TOOL'] ?? 0}`);
  }

  // ─── 9. PRODUCT MARKET ANALYSIS ───────────────────────────────────────────
  private async ingestProductMarketAnalysis(stats: Record<string, number>) {
    const analysis: any[] = await this.prisma.$queryRaw`
      SELECT
        mp.state,
        c.name            AS category_name,
        COUNT(DISTINCT p.id)         AS product_count,
        COUNT(DISTINCT p.member_id)  AS seller_count,
        AVG(p.price_amount)          AS avg_price,
        MIN(p.price_amount)          AS min_price,
        MAX(p.price_amount)          AS max_price,
        AVG(p.average_rating)        AS avg_rating,
        MAX(p.average_rating)        AS best_rating
      FROM products p
      JOIN member_profiles mp ON p.member_id = mp.id
      JOIN categories      c  ON p.category_id = c.id
      WHERE p.is_active = true AND p.is_approved = true
      GROUP BY mp.state, c.name
      HAVING COUNT(DISTINCT p.id) > 0
    `;

    for (const a of analysis) {
      const text = [
        `Product Market Analysis — ${a.category_name} in ${a.state} State:`,
        `- ${Number(a.seller_count)} seller(s) offering ${Number(a.product_count)} product(s)`,
        `- Price range: ₦${Number(a.min_price).toLocaleString()} to ₦${Number(a.max_price).toLocaleString()} (average: ₦${Math.round(Number(a.avg_price)).toLocaleString()})`,
        `- Average rating: ${Number(a.avg_rating).toFixed(1)}/5 (best: ${Number(a.best_rating).toFixed(1)}/5)`,
      ].join('\n');

      await this.ingestChunk(
        'PRODUCT_MARKET',
        `${a.state}_${a.category_name}`.replace(/\s+/g, '_'),
        text,
        {
          state: a.state,
          category: a.category_name,
          avgPrice: Math.round(Number(a.avg_price)),
        },
        stats,
      );
    }
    this.logger.log(
      `Product market analyses ingested: ${stats['PRODUCT_MARKET'] ?? 0}`,
    );
  }

  // ─── 10. SERVICE MARKET ANALYSIS ──────────────────────────────────────────
  private async ingestServiceMarketAnalysis(stats: Record<string, number>) {
    const analysis: any[] = await this.prisma.$queryRaw`
      SELECT
        mp.state,
        c.name            AS category_name,
        COUNT(DISTINCT s.id)         AS service_count,
        COUNT(DISTINCT s.member_id)  AS provider_count,
        AVG(s.starting_price)        AS avg_price,
        MIN(s.starting_price)        AS min_price,
        MAX(s.starting_price)        AS max_price,
        AVG(s.average_rating)        AS avg_rating,
        SUM(s.completed_jobs_count)  AS total_completed_jobs
      FROM services s
      JOIN member_profiles mp ON s.member_id = mp.id
      JOIN categories      c  ON s.category_id = c.id
      WHERE s.is_active = true AND s.is_approved = true
      GROUP BY mp.state, c.name
      HAVING COUNT(DISTINCT s.id) > 0
    `;

    for (const a of analysis) {
      const text = [
        `Service Market Analysis — ${a.category_name} in ${a.state} State:`,
        `- ${Number(a.provider_count)} provider(s) offering ${Number(a.service_count)} service(s)`,
        `- Price range: ₦${Number(a.min_price).toLocaleString()} to ₦${Number(a.max_price).toLocaleString()} (average: ₦${Math.round(Number(a.avg_price)).toLocaleString()})`,
        `- Average rating: ${Number(a.avg_rating).toFixed(1)}/5`,
        `- Total completed jobs: ${Number(a.total_completed_jobs)}`,
      ].join('\n');

      await this.ingestChunk(
        'SERVICE_MARKET',
        `svc_${a.state}_${a.category_name}`.replace(/\s+/g, '_'),
        text,
        { state: a.state, category: a.category_name },
        stats,
      );
    }
    this.logger.log(
      `Service market analyses ingested: ${stats['SERVICE_MARKET'] ?? 0}`,
    );
  }

  // ─── 11. MARKET GAP ANALYSIS ──────────────────────────────────────────────
  private async ingestMarketGapAnalysis(stats: Record<string, number>) {
    const memberDensity: any[] = await this.prisma.$queryRaw`
      SELECT
        mp.state,
        c.name            AS category_name,
        COUNT(DISTINCT ms.member_id) AS member_count
      FROM member_specializations ms
      JOIN member_profiles mp ON ms.member_id = mp.id
      JOIN categories      c  ON ms.category_id = c.id
      JOIN users           u  ON mp.user_id = u.id
      WHERE u.verification_status = 'VERIFIED'
        AND mp.state IS NOT NULL
      GROUP BY mp.state, c.name
    `;

    const clientTotals: any[] = await this.prisma.$queryRaw`
      SELECT state, COUNT(*) AS total_clients
      FROM client_profiles
      WHERE state IS NOT NULL
      GROUP BY state
    `;

    const clientTotalMap: Record<string, number> = {};
    for (const ct of clientTotals) {
      clientTotalMap[ct.state] = Number(ct.total_clients);
    }

    const supplyMap: Record<string, Record<string, number>> = {};
    for (const m of memberDensity) {
      if (!supplyMap[m.state]) supplyMap[m.state] = {};
      supplyMap[m.state][m.category_name] = Number(m.member_count);
    }

    const allStates = new Set([
      ...Object.keys(supplyMap),
      ...Object.keys(clientTotalMap),
    ]);

    for (const state of allStates) {
      const gapEntries: string[] = [];
      const opportunityEntries: string[] = [];
      const categories = supplyMap[state] || {};

      for (const [cat, count] of Object.entries(categories)) {
        const clients = clientTotalMap[state] || 0;
        gapEntries.push(
          `${cat}: ${count} provider(s), ~${clients} potential clients in state`,
        );
        if (count <= 2 && clients > 5) {
          opportunityEntries.push(`${cat} (few providers, many clients)`);
        }
      }

      if (gapEntries.length === 0) continue;

      const text = [
        `Market Gap Analysis — ${state} State:`,
        `Total registered clients: ${clientTotalMap[state] || 0}`,
        '',
        'Supply Breakdown:',
        ...gapEntries,
        '',
        opportunityEntries.length > 0
          ? `🔥 High Opportunity Areas:\n${opportunityEntries.join('\n')}`
          : 'Market relatively balanced.',
      ].join('\n');

      await this.ingestChunk(
        'MARKET_GAP',
        `gap_${state}`.replace(/\s+/g, '_'),
        text,
        { state, totalClients: clientTotalMap[state] || 0 },
        stats,
      );
    }
    this.logger.log(
      `Market gap analyses ingested: ${stats['MARKET_GAP'] ?? 0}`,
    );
  }

  // ─── 12. SPONSORS ─────────────────────────────────────────────────────────
  private async ingestSponsors(stats: Record<string, number>) {
    try {
      const sponsors: any[] =
        (await (this.prisma as any).sponsorPartner?.findMany?.()) ??
        (await (this.prisma as any).sponsor?.findMany?.()) ??
        [];

      for (const s of sponsors) {
        const text = [
          `${
            s.type === 'SPONSOR'
              ? 'Sponsor'
              : s.type === 'PARTNER'
              ? 'Partner'
              : 'Sponsor & Partner'
          }: ${s.name}`,
          s.category ? `Category: ${s.category.replace(/_/g, ' ')}` : '',
          s.description ? `Description: ${s.description}` : '',
          s.websiteUrl ? `Website: ${s.websiteUrl}` : '',
        ]
          .filter(Boolean)
          .join('\n');

        await this.ingestChunk(
          'SPONSOR',
          s.id,
          text,
          { name: s.name, type: s.type },
          stats,
        );
      }
      this.logger.log(`Sponsors ingested: ${stats['SPONSOR'] ?? 0}`);
    } catch {
      this.logger.warn('Sponsor/Partner model not found — skipping.');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── 13. RATING REVIEWS ───────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // WHAT: Ingests every individual rating that has a written review
  //       (reviewTitle or reviewText must be non-empty).
  //
  // WHY ONLY REVIEWS WITH TEXT:
  //   A bare numeric rating (e.g., "3 stars") carries no semantic signal
  //   useful for vector search. The AI can't answer "what do people say about
  //   John's maize?" from a lone integer. Once a client writes even a single
  //   sentence we get searchable natural language we can embed.
  //
  // DATA SOURCE:
  //   prisma.rating — the same model CreateRatingDto writes to.
  //   We join to:
  //     • client  → user (for the reviewer's name, kept anonymous-friendly)
  //     • member  → user (for the reviewee's name)
  //     • product (optional — only present for PRODUCT category ratings)
  //     • service (optional — only present for SERVICE category ratings)
  //
  // UNIQUE KEY STRATEGY:
  //   relatedId = "review_<rating.id>"
  //   The "review_" prefix prevents key collisions with the MEMBER / PRODUCT /
  //   SERVICE documents that already use the raw id as their relatedId.
  //
  // TEXT SHAPE (what gets embedded):
  //   Client review of <member name>
  //   Category: <PRODUCT | SERVICE | MEMBER>
  //   [For product: Product: <name>]
  //   [For service: Service: <name>]
  //   Overall rating: 4/5
  //   [Quality: 4/5 | Communication: 5/5 | Value: 3/5 | Timeliness: 4/5]
  //   [Title: "Great quality maize"]
  //   Review: "Very fresh produce, delivered on time. Highly recommended."
  //
  // METADATA (stored alongside for post-retrieval filtering):
  //   memberId, ratingCategory, overallRating, productId?, serviceId?,
  //   hasReviewText (boolean — always true here)
  //
  private async ingestRatingReviews(stats: Record<string, number>) {
    // ── Fetch only ACTIVE ratings that have written text ──────────────────
    // We check for BOTH reviewTitle and reviewText because either alone is
    // enough to form meaningful embedded content.
    const ratings = await this.prisma.rating.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { reviewText:  { not: null } },
          { reviewTitle: { not: null } },
        ],
      },
      include: {
        // Reviewer name — kept first-name + last-initial style for privacy
        client: {
          include: {
            user: { select: { fullName: true } },
          },
        },
        // Reviewee name
        member: {
          include: {
            user: { select: { fullName: true } },
          },
        },
        // Only populated when ratingCategory = 'PRODUCT'
        product: { select: { name: true } },
        // Only populated when ratingCategory = 'SERVICE'
        service: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    this.logger.log(`Rating reviews to ingest: ${ratings.length}`);

    for (const r of ratings) {
      // ── Build the reviewer display name ─────────────────────────────────
      // We anonymise to "FirstName L." to respect reviewer privacy while
      // still giving the LLM enough context to say "a client named Jane D."
      const reviewerFullName = r.client?.user?.fullName ?? 'A client';
      const reviewerDisplay = this.toAnonymousName(reviewerFullName);

      const memberName = r.member?.user?.fullName ?? 'a member';

      // ── Build sub-rating lines (only include dimensions that were set) ──
      const subRatings: string[] = [];
      if (r.qualityRating)       subRatings.push(`Quality: ${r.qualityRating}/5`);
      if (r.communicationRating) subRatings.push(`Communication: ${r.communicationRating}/5`);
      if (r.valueRating)         subRatings.push(`Value for Money: ${r.valueRating}/5`);
      if (r.timelinessRating)    subRatings.push(`Timeliness: ${r.timelinessRating}/5`);

      // ── Compose the embeddable text ──────────────────────────────────────
      const text = [
        `Client review of ${memberName} by ${reviewerDisplay}`,
        `Category: ${r.ratingCategory.replace(/_/g, ' ')}`,

        // Context line — tells the AI WHAT was rated (product/service name)
        r.product ? `Product reviewed: ${r.product.name}` : '',
        r.service ? `Service reviewed: ${r.service.name}` : '',

        // Overall star rating in human-readable form
        `Overall rating: ${r.overallRating}/5 ${this.starsString(r.overallRating)}`,

        // Sub-dimension ratings if present
        subRatings.length ? `Detailed ratings — ${subRatings.join(' | ')}` : '',

        // The actual written content (the most semantically rich part)
        r.reviewTitle ? `Title: "${r.reviewTitle}"` : '',
        r.reviewText  ? `Review: "${r.reviewText}"` : '',
      ]
        .filter(Boolean)
        .join('\n');

      await this.ingestChunk(
        'RATING_REVIEW',
        `review_${r.id}`,   // ← namespaced so it never collides with MEMBER/PRODUCT ids
        text,
        {
          memberId:       r.memberId,
          ratingCategory: r.ratingCategory,
          overallRating:  r.overallRating,
          productId:      r.productId  ?? null,
          serviceId:      r.serviceId  ?? null,
          hasReviewText:  true,
        },
        stats,
      );
    }

    this.logger.log(
      `Rating reviews ingested: ${stats['RATING_REVIEW'] ?? 0}`,
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── 14. MEMBER RATING SUMMARIES ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // WHAT: One document per verified member that summarises their full rating
  //       profile using the denormalized stats already on MemberProfile.
  //
  // WHY SEPARATE FROM MEMBER PROFILE:
  //   The MEMBER document (section 5) focuses on what a member offers
  //   (specialisations, bio, products/service count). This MEMBER_RATING
  //   document focuses entirely on HOW WELL they are regarded, enabling
  //   queries like "who are the highest-rated maize sellers in Kano?" to
  //   hit a dedicated, tightly-scoped vector rather than a general profile.
  //
  // UNIQUE KEY STRATEGY:
  //   relatedId = "rating_summary_<memberProfile.id>"
  //   Prefix prevents collision with the MEMBER document for the same id.
  //
  // TEXT SHAPE:
  //   Rating summary for <name>:
  //   Overall: 4.7/5 ★★★★★ (23 ratings)
  //   Star breakdown: ★5 → 15 | ★4 → 5 | ★3 → 2 | ★2 → 1 | ★1 → 0
  //   Sentiment: Excellent (≥4.5) / Good (≥3.5) / Mixed / Low / No ratings yet
  //
  private async ingestMemberRatingSummaries(stats: Record<string, number>) {
    // Only members with at least one rating — avoids noise from empty docs.
    const members = await this.prisma.memberProfile.findMany({
      where: {
        isProfileComplete: true,
        totalRatings: { gt: 0 },
        user: { verificationStatus: 'VERIFIED' },
      },
      include: {
        user: { select: { fullName: true } },
      },
    });

    this.logger.log(`Member rating summaries to ingest: ${members.length}`);

    for (const m of members) {
      const avg = Number(m.averageRating);
      const total = m.totalRatings;

      // ── Star breakdown using the denormalized counters ───────────────────
      // These are kept in sync by RatingsService.updateMemberRating() which
      // runs inside the same Postgres transaction as every new rating write.
      const breakdown = [
        `★5 → ${m.fiveStarCount  ?? 0}`,
        `★4 → ${m.fourStarCount  ?? 0}`,
        `★3 → ${m.threeStarCount ?? 0}`,
        `★2 → ${m.twoStarCount   ?? 0}`,
        `★1 → ${m.oneStarCount   ?? 0}`,
      ].join(' | ');

      // ── Human-readable sentiment label ───────────────────────────────────
      const sentiment = this.ratingToSentiment(avg);

      const text = [
        `Rating summary for ${m.user.fullName}:`,
        `Overall: ${avg.toFixed(1)}/5 ${this.starsString(Math.round(avg))} (${total} rating${total !== 1 ? 's' : ''})`,
        `Star breakdown: ${breakdown}`,
        `Sentiment: ${sentiment}`,
        `Provider type: ${m.providerType}`,
        `Location: ${m.localGovernmentArea ?? ''}, ${m.state ?? ''}`.trim().replace(/^,\s*/, ''),
      ]
        .filter(Boolean)
        .join('\n');

      await this.ingestChunk(
        'MEMBER_RATING',
        `rating_summary_${m.id}`,
        text,
        {
          memberId:     m.id,
          memberName:   m.user.fullName,
          avgRating:    avg,
          totalRatings: total,
          state:        m.state,
          providerType: m.providerType,
        },
        stats,
      );
    }

    this.logger.log(
      `Member rating summaries ingested: ${stats['MEMBER_RATING'] ?? 0}`,
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── 15. LISTING RATING SUMMARIES (Products & Services) ───────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // WHAT: One document per rated product and one per rated service, focused
  //       purely on rating data (not the listing description, which is already
  //       in the PRODUCT / SERVICE documents).
  //
  // WHY:
  //   When a user asks "what are the best-rated tomatoes under ₦5,000?"
  //   the AI benefits from a dedicated rating vector for each product rather
  //   than having to parse a rating line buried inside a full product document.
  //   Keeping them separate also means changes in ratings (frequent) don't
  //   force re-embedding of unchanged product descriptions.
  //
  // UNIQUE KEY STRATEGY:
  //   Products → "prod_rating_<product.id>"
  //   Services → "svc_rating_<service.id>"
  //
  // TEXT SHAPE (product example):
  //   Product rating summary: Fresh Tomatoes
  //   Seller: John Doe | Category: Vegetables | Location: Kano, Kano State
  //   Rating: 4.3/5 ★★★★☆ (12 ratings)
  //
  private async ingestListingRatingSummaries(stats: Record<string, number>) {
    // ── Products with at least one rating ────────────────────────────────
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        isApproved: true,
        totalRatings: { gt: 0 },
      },
      include: {
        member: { include: { user: { select: { fullName: true } } } },
        category: true,
      },
    });

    this.logger.log(`Product rating summaries to ingest: ${products.length}`);

    for (const p of products) {
      const avg = Number(p.averageRating);
      const text = [
        `Product rating summary: ${p.name}`,
        `Seller: ${p.member.user.fullName}`,
        `Category: ${p.category.name}`,
        `Location: ${p.member.localGovernmentArea}, ${p.member.state}`,
        `Rating: ${avg.toFixed(1)}/5 ${this.starsString(Math.round(avg))} (${p.totalRatings} rating${p.totalRatings !== 1 ? 's' : ''})`,
        `Sentiment: ${this.ratingToSentiment(avg)}`,
      ]
        .filter(Boolean)
        .join('\n');

      await this.ingestChunk(
        'PRODUCT_RATING',
        `prod_rating_${p.id}`,
        text,
        {
          productId:    p.id,
          productName:  p.name,
          category:     p.category.name,
          state:        p.member.state,
          avgRating:    avg,
          totalRatings: p.totalRatings,
        },
        stats,
      );
    }

    this.logger.log(
      `Product rating summaries ingested: ${stats['PRODUCT_RATING'] ?? 0}`,
    );

    // ── Services with at least one rating ────────────────────────────────
    const services = await this.prisma.service.findMany({
      where: {
        isActive: true,
        isApproved: true,
        totalRatings: { gt: 0 },
      },
      include: {
        member: { include: { user: { select: { fullName: true } } } },
        category: true,
      },
    });

    this.logger.log(`Service rating summaries to ingest: ${services.length}`);

    for (const s of services) {
      const avg = Number(s.averageRating);
      const text = [
        `Service rating summary: ${s.name}`,
        `Provider: ${s.member.user.fullName}`,
        `Category: ${s.category.name}`,
        `Location: ${s.member.localGovernmentArea}, ${s.member.state}`,
        `Rating: ${avg.toFixed(1)}/5 ${this.starsString(Math.round(avg))} (${s.totalRatings} rating${s.totalRatings !== 1 ? 's' : ''})`,
        `Sentiment: ${this.ratingToSentiment(avg)}`,
        s.completedJobsCount
          ? `Completed jobs: ${s.completedJobsCount}`
          : '',
      ]
        .filter(Boolean)
        .join('\n');

      await this.ingestChunk(
        'SERVICE_RATING',
        `svc_rating_${s.id}`,
        text,
        {
          serviceId:    s.id,
          serviceName:  s.name,
          category:     s.category.name,
          state:        s.member.state,
          avgRating:    avg,
          totalRatings: s.totalRatings,
        },
        stats,
      );
    }

    this.logger.log(
      `Service rating summaries ingested: ${stats['SERVICE_RATING'] ?? 0}`,
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── Private utility helpers ───────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Converts a full name to an anonymised display like "Jane D."
   * Protects reviewer privacy while still being human-readable in AI output.
   */
  private toAnonymousName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0]; // single-word name — use as-is
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1][0].toUpperCase();
    return `${firstName} ${lastInitial}.`;
  }

  /**
   * Converts an integer 1–5 into a Unicode star string.
   * e.g. 4 → "★★★★☆"
   * Used in embedded text so the LLM can pattern-match star ratings
   * from natural language like "four-star sellers".
   */
  private starsString(rating: number): string {
    const filled = Math.min(Math.max(Math.round(rating), 0), 5);
    return '★'.repeat(filled) + '☆'.repeat(5 - filled);
  }

  /**
   * Maps an average rating to a qualitative sentiment label.
   * Allows the AI to respond to questions like "who are the well-regarded
   * providers?" without having to reason about raw decimals.
   *
   * Thresholds:
   *   ≥ 4.5 → Excellent
   *   ≥ 3.5 → Good
   *   ≥ 2.5 → Mixed
   *   ≥ 1.0 → Below average
   *     0   → No ratings yet
   */
  private ratingToSentiment(avg: number): string {
    if (avg >= 4.5) return 'Excellent';
    if (avg >= 3.5) return 'Good';
    if (avg >= 2.5) return 'Mixed';
    if (avg >= 1.0) return 'Below average';
    return 'No ratings yet';
  }
}