import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmbeddingService } from './embedding.service';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private prisma: PrismaService,
    private embeddingService: EmbeddingService,
  ) {}

  async ingestAll() {
    this.logger.log('Starting full RAG ingestion...');
    const stats: Record<string, number> = {};

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

    this.logger.log('RAG ingestion completed: ' + JSON.stringify(stats));
    return { message: 'Ingestion completed', stats };
  }

  // ─── HELPER: Raw SQL Upsert for Vectors ───
  private async upsertEmbedding(
    type: string,
    relatedId: string,
    content: string,
    metadata: any,
    embedding: number[],
  ) {
    const vectorString = `[${embedding.join(',')}]`;
    
    await this.prisma.$executeRaw`
      INSERT INTO search_embeddings (id, related_id, type, content, metadata, embedding, created_at, updated_at)
      VALUES (gen_random_uuid(), ${relatedId}, ${type}, ${content}, ${metadata}::jsonb, ${vectorString}::vector, NOW(), NOW())
      ON CONFLICT (type, related_id)
      DO UPDATE SET 
        content = EXCLUDED.content,
        metadata = EXCLUDED.metadata,
        embedding = EXCLUDED.embedding,
        updated_at = NOW()
    `;
  }

  private async ingestChunk(
    type: string,
    relatedId: string,
    text: string,
    metadata: any,
    stats: Record<string, number>,
  ) {
    if (!text.trim()) return;
    const embedding = await this.embeddingService.embed(text);
    await this.upsertEmbedding(type, relatedId, text, metadata, embedding);
    stats[type] = (stats[type] || 0) + 1;
  }

  // ─── 1. ABOUT CONTENT ───
  private async ingestAboutContent(stats: Record<string, number>) {
    const items = await this.prisma.aboutContent.findMany({ where: { isVisible: true } });
    for (const item of items) {
      const text = [item.title, item.subtitle, item.content].filter(Boolean).join('\n\n');
      await this.ingestChunk('ABOUT_CONTENT', item.sectionKey, text, { title: item.title, sectionKey: item.sectionKey }, stats);
    }
  }

  // ─── 2. OBJECTIVES ───
  private async ingestObjectives(stats: Record<string, number>) {
    const items = await this.prisma.foundationObjective.findMany({ where: { isDisplayed: true } });
    for (const obj of items) {
      const text = `Objective ${obj.objectiveNumber}: ${obj.title}\n\n${obj.description}${obj.shortDescription ? `\n\nSummary: ${obj.shortDescription}` : ''}`;
      await this.ingestChunk('OBJECTIVE', obj.id, text, { objectiveNumber: obj.objectiveNumber, title: obj.title }, stats);
    }
  }

  // ─── 3. LEADERSHIP ───
  private async ingestLeadership(stats: Record<string, number>) {
    const items = await this.prisma.leadershipProfile.findMany({ where: { isActive: true, showOnAboutPage: true } });
    for (const l of items) {
      const roles = [l.isFounder && 'Founder', l.isChairman && 'Chairman', l.isTrustee && 'Trustee', l.isSecretary && 'Secretary', l.isTreasurer && 'Treasurer'].filter(Boolean);
      const text = `${l.title ? l.title + ' ' : ''}${l.fullName}${roles.length ? ' — ' + roles.join(', ') : ''}\nPosition: ${l.position}\n\n${l.shortBio || ''}\n\n${l.bio || ''}${l.email ? `\nEmail: ${l.email}` : ''}${l.phoneNumber ? `\nPhone: ${l.phoneNumber}` : ''}`;
      await this.ingestChunk('LEADERSHIP', l.id, text, { fullName: l.fullName, position: l.position, roles }, stats);
    }
  }

  // ─── 4. CONTACT ───
  private async ingestContact(stats: Record<string, number>) {
    const items = await this.prisma.contactInfo.findMany({ where: { isActive: true } });
    for (const c of items) {
      const text = `${c.label || 'Contact Information'}\nAddress: ${c.address}${c.landmark ? `, near ${c.landmark}` : ''}\nLocation: ${c.city}, ${c.localGovernmentArea}, ${c.state}, ${c.country}${c.phoneNumber1 ? `\nPhone: ${c.phoneNumber1}` : ''}${c.email ? `\nEmail: ${c.email}` : ''}${c.alternateEmail ? `\nAlt Email: ${c.alternateEmail}` : ''}${c.website ? `\nWebsite: ${c.website}` : ''}`;
      await this.ingestChunk('CONTACT', c.id, text, { label: c.label, city: c.city, state: c.state, isPrimary: c.isPrimary }, stats);
    }
  }

  // ─── 5. MEMBER PROFILES ───
  private async ingestMemberProfiles(stats: Record<string, number>) {
    const members = await this.prisma.memberProfile.findMany({
      where: { isProfileComplete: true },
      include: {
        user: { select: { fullName: true, verificationStatus: true } },
        specializations: { include: { category: true } },
      },
    });

    for (const m of members) {
      if (m.user.verificationStatus !== 'VERIFIED') continue;
      const specs = m.specializations.map(s =>
        `${s.category.name} (${s.specializationType})${s.specificSkills?.length ? ' — skills: ' + s.specificSkills.join(', ') : ''}${s.isPrimary ? ' [Primary]' : ''}`
      ).join('; ');

      const text = `${m.user.fullName} — ${m.providerType} Provider\nLocation: ${m.address}, ${m.localGovernmentArea}, ${m.state}${m.tagline ? `\nTagline: ${m.tagline}` : ''}\nSpecializations: ${specs || 'Not specified'}${m.yearsOfExperience ? `\nExperience: ${m.yearsOfExperience} years` : ''}${m.bio ? `\nBio: ${m.bio}` : ''}\nRating: ${m.averageRating}/5 (${m.totalRatings} ratings)${m.totalProducts ? `\nProducts: ${m.totalProducts} (${m.activeProducts} active)` : ''}${m.totalServices ? `\nServices: ${m.totalServices} (${m.activeServices} active)` : ''}${m.totalTools ? `\nTools: ${m.totalTools} (${m.activeTools} active)` : ''}`;

      await this.ingestChunk('MEMBER', m.id, text, {
        name: m.user.fullName,
        providerType: m.providerType,
        state: m.state,
        lga: m.localGovernmentArea,
        rating: Number(m.averageRating),
      }, stats);
    }
  }

  // ─── 6. PRODUCT LISTINGS ───
  private async ingestProductListings(stats: Record<string, number>) {
    const products = await this.prisma.product.findMany({
      where: { isActive: true, isApproved: true },
      include: {
        member: { include: { user: { select: { fullName: true } } } },
        category: true,
      },
    });

    for (const p of products) {
      const pricing = p.pricingType === 'NEGOTIABLE' ? 'Negotiable' :
        p.pricingType === 'BOTH' ? `₦${p.priceAmount?.toLocaleString()} (Negotiable)` :
        `₦${p.priceAmount?.toLocaleString()}`;

      const text = `Product: ${p.name}\nCategory: ${p.category.name}\nSeller: ${p.member.user.fullName}\nLocation: ${p.member.localGovernmentArea}, ${p.member.state}\nPrice: ${pricing}${p.pricePerUnit ? ` ${p.pricePerUnit}` : ''}\nAvailability: ${p.availability.replace(/_/g, ' ')}${p.availableQuantity ? `\nQuantity: ${p.availableQuantity} ${p.unitOfMeasure}` : ''}${p.bulkPriceAmount ? `\nBulk Price: ₦${p.bulkPriceAmount?.toLocaleString()} (min ${p.bulkMinimumQuantity})` : ''}\nRating: ${p.averageRating}/5 (${p.totalRatings} ratings)${p.shortDescription ? `\nSummary: ${p.shortDescription}` : ''}\nDescription: ${p.description}${p.tags?.length ? `\nTags: ${p.tags.join(', ')}` : ''}`;

      await this.ingestChunk('PRODUCT', p.id, text, {
        name: p.name, category: p.category.name, state: p.member.state,
        seller: p.member.user.fullName, price: Number(p.priceAmount || 0),
        pricingType: p.pricingType, rating: Number(p.averageRating),
      }, stats);
    }
  }

  // ─── 7. SERVICE LISTINGS ───
  private async ingestServiceListings(stats: Record<string, number>) {
    const services = await this.prisma.service.findMany({
      where: { isActive: true, isApproved: true },
      include: {
        member: { include: { user: { select: { fullName: true } } } },
        category: true,
      },
    });

    for (const s of services) {
      const pricing = s.pricingType === 'NEGOTIABLE' ? 'Negotiable' :
        `From ₦${s.startingPrice?.toLocaleString()}${s.priceBasis ? ` ${s.priceBasis}` : ''}`;

      const text = `Service: ${s.name}\nCategory: ${s.category.name}\nProvider: ${s.member.user.fullName}\nLocation: ${s.member.localGovernmentArea}, ${s.member.state}${s.serviceArea ? `\nService Area: ${s.serviceArea}` : ''}\nPrice: ${pricing}\nAvailability: ${s.availability.replace(/_/g, ' ')}${s.estimatedDuration ? `\nDuration: ${s.estimatedDuration}` : ''}\nRating: ${s.averageRating}/5 (${s.totalRatings} ratings)${s.completedJobsCount ? `\nCompleted Jobs: ${s.completedJobsCount}` : ''}${s.shortDescription ? `\nSummary: ${s.shortDescription}` : ''}\nDescription: ${s.description}${s.tags?.length ? `\nTags: ${s.tags.join(', ')}` : ''}`;

      await this.ingestChunk('SERVICE', s.id, text, {
        name: s.name, category: s.category.name, state: s.member.state,
        provider: s.member.user.fullName, startingPrice: Number(s.startingPrice || 0),
        rating: Number(s.averageRating),
      }, stats);
    }
  }

  // ─── 8. TOOL LISTINGS ───
  private async ingestToolListings(stats: Record<string, number>) {
    const tools = await this.prisma.tool.findMany({
      where: { isActive: true },
      include: {
        member: { include: { user: { select: { fullName: true } } } },
        category: true,
      },
    });

    for (const t of tools) {
      const priceInfo: string[] = [];
      if (t.listingPurpose === 'FOR_SALE' || t.listingPurpose === 'BOTH') priceInfo.push(`Sale: ${t.salePricingType === 'NEGOTIABLE' ? 'Negotiable' : `₦${t.salePrice?.toLocaleString()}`}`);
      if (t.listingPurpose === 'FOR_LEASE' || t.listingPurpose === 'BOTH') priceInfo.push(`Lease: ₦${t.leaseRate?.toLocaleString()}/${t.leaseRatePeriod?.replace('PER_', '').toLowerCase()}`);

      const text = `Tool: ${t.name}\nCategory: ${t.category.name}\nOwner: ${t.member.user.fullName}\nLocation: ${t.member.localGovernmentArea}, ${t.member.state}\nPurpose: ${t.listingPurpose.replace(/_/g, ' ')}\nCondition: ${t.condition.replace(/_/g, ' ')}\n${priceInfo.join(' | ')}\nAvailability: ${t.availabilityStatus.replace(/_/g, ' ')}${t.deliveryAvailable ? `\nDelivery Available: Yes` : ''}${t.shortDescription ? `\nSummary: ${t.shortDescription}` : ''}\nDescription: ${t.description}`;

      await this.ingestChunk('TOOL', t.id, text, {
        name: t.name, category: t.category.name, state: t.member.state,
        listingPurpose: t.listingPurpose, condition: t.condition,
      }, stats);
    }
  }

  // ─── 9. PRODUCT MARKET ANALYSIS ───
  private async ingestProductMarketAnalysis(stats: Record<string, number>) {
    const analysis: any[] = await this.prisma.$queryRaw`
      SELECT mp.state, c.name AS category_name, c.category_type,
             COUNT(DISTINCT p.id) AS product_count, COUNT(DISTINCT p."member_id") AS seller_count,
             AVG(p."price_amount") AS avg_price, MIN(p."price_amount") AS min_price, MAX(p."price_amount") AS max_price,
             AVG(p."average_rating") AS avg_rating, MAX(p."average_rating") AS best_rating
      FROM products p
      JOIN member_profiles mp ON p."member_id" = mp.id
      JOIN categories c ON p."category_id" = c.id
      WHERE p."is_active" = true AND p."is_approved" = true
      GROUP BY mp.state, c.name, c.category_type HAVING COUNT(DISTINCT p.id) > 0
    `;

    for (const a of analysis) {
      const text = `Product Market Analysis — ${a.category_name} in ${a.state} State:\n- ${Number(a.seller_count)} seller(s) offering ${Number(a.product_count)} product(s)\n- Price range: ₦${Number(a.min_price)?.toLocaleString()} to ₦${Number(a.max_price)?.toLocaleString()} (average: ₦${Math.round(Number(a.avg_price))?.toLocaleString()})\n- Average rating: ${Number(Number(a.avg_rating)).toFixed(1)}/5 (best: ${Number(Number(a.best_rating)).toFixed(1)}/5)`;
      await this.ingestChunk('PRODUCT_MARKET', `${a.state}_${a.category_name}`.replace(/\s+/g, '_'), text, { state: a.state, category: a.category_name, avgPrice: Math.round(Number(a.avg_price)) }, stats);
    }
  }

  // ─── 10. SERVICE MARKET ANALYSIS ───
  private async ingestServiceMarketAnalysis(stats: Record<string, number>) {
    const analysis: any[] = await this.prisma.$queryRaw`
      SELECT mp.state, c.name AS category_name, c.category_type,
             COUNT(DISTINCT s.id) AS service_count, COUNT(DISTINCT s."member_id") AS provider_count,
             AVG(s."starting_price") AS avg_price, MIN(s."starting_price") AS min_price, MAX(s."starting_price") AS max_price,
             AVG(s."average_rating") AS avg_rating, SUM(s."completed_jobs_count") AS total_completed_jobs
      FROM services s
      JOIN member_profiles mp ON s."member_id" = mp.id
      JOIN categories c ON s."category_id" = c.id
      WHERE s."is_active" = true AND s."is_approved" = true
      GROUP BY mp.state, c.name, c.category_type HAVING COUNT(DISTINCT s.id) > 0
    `;

    for (const a of analysis) {
      const text = `Service Market Analysis — ${a.category_name} in ${a.state} State:\n- ${Number(a.provider_count)} provider(s) offering ${Number(a.service_count)} service(s)\n- Price range: ₦${Number(a.min_price)?.toLocaleString()} to ₦${Number(a.max_price)?.toLocaleString()} (average: ₦${Math.round(Number(a.avg_price))?.toLocaleString()})\n- Average rating: ${Number(Number(a.avg_rating)).toFixed(1)}/5\n- Total completed jobs: ${Number(a.total_completed_jobs)}`;
      await this.ingestChunk('SERVICE_MARKET', `svc_${a.state}_${a.category_name}`.replace(/\s+/g, '_'), text, { state: a.state, category: a.category_name }, stats);
    }
  }

  // ─── 11. MARKET GAP ANALYSIS ───
  private async ingestMarketGapAnalysis(stats: Record<string, number>) {
    const memberDensity: any[] = await this.prisma.$queryRaw`
      SELECT mp.state, c.name AS category_name, COUNT(DISTINCT ms."member_id") AS member_count
      FROM member_specializations ms
      JOIN member_profiles mp ON ms."member_id" = mp.id
      JOIN categories c ON ms."category_id" = c.id
      JOIN users u ON mp."user_id" = u.id
      WHERE u."verification_status" = 'VERIFIED' AND mp.state IS NOT NULL
      GROUP BY mp.state, c.name
    `;

    const clientTotals: any[] = await this.prisma.$queryRaw`
      SELECT state, COUNT(*) AS total_clients FROM client_profiles WHERE state IS NOT NULL GROUP BY state
    `;
    const clientTotalMap: Record<string, number> = {};
    for (const ct of clientTotals) clientTotalMap[ct.state] = Number(ct.total_clients);

    const supplyMap: Record<string, Record<string, number>> = {};
    for (const m of memberDensity) {
      if (!supplyMap[m.state]) supplyMap[m.state] = {};
      supplyMap[m.state][m.category_name] = Number(m.member_count);
    }

    const allStates = new Set([...Object.keys(supplyMap), ...Object.keys(clientTotalMap)]);
    for (const state of allStates) {
      const gapEntries: string[] = [];
      const opportunityEntries: string[] = [];
      const categories = supplyMap[state] || {};

      for (const [cat, count] of Object.entries(categories)) {
        const clients = clientTotalMap[state] || 0;
        gapEntries.push(`${cat}: ${count} provider(s), ~${clients} potential clients in state`);
        if (count <= 2 && clients > 5) opportunityEntries.push(`${cat} (few providers, many clients)`);
      }

      if (gapEntries.length === 0) continue;
      const text = `Market Gap Analysis — ${state} State:\nTotal registered clients: ${clientTotalMap[state] || 0}\n\nSupply Breakdown:\n${gapEntries.join('\n')}\n\n${opportunityEntries.length > 0 ? `🔥 High Opportunity Areas:\n${opportunityEntries.join('\n')}` : 'Market relatively balanced.'}`;
      await this.ingestChunk('MARKET_GAP', `gap_${state}`.replace(/\s+/g, '_'), text, { state, totalClients: clientTotalMap[state] || 0 }, stats);
    }
  }

  // ─── 12. SPONSORS ───
  private async ingestSponsors(stats: Record<string, number>) {
    try {
      const sponsors = await (this.prisma as any).sponsorPartner?.findMany?.() ?? await (this.prisma as any).sponsor?.findMany?.() ?? [];
      for (const s of sponsors) {
        const text = `${s.type === 'SPONSOR' ? 'Sponsor' : s.type === 'PARTNER' ? 'Partner' : 'Sponsor & Partner'}: ${s.name}${s.category ? `\nCategory: ${s.category.replace(/_/g, ' ')}` : ''}${s.description ? `\nDescription: ${s.description}` : ''}${s.websiteUrl ? `\nWebsite: ${s.websiteUrl}` : ''}`;
        await this.ingestChunk('SPONSOR', s.id, text, { name: s.name, type: s.type }, stats);
      }
    } catch {
      this.logger.warn('Sponsor/Partner model not found — skipping.');
    }
  }
}