// src/modules/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalMembers, totalClients, pendingVerifications, totalProducts, totalServices, totalTools, totalRatings] = await Promise.all([
      this.prisma.user.count({ where: { userType: 'MEMBER' } }),
      this.prisma.user.count({ where: { userType: 'CLIENT' } }),
      this.prisma.user.count({ where: { verificationStatus: { in: ['PENDING', 'RESUBMITTED'] } } }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.service.count({ where: { isActive: true } }),
      this.prisma.tool.count({ where: { isActive: true } }),
      this.prisma.rating.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      data: {
        totalMembers, totalClients, pendingVerifications,
        totalProducts, totalServices, totalTools, totalRatings,
        totalUsers: totalMembers + totalClients,
      },
    };
  }

  async getVerificationStats() {
    const stats = await this.prisma.user.groupBy({ by: ['verificationStatus'], _count: true });
    return { data: stats };
  }

  async getMembersByState() {
    const stats = await this.prisma.memberProfile.groupBy({
      by: ['state'],
      _count: true,
      where: { user: { verificationStatus: 'VERIFIED' } },
      orderBy: { _count: { state: 'desc' } },
    });
    return { data: stats };
  }

  async getRecentActivity(limit: number = 20) {
    const logs = await this.prisma.adminActivityLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { admin: { select: { fullName: true, username: true } } },
    });
    return { data: logs };
  }
}