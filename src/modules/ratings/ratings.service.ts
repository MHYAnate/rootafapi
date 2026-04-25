// src/modules/ratings/ratings.service.ts
import {
  Injectable,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { PaginationUtil } from '../../common/utils';
import { VerificationStatus, Prisma } from '@prisma/client';
import { IngestionService } from '../ai/ingestion.service';

type TxClient = Prisma.TransactionClient;

@Injectable()
export class RatingsService {
  constructor(
    private prisma: PrismaService,
    private ingestionService: IngestionService,
  ) {}

  private triggerReindex() {
    this.ingestionService.ingestAll().catch((err) =>
      console.error('RAG re-indexing failed:', err.message),
    );
  }

  // ── Create ─────────────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateRatingDto) {
    // 1. Verify the caller is a verified client
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { clientProfile: true },
    });

    if (!user || user.userType !== 'CLIENT')
      throw new ForbiddenException('Only clients can rate');
    if (user.verificationStatus !== VerificationStatus.VERIFIED)
      throw new ForbiddenException('Only verified clients can rate');
    if (!user.clientProfile)
      throw new ForbiddenException('Client profile required');

    // 2. Duplicate guard
    // For TOOL_LEASE_RATING the uniqueness is (clientId, memberId, ratingCategory)
    // since the Rating model has no toolId column.
    const existing = await this.prisma.rating.findFirst({
      where: {
        clientId:       user.clientProfile.id,
        memberId:       dto.memberId,
        ratingCategory: dto.ratingCategory,
        // Only add productId / serviceId to the where clause when they are
        // actually present — the Rating table has those columns but NOT toolId.
        ...(dto.productId ? { productId: dto.productId } : { productId: null }),
        ...(dto.serviceId ? { serviceId: dto.serviceId } : { serviceId: null }),
      },
    });
    if (existing) throw new ConflictException('You have already rated this');

    // 3. Atomic write
    const rating = await this.prisma.$transaction(async (tx) => {
      const created = await tx.rating.create({
        data: {
          clientId:            user.clientProfile!.id,
          memberId:            dto.memberId,
          ratingCategory:      dto.ratingCategory,
          // Only write columns that exist on the Rating model
          ...(dto.productId && { productId: dto.productId }),
          ...(dto.serviceId && { serviceId: dto.serviceId }),
          // toolId is intentionally omitted — column does not exist in schema
          overallRating:       dto.overallRating,
          qualityRating:       dto.qualityRating,
          communicationRating: dto.communicationRating,
          valueRating:         dto.valueRating,
          timelinessRating:    dto.timelinessRating,
          reviewTitle:         dto.reviewTitle,
          reviewText:          dto.reviewText,
        },
      });

      // Member stats — always recalculate
      await this.updateMemberRating(dto.memberId, tx);

      // Entity-level stats — only when a specific entity is targeted
      if (dto.productId) await this.updateProductRating(dto.productId, tx);
      if (dto.serviceId) await this.updateServiceRating(dto.serviceId, tx);
      // Tool stats are reflected through the member's overall rating aggregate
      // since there is no toolId FK on Rating. Per-tool stats would require a
      // schema migration to add a toolId column to the Rating table.

      return created;
    });

    this.triggerReindex();
    return { message: 'Rating submitted', data: rating };
  }

  // ── Stat helpers ────────────────────────────────────────────────────────────

  private async updateMemberRating(memberId: string, tx: TxClient) {
    const [agg, counts] = await Promise.all([
      tx.rating.aggregate({
        where:  { memberId, status: 'ACTIVE' },
        _avg:   { overallRating: true },
        _count: { overallRating: true },
      }),
      tx.rating.groupBy({
        by:     ['overallRating'],
        where:  { memberId, status: 'ACTIVE' },
        _count: true,
      }),
    ]);

    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    counts.forEach((c) => {
      starCounts[c.overallRating as keyof typeof starCounts] = c._count;
    });

    await tx.memberProfile.update({
      where: { id: memberId },
      data: {
        averageRating:  agg._avg.overallRating ?? 0,
        totalRatings:   agg._count.overallRating,
        oneStarCount:   starCounts[1],
        twoStarCount:   starCounts[2],
        threeStarCount: starCounts[3],
        fourStarCount:  starCounts[4],
        fiveStarCount:  starCounts[5],
      },
    });
  }

  private async updateProductRating(productId: string, tx: TxClient) {
    const agg = await tx.rating.aggregate({
      where:  { productId, status: 'ACTIVE' },
      _avg:   { overallRating: true },
      _count: { overallRating: true },
    });
    await tx.product.update({
      where: { id: productId },
      data: {
        averageRating: agg._avg.overallRating ?? 0,
        totalRatings:  agg._count.overallRating,
      },
    });
  }

  private async updateServiceRating(serviceId: string, tx: TxClient) {
    const agg = await tx.rating.aggregate({
      where:  { serviceId, status: 'ACTIVE' },
      _avg:   { overallRating: true },
      _count: { overallRating: true },
    });
    await tx.service.update({
      where: { id: serviceId },
      data: {
        averageRating: agg._avg.overallRating ?? 0,
        totalRatings:  agg._count.overallRating,
      },
    });
  }

  // ── Read methods ────────────────────────────────────────────────────────────

  async findByMember(memberId: string, page = 1, limit = 12) {
    const { skip, take } = PaginationUtil.getSkipTake(page, limit);
    const [ratings, total] = await Promise.all([
      this.prisma.rating.findMany({
        where:   { memberId, status: 'ACTIVE' },
        include: {
          client:  { include: { user: { select: { fullName: true } } } },
          product: { select: { name: true } },
          service: { select: { name: true } },
          // 'tool' relation omitted — not in the Rating model
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.rating.count({ where: { memberId, status: 'ACTIVE' } }),
    ]);
    return { data: ratings, meta: PaginationUtil.createMeta(total, page, limit) };
  }

  async getMyRatingsGiven(userId: string) {
    const user = await this.prisma.user.findUnique({
      where:   { id: userId },
      include: { clientProfile: true },
    });
    if (!user?.clientProfile) return { data: [] };

    const ratings = await this.prisma.rating.findMany({
      where:   { clientId: user.clientProfile.id },
      include: {
        member:  { include: { user: { select: { fullName: true } } } },
        product: { select: { name: true } },
        service: { select: { name: true } },
        // 'tool' omitted — not in Rating model
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data: ratings };
  }

  async getMyRatingsReceived(userId: string, page = 1, limit = 12) {
    const profile = await this.prisma.memberProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      return { data: [], meta: PaginationUtil.createMeta(0, 1, 12) };
    }
    return this.findByMember(profile.id, page, limit);
  }
}