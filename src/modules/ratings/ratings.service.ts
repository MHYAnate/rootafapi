// // src/modules/ratings/ratings.service.ts
// import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
// import { PrismaService } from '../../prisma/prisma.service';
// import { CreateRatingDto } from './dto/create-rating.dto';
// import { PaginationUtil } from '../../common/utils';
// import { VerificationStatus } from '@prisma/client';

// @Injectable()
// export class RatingsService {
//   constructor(private prisma: PrismaService) {}

//   async create(userId: string, dto: CreateRatingDto) {
//     // Verify user is a verified client
//     const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { clientProfile: true } });
//     if (!user || user.userType !== 'CLIENT') throw new ForbiddenException('Only clients can rate');
//     if (user.verificationStatus !== VerificationStatus.VERIFIED) throw new ForbiddenException('Only verified clients can rate');
//     if (!user.clientProfile) throw new ForbiddenException('Client profile required');

//     // Check if already rated
//     const existing = await this.prisma.rating.findFirst({
//       where: { clientId: user.clientProfile.id, memberId: dto.memberId, ratingCategory: dto.ratingCategory, productId: dto.productId || null, serviceId: dto.serviceId || null },
//     });
//     if (existing) throw new ConflictException('You have already rated this');

//     const rating = await this.prisma.rating.create({
//       data: {
//         clientId: user.clientProfile.id,
//         memberId: dto.memberId,
//         ratingCategory: dto.ratingCategory,
//         productId: dto.productId,
//         serviceId: dto.serviceId,
//         overallRating: dto.overallRating,
//         qualityRating: dto.qualityRating,
//         communicationRating: dto.communicationRating,
//         valueRating: dto.valueRating,
//         timelinessRating: dto.timelinessRating,
//         reviewTitle: dto.reviewTitle,
//         reviewText: dto.reviewText,
//       },
//     });

//     // Update member average rating
//     await this.updateMemberRating(dto.memberId);
//     // Update product/service rating if applicable
//     if (dto.productId) await this.updateProductRating(dto.productId);
//     if (dto.serviceId) await this.updateServiceRating(dto.serviceId);

//     return { message: 'Rating submitted', data: rating };
//   }

//   private async updateMemberRating(memberId: string) {
//     const agg = await this.prisma.rating.aggregate({
//       where: { memberId, status: 'ACTIVE' },
//       _avg: { overallRating: true },
//       _count: { overallRating: true },
//     });
//     const counts = await this.prisma.rating.groupBy({
//       by: ['overallRating'],
//       where: { memberId, status: 'ACTIVE' },
//       _count: true,
//     });

//     const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
//     counts.forEach((c) => { starCounts[c.overallRating] = c._count; });

//     await this.prisma.memberProfile.update({
//       where: { id: memberId },
//       data: {
//         averageRating: agg._avg.overallRating || 0,
//         totalRatings: agg._count.overallRating,
//         oneStarCount: starCounts[1],
//         twoStarCount: starCounts[2],
//         threeStarCount: starCounts[3],
//         fourStarCount: starCounts[4],
//         fiveStarCount: starCounts[5],
//       },
//     });
//   }

//   private async updateProductRating(productId: string) {
//     const agg = await this.prisma.rating.aggregate({
//       where: { productId, status: 'ACTIVE' },
//       _avg: { overallRating: true },
//       _count: { overallRating: true },
//     });
//     await this.prisma.product.update({
//       where: { id: productId },
//       data: { averageRating: agg._avg.overallRating || 0, totalRatings: agg._count.overallRating },
//     });
//   }

//   private async updateServiceRating(serviceId: string) {
//     const agg = await this.prisma.rating.aggregate({
//       where: { serviceId, status: 'ACTIVE' },
//       _avg: { overallRating: true },
//       _count: { overallRating: true },
//     });
//     await this.prisma.service.update({
//       where: { id: serviceId },
//       data: { averageRating: agg._avg.overallRating || 0, totalRatings: agg._count.overallRating },
//     });
//   }

//   async findByMember(memberId: string, page: number = 1, limit: number = 12) {
//     const { skip, take } = PaginationUtil.getSkipTake(page, limit);
//     const [ratings, total] = await Promise.all([
//       this.prisma.rating.findMany({
//         where: { memberId, status: 'ACTIVE' },
//         include: { client: { include: { user: { select: { fullName: true } } } }, product: { select: { name: true } }, service: { select: { name: true } } },
//         skip, take, orderBy: { createdAt: 'desc' },
//       }),
//       this.prisma.rating.count({ where: { memberId, status: 'ACTIVE' } }),
//     ]);
//     return { data: ratings, meta: PaginationUtil.createMeta(total, page, limit) };
//   }

//   async getMyRatingsGiven(userId: string) {
//     const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { clientProfile: true } });
//     if (!user?.clientProfile) return { data: [] };
//     const ratings = await this.prisma.rating.findMany({
//       where: { clientId: user.clientProfile.id },
//       include: { member: { include: { user: { select: { fullName: true } } } } },
//       orderBy: { createdAt: 'desc' },
//     });
//     return { data: ratings };
//   }

//   async getMyRatingsReceived(userId: string, page: number = 1, limit: number = 12) {
//     const profile = await this.prisma.memberProfile.findUnique({ where: { userId } });
//     if (!profile) return { data: [], meta: PaginationUtil.createMeta(0, 1, 12) };
//     return this.findByMember(profile.id, page, limit);
//   }
// }
// src/modules/ratings/ratings.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { PaginationUtil } from '../../common/utils';
import { VerificationStatus, Prisma } from '@prisma/client';

