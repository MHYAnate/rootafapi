// src/modules/ratings/ratings.service.ts
import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { PaginationUtil } from '../../common/utils';
import { VerificationStatus } from '@prisma/client';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateRatingDto) {
    // Verify user is a verified client
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { clientProfile: true } });
    if (!user || user.userType !== 'CLIENT') throw new ForbiddenException('Only clients can rate');
    if (user.verificationStatus !== VerificationStatus.VERIFIED) throw new ForbiddenException('Only verified clients can rate');
    if (!user.clientProfile) throw new ForbiddenException('Client profile required');

    // Check if already rated
    const existing = await this.prisma.rating.findFirst({
      where: { clientId: user.clientProfile.id, memberId: dto.memberId, ratingCategory: dto.ratingCategory, productId: dto.productId || null, serviceId: dto.serviceId || null },
    });
    if (existing) throw new ConflictException('You have already rated this');

    const rating = await this.prisma.rating.create({
      data: {
        clientId: user.clientProfile.id,
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

    // Update member average rating
    await this.updateMemberRating(dto.memberId);
    // Update product/service rating if applicable
    if (dto.productId) await this.updateProductRating(dto.productId);
    if (dto.serviceId) await this.updateServiceRating(dto.serviceId);

    return { message: 'Rating submitted', data: rating };
  }

  private async updateMemberRating(memberId: string) {
    const agg = await this.prisma.rating.aggregate({
      where: { memberId, status: 'ACTIVE' },
      _avg: { overallRating: true },
      _count: { overallRating: true },
    });
    const counts = await this.prisma.rating.groupBy({
      by: ['overallRating'],
      where: { memberId, status: 'ACTIVE' },
      _count: true,
    });

    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    counts.forEach((c) => { starCounts[c.overallRating] = c._count; });

    await this.prisma.memberProfile.update({
      where: { id: memberId },
      data: {
        averageRating: agg._avg.overallRating || 0,
        totalRatings: agg._count.overallRating,
        oneStarCount: starCounts[1],
        twoStarCount: starCounts[2],
        threeStarCount: starCounts[3],
        fourStarCount: starCounts[4],
        fiveStarCount: starCounts[5],
      },
    });
  }

  private async updateProductRating(productId: string) {
    const agg = await this.prisma.rating.aggregate({
      where: { productId, status: 'ACTIVE' },
      _avg: { overallRating: true },
      _count: { overallRating: true },
    });
    await this.prisma.product.update({
      where: { id: productId },
      data: { averageRating: agg._avg.overallRating || 0, totalRatings: agg._count.overallRating },
    });
  }

  private async updateServiceRating(serviceId: string) {
    const agg = await this.prisma.rating.aggregate({
      where: { serviceId, status: 'ACTIVE' },
      _avg: { overallRating: true },
      _count: { overallRating: true },
    });
    await this.prisma.service.update({
      where: { id: serviceId },
      data: { averageRating: agg._avg.overallRating || 0, totalRatings: agg._count.overallRating },
    });
  }

  async findByMember(memberId: string, page: number = 1, limit: number = 12) {
    const { skip, take } = PaginationUtil.getSkipTake(page, limit);
    const [ratings, total] = await Promise.all([
      this.prisma.rating.findMany({
        where: { memberId, status: 'ACTIVE' },
        include: { client: { include: { user: { select: { fullName: true } } } }, product: { select: { name: true } }, service: { select: { name: true } } },
        skip, take, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.rating.count({ where: { memberId, status: 'ACTIVE' } }),
    ]);
    return { data: ratings, meta: PaginationUtil.createMeta(total, page, limit) };
  }

  async getMyRatingsGiven(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { clientProfile: true } });
    if (!user?.clientProfile) return { data: [] };
    const ratings = await this.prisma.rating.findMany({
      where: { clientId: user.clientProfile.id },
      include: { member: { include: { user: { select: { fullName: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: ratings };
  }

  async getMyRatingsReceived(userId: string, page: number = 1, limit: number = 12) {
    const profile = await this.prisma.memberProfile.findUnique({ where: { userId } });
    if (!profile) return { data: [], meta: PaginationUtil.createMeta(0, 1, 12) };
    return this.findByMember(profile.id, page, limit);
  }
}