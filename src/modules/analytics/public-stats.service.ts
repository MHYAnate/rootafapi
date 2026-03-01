// src/modules/analytics/public-stats.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PublicStatsService {
  constructor(private readonly prisma: PrismaService) {}

  private monthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  private lastMonthRange(): { start: Date; end: Date } {
    const now = new Date();
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),
    };
  }

  private growth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  async getPublicStats() {
    const monthStart = this.monthStart();
    const lastMonth = this.lastMonthRange();

    const [
      // ── Members ──
      verifiedMembers,
      membersByType,
      newMembersThisMonth,
      newMembersLastMonth,

      // ── Clients ──
      totalClients,
      verifiedClients,
      newClientsThisMonth,
      newClientsLastMonth,

      // ── Products ──
      totalProducts,
      activeProducts,
      agriculturalProducts,
      artisanProducts,
      newProductsThisMonth,
      newProductsLastMonth,

      // ── Services ──
      totalServices,
      activeServices,
      farmingServices,
      artisanServices,
      newServicesThisMonth,
      newServicesLastMonth,

      // ── Tools ──
      totalTools,
      activeTools,
      toolsByPurpose,
      newToolsThisMonth,
      newToolsLastMonth,

      // ── Transactions ──
      txAll,
      txThisMonth,
      txLastMonth,

      // ── Ratings ──
      ratingAgg,
      ratingsThisMonth,

      // ── Coverage ──
      statesCount,
      lgasCount,
      topStates,

      // ── Engagement aggregates ──
      profileViews,
      productViews,
      serviceViews,
      toolViews,
    ] = await Promise.all([
      // Members
      this.prisma.user.count({
        where: { userType: 'MEMBER', verificationStatus: 'VERIFIED', isActive: true },
      }),
      this.prisma.memberProfile.groupBy({
        by: ['providerType'],
        _count: { _all: true },
      }),
      this.prisma.user.count({
        where: { userType: 'MEMBER', createdAt: { gte: monthStart } },
      }),
      this.prisma.user.count({
        where: {
          userType: 'MEMBER',
          createdAt: { gte: lastMonth.start, lte: lastMonth.end },
        },
      }),

      // Clients
      this.prisma.user.count({
        where: { userType: 'CLIENT', isActive: true },
      }),
      this.prisma.user.count({
        where: { userType: 'CLIENT', verificationStatus: 'VERIFIED', isActive: true },
      }),
      this.prisma.user.count({
        where: { userType: 'CLIENT', createdAt: { gte: monthStart } },
      }),
      this.prisma.user.count({
        where: {
          userType: 'CLIENT',
          createdAt: { gte: lastMonth.start, lte: lastMonth.end },
        },
      }),

      // Products
      this.prisma.product.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.count({
        where: {
          isActive: true,
          category: { categoryType: 'PRODUCT_AGRICULTURAL' },
        },
      }),
      this.prisma.product.count({
        where: {
          isActive: true,
          category: { categoryType: 'PRODUCT_ARTISAN' },
        },
      }),
      this.prisma.product.count({
        where: { createdAt: { gte: monthStart } },
      }),
      this.prisma.product.count({
        where: { createdAt: { gte: lastMonth.start, lte: lastMonth.end } },
      }),

      // Services
      this.prisma.service.count(),
      this.prisma.service.count({ where: { isActive: true } }),
      this.prisma.service.count({
        where: {
          isActive: true,
          category: { categoryType: 'SERVICE_FARMING' },
        },
      }),
      this.prisma.service.count({
        where: {
          isActive: true,
          category: { categoryType: 'SERVICE_ARTISAN' },
        },
      }),
      this.prisma.service.count({
        where: { createdAt: { gte: monthStart } },
      }),
      this.prisma.service.count({
        where: { createdAt: { gte: lastMonth.start, lte: lastMonth.end } },
      }),

      // Tools
      this.prisma.tool.count(),
      this.prisma.tool.count({ where: { isActive: true } }),
      this.prisma.tool.groupBy({
        by: ['listingPurpose'],
        where: { isActive: true },
        _count: { _all: true },
      }),
      this.prisma.tool.count({
        where: { createdAt: { gte: monthStart } },
      }),
      this.prisma.tool.count({
        where: { createdAt: { gte: lastMonth.start, lte: lastMonth.end } },
      }),

      // Transactions
      this.prisma.transaction.aggregate({
        _count: { _all: true },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { createdAt: { gte: monthStart } },
        _count: { _all: true },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { createdAt: { gte: lastMonth.start, lte: lastMonth.end } },
        _count: { _all: true },
      }),

      // Ratings
      this.prisma.rating.aggregate({
        where: { status: 'ACTIVE' },
        _count: { _all: true },
        _avg: { overallRating: true },
      }),
      this.prisma.rating.count({
        where: { status: 'ACTIVE', createdAt: { gte: monthStart } },
      }),

      // Coverage
      this.prisma.nigerianState.count({ where: { isActive: true } }),
      this.prisma.nigerianLGA.count({ where: { isActive: true } }),
      this.prisma.memberProfile.groupBy({
        by: ['state'],
        _count: { _all: true },
        where: { user: { verificationStatus: 'VERIFIED', isActive: true } },
        orderBy: { _count: { state: 'desc' } },
        take: 5,
      }),

      // Engagement - aggregate view counts from models directly
      this.prisma.memberProfile.aggregate({ _sum: { profileViewCount: true } }),
      this.prisma.product.aggregate({ _sum: { viewCount: true } }),
      this.prisma.service.aggregate({ _sum: { viewCount: true } }),
      this.prisma.tool.aggregate({ _sum: { viewCount: true } }),
    ]);

    // ── Process member types ──
    const typeMap: Record<string, number> = {};
    membersByType.forEach((m) => {
      typeMap[m.providerType] = m._count._all;
    });

    // ── Process tool purposes ──
    const purposeMap: Record<string, number> = {};
    toolsByPurpose.forEach((t) => {
      purposeMap[t.listingPurpose] = t._count._all;
    });

    return {
      data: {
        members: {
          total: verifiedMembers,
          farmers: typeMap['FARMER'] || 0,
          artisans: typeMap['ARTISAN'] || 0,
          both: typeMap['BOTH'] || 0,
          newThisMonth: newMembersThisMonth,
          growthPercentage: this.growth(newMembersThisMonth, newMembersLastMonth),
          verified: verifiedMembers,
        },
        clients: {
          total: totalClients,
          verified: verifiedClients,
          newThisMonth: newClientsThisMonth,
          growthPercentage: this.growth(newClientsThisMonth, newClientsLastMonth),
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          agricultural: agriculturalProducts,
          artisan: artisanProducts,
          newThisMonth: newProductsThisMonth,
          growthPercentage: this.growth(newProductsThisMonth, newProductsLastMonth),
        },
        services: {
          total: totalServices,
          active: activeServices,
          farming: farmingServices,
          artisan: artisanServices,
          newThisMonth: newServicesThisMonth,
          growthPercentage: this.growth(newServicesThisMonth, newServicesLastMonth),
        },
        tools: {
          total: totalTools,
          active: activeTools,
          forSale: (purposeMap['FOR_SALE'] || 0) + (purposeMap['BOTH'] || 0),
          forLease: (purposeMap['FOR_LEASE'] || 0) + (purposeMap['BOTH'] || 0),
          newThisMonth: newToolsThisMonth,
          growthPercentage: this.growth(newToolsThisMonth, newToolsLastMonth),
        },
        transactions: {
          totalCount: txAll._count._all,
          totalAmount: Number(txAll._sum.amount) || 0,
          thisMonthCount: txThisMonth._count._all,
          thisMonthAmount: Number(txThisMonth._sum.amount) || 0,
          growthPercentage: this.growth(
            txThisMonth._count._all,
            txLastMonth._count._all,
          ),
        },
        ratings: {
          totalCount: ratingAgg._count._all,
          averageRating: Number(ratingAgg._avg.overallRating?.toFixed(1)) || 0,
          thisMonthCount: ratingsThisMonth,
        },
        coverage: {
          statesCount,
          lgasCount,
          topStates: topStates.map((s) => ({
            name: s.state,
            memberCount: s._count._all,
          })),
        },
        engagement: {
          totalProfileViews: profileViews._sum.profileViewCount || 0,
          totalProductViews: productViews._sum.viewCount || 0,
          totalServiceViews: serviceViews._sum.viewCount || 0,
          totalToolViews: toolViews._sum.viewCount || 0,
        },
      },
    };
  }
}