// Use Prisma's own transaction client type so helpers stay type-safe
// whether called inside or outside a transaction.
type TxClient = Prisma.TransactionClient;

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateRatingDto) {
    // ── 1. Verify the caller is a verified client ──────────────────────────
    // Single query – fetch user + clientProfile together to avoid N+1.
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

    // ── 2. Duplicate guard (explicit check for a clear 409 message) ────────
    // The DB unique constraint on (clientId, memberId, ratingCategory,
    // productId, serviceId) would also catch this, but throwing
    // ConflictException here gives a friendlier error than a raw P2002.
    const existing = await this.prisma.rating.findFirst({
      where: {
        clientId: user.clientProfile.id,
        memberId: dto.memberId,
        ratingCategory: dto.ratingCategory,
        productId: dto.productId ?? null,
        serviceId: dto.serviceId ?? null,
      },
    });
    if (existing) throw new ConflictException('You have already rated this');

    // ── 3. Atomic write: insert + all stat updates in one transaction ──────
    //
    // FIX: previously the rating row was committed first, then the three
    // stat-update helpers were awaited sequentially outside any transaction.
    // If updateMemberRating (or either of the conditional helpers) threw,
    // the Rating row was left committed but the denormalized counters on
    // MemberProfile / Product / Service became permanently stale.
    //
    // prisma.$transaction(callback) runs everything inside a single
    // Postgres transaction. Any unhandled error inside the callback causes
    // an automatic ROLLBACK, so either all five writes succeed together or
    // none of them do.
    const rating = await this.prisma.$transaction(async (tx) => {
      const created = await tx.rating.create({
        data: {
          clientId: user.clientProfile!.id,
          memberId: dto.memberId,
          ratingCategory: dto.ratingCategory,
          productId: dto.productId,
          serviceId: dto.serviceId,
          overallRating: dto.overallRating,
          qualityRating: dto.qualityRating,
          communicationRating: dto.communicationRating,
          valueRating: dto.valueRating,
          timelinessRating: dto.timelinessRating,
          reviewTitle: dto.reviewTitle,
          reviewText: dto.reviewText,
        },
      });

      // Member stats always recalculated (mandatory).
      await this.updateMemberRating(dto.memberId, tx);

      // Product / service stats only when the rating targets one.
      if (dto.productId) await this.updateProductRating(dto.productId, tx);
      if (dto.serviceId) await this.updateServiceRating(dto.serviceId, tx);

      return created;
    });

    return { message: 'Rating submitted', data: rating };
  }

  // ── Private stat-recalculation helpers ────────────────────────────────────
  //
  // Each helper now accepts a `tx` parameter (Prisma.TransactionClient).
  // When called from inside $transaction they share the same connection and
  // transaction context. This also makes them independently testable by
  // passing a mock or a test transaction client.

  private async updateMemberRating(memberId: string, tx: TxClient) {
    // One aggregate for average + total, one groupBy for per-star counts.
    // Both filter to ACTIVE so hidden/removed ratings don't skew the stats.
    const [agg, counts] = await Promise.all([
      tx.rating.aggregate({
        where: { memberId, status: 'ACTIVE' },
        _avg: { overallRating: true },
        _count: { overallRating: true },
      }),
      tx.rating.groupBy({
        by: ['overallRating'],
        where: { memberId, status: 'ACTIVE' },
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
        averageRating: agg._avg.overallRating ?? 0,
        totalRatings: agg._count.overallRating,
        oneStarCount: starCounts[1],
        twoStarCount: starCounts[2],
        threeStarCount: starCounts[3],
        fourStarCount: starCounts[4],
        fiveStarCount: starCounts[5],
      },
    });
  }

  private async updateProductRating(productId: string, tx: TxClient) {
    const agg = await tx.rating.aggregate({
      where: { productId, status: 'ACTIVE' },
      _avg: { overallRating: true },
      _count: { overallRating: true },
    });
    await tx.product.update({
      where: { id: productId },
      data: {
        averageRating: agg._avg.overallRating ?? 0,
        totalRatings: agg._count.overallRating,
      },
    });
  }

  private async updateServiceRating(serviceId: string, tx: TxClient) {
    const agg = await tx.rating.aggregate({
      where: { serviceId, status: 'ACTIVE' },
      _avg: { overallRating: true },
      _count: { overallRating: true },
    });
    await tx.service.update({
      where: { id: serviceId },
      data: {
        averageRating: agg._avg.overallRating ?? 0,
        totalRatings: agg._count.overallRating,
      },
    });
  }

  // ── Read methods (unchanged) ───────────────────────────────────────────────

  async findByMember(memberId: string, page = 1, limit = 12) {
    const { skip, take } = PaginationUtil.getSkipTake(page, limit);
    const [ratings, total] = await Promise.all([
      this.prisma.rating.findMany({
        where: { memberId, status: 'ACTIVE' },
        include: {
          client: { include: { user: { select: { fullName: true } } } },
          product: { select: { name: true } },
          service: { select: { name: true } },
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
      where: { id: userId },
      include: { clientProfile: true },
    });
    if (!user?.clientProfile) return { data: [] };
    const ratings = await this.prisma.rating.findMany({
      where: { clientId: user.clientProfile.id },
      include: { member: { include: { user: { select: { fullName: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: ratings };
  }

  async getMyRatingsReceived(userId: string, page = 1, limit = 12) {
    const profile = await this.prisma.memberProfile.findUnique({ where: { userId } });
    if (!profile) return { data: [], meta: PaginationUtil.createMeta(0, 1, 12) };
    return this.findByMember(profile.id, page, limit);
  }
}