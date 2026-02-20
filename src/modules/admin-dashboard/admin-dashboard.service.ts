import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationUtil } from '../../common/utils';
import { VerificationStatus, UserType } from '@prisma/client';

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════
  // MAIN DASHBOARD OVERVIEW
  // ═══════════════════════════════════════════════════════════
  async getOverview() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      // Total counts
      totalUsers,
      totalMembers,
      totalClients,
      verifiedMembers,
      verifiedClients,
      // Pending counts
      pendingVerifications,
      pendingPasswordResets,
      // Listing counts
      totalProducts,
      totalServices,
      totalTools,
      // Engagement
      totalRatings,
      totalTransactions,
      // Content counts
      totalEvents,
      totalSponsors,
      totalTestimonials,
      totalCertificates,
      // Time-based counts
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      newProductsThisWeek,
      newServicesThisWeek,
      // Suspended
      suspendedUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { userType: UserType.MEMBER } }),
      this.prisma.user.count({ where: { userType: UserType.CLIENT } }),
      this.prisma.user.count({
        where: { userType: UserType.MEMBER, verificationStatus: VerificationStatus.VERIFIED },
      }),
      this.prisma.user.count({
        where: { userType: UserType.CLIENT, verificationStatus: VerificationStatus.VERIFIED },
      }),
      this.prisma.user.count({
        where: {
          verificationStatus: {
            in: [VerificationStatus.PENDING, VerificationStatus.RESUBMITTED],
          },
        },
      }),
      this.prisma.passwordResetRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.service.count({ where: { isActive: true } }),
      this.prisma.tool.count({ where: { isActive: true } }),
      this.prisma.rating.count({ where: { status: 'ACTIVE' } }),
      this.prisma.transaction.count(),
      this.prisma.event.count(),
      this.prisma.sponsorPartner.count({ where: { isActive: true } }),
      this.prisma.testimonial.count({ where: { isApproved: true } }),
      this.prisma.certificate.count(),
      this.prisma.user.count({ where: { createdAt: { gte: today } } }),
      this.prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.product.count({
        where: { createdAt: { gte: sevenDaysAgo }, isActive: true },
      }),
      this.prisma.service.count({
        where: { createdAt: { gte: sevenDaysAgo }, isActive: true },
      }),
      this.prisma.user.count({
        where: { verificationStatus: VerificationStatus.SUSPENDED },
      }),
    ]);

    // Recent registrations
    const recentUsers = await this.prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        userType: true,
        verificationStatus: true,
        createdAt: true,
      },
    });

    // Recent admin activity
    const recentActivity = await this.prisma.adminActivityLog.findMany({
      take: 15,
      orderBy: { createdAt: 'desc' },
      include: { admin: { select: { fullName: true, username: true } } },
    });

    // Reported content
    const pendingReports = await this.prisma.contentReport.count({
      where: { status: 'pending' },
    });

    // Verification breakdown by user type
    const memberVerificationStatus = await this.prisma.user.groupBy({
      by: ['verificationStatus'],
      where: { userType: UserType.MEMBER },
      _count: true,
    });

    const clientVerificationStatus = await this.prisma.user.groupBy({
      by: ['verificationStatus'],
      where: { userType: UserType.CLIENT },
      _count: true,
    });

    // Members by state (top 10)
    const membersByState = await this.prisma.memberProfile.groupBy({
      by: ['state'],
      _count: true,
      where: { user: { verificationStatus: VerificationStatus.VERIFIED } },
      orderBy: { _count: { state: 'desc' } },
      take: 10,
    });

    // Members by provider type
    const membersByType = await this.prisma.memberProfile.groupBy({
      by: ['providerType'],
      _count: true,
      where: { user: { verificationStatus: VerificationStatus.VERIFIED } },
    });

    return {
      data: {
        counts: {
          totalUsers,
          totalMembers,
          totalClients,
          verifiedMembers,
          verifiedClients,
          pendingVerifications,
          pendingPasswordResets,
          pendingReports,
          suspendedUsers,
          totalProducts,
          totalServices,
          totalTools,
          totalRatings,
          totalTransactions,
          totalEvents,
          totalSponsors,
          totalTestimonials,
          totalCertificates,
        },
        trends: {
          newUsersToday,
          newUsersThisWeek,
          newUsersThisMonth,
          newProductsThisWeek,
          newServicesThisWeek,
        },
        breakdowns: {
          memberVerificationStatus,
          clientVerificationStatus,
          membersByState,
          membersByType,
        },
        recentUsers,
        recentActivity,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════
  // ADMIN ACTIVITY LOG
  // ═══════════════════════════════════════════════════════════
  async getActivityLog(
    page: number = 1,
    limit: number = 20,
    adminId?: string,
    actionType?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const { skip, take } = PaginationUtil.getSkipTake(page, limit);
    const where: any = {};

    if (adminId) where.adminId = adminId;
    if (actionType) where.actionType = actionType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      this.prisma.adminActivityLog.findMany({
        where,
        include: {
          admin: { select: { id: true, fullName: true, username: true, role: true } },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.adminActivityLog.count({ where }),
    ]);

    return { data: logs, meta: PaginationUtil.createMeta(total, page, limit) };
  }

  // ═══════════════════════════════════════════════════════════
  // CONTENT REPORTS
  // ═══════════════════════════════════════════════════════════
  async getContentReports(page: number = 1, limit: number = 12, status?: string) {
    const { skip, take } = PaginationUtil.getSkipTake(page, limit);
    const where: any = {};
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      this.prisma.contentReport.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contentReport.count({ where }),
    ]);

    return { data: reports, meta: PaginationUtil.createMeta(total, page, limit) };
  }

  async resolveContentReport(
    reportId: string,
    adminId: string,
    resolution: string,
    notes: string,
    actionTaken: string,
  ) {
    await this.prisma.contentReport.update({
      where: { id: reportId },
      data: {
        status: 'resolved',
        resolution,
        resolutionNotes: notes,
        actionTaken,
        reviewedByAdminId: adminId,
        reviewedAt: new Date(),
      },
    });

    return { message: 'Report resolved' };
  }

  // ═══════════════════════════════════════════════════════════
  // MANAGE LISTINGS (Products, Services, Tools)
  // ═══════════════════════════════════════════════════════════
  async toggleListingFeatured(
    type: 'product' | 'service' | 'tool',
    listingId: string,
    adminId: string,
  ) {
    let current: any;
    let updated: any;

    switch (type) {
      case 'product':
        current = await this.prisma.product.findUnique({
          where: { id: listingId },
        });
        if (!current) throw new Error('Product not found');
        updated = await this.prisma.product.update({
          where: { id: listingId },
          data: { isFeatured: !current.isFeatured },
        });
        break;
      case 'service':
        current = await this.prisma.service.findUnique({
          where: { id: listingId },
        });
        if (!current) throw new Error('Service not found');
        updated = await this.prisma.service.update({
          where: { id: listingId },
          data: { isFeatured: !current.isFeatured },
        });
        break;
      case 'tool':
        current = await this.prisma.tool.findUnique({
          where: { id: listingId },
        });
        if (!current) throw new Error('Tool not found');
        updated = await this.prisma.tool.update({
          where: { id: listingId },
          data: { isFeatured: !current.isFeatured },
        });
        break;
    }

    await this.prisma.adminActivityLog.create({
      data: {
        adminId,
        actionType: 'OTHER' as any,
        actionDescription: `${updated.isFeatured ? 'Featured' : 'Unfeatured'} ${type}: ${current.name}`,
        targetType: type,
        targetId: listingId,
        targetName: current.name,
      },
    });

    return {
      message: `${type} ${updated.isFeatured ? 'featured' : 'unfeatured'}`,
      data: updated,
    };
  }

  async deactivateListing(
    type: 'product' | 'service' | 'tool',
    listingId: string,
    adminId: string,
    reason: string,
  ) {
    switch (type) {
      case 'product':
        await this.prisma.product.update({
          where: { id: listingId },
          data: { isActive: false },
        });
        break;
      case 'service':
        await this.prisma.service.update({
          where: { id: listingId },
          data: { isActive: false },
        });
        break;
      case 'tool':
        await this.prisma.tool.update({
          where: { id: listingId },
          data: { isActive: false },
        });
        break;
    }

    await this.prisma.adminActivityLog.create({
      data: {
        adminId,
        actionType: 'OTHER' as any,
        actionDescription: `Deactivated ${type} (${listingId}): ${reason}`,
        targetType: type,
        targetId: listingId,
      },
    });

    return { message: `${type} deactivated by admin` };
  }

  // ═══════════════════════════════════════════════════════════
  // MANAGE RATINGS (Moderation)
  // ═══════════════════════════════════════════════════════════
  async getReportedRatings(page: number = 1, limit: number = 12) {
    const { skip, take } = PaginationUtil.getSkipTake(page, limit);
    const where = { isReported: true, status: 'ACTIVE' as any };

    const [ratings, total] = await Promise.all([
      this.prisma.rating.findMany({
        where,
        include: {
          client: { include: { user: { select: { fullName: true } } } },
          member: { include: { user: { select: { fullName: true } } } },
          product: { select: { name: true } },
          service: { select: { name: true } },
        },
        skip,
        take,
        orderBy: { reportCount: 'desc' },
      }),
      this.prisma.rating.count({ where }),
    ]);

    return { data: ratings, meta: PaginationUtil.createMeta(total, page, limit) };
  }

  async moderateRating(
    ratingId: string,
    adminId: string,
    action: 'hide' | 'remove' | 'dismiss',
    notes?: string,
  ) {
    const statusMap = {
      hide: 'HIDDEN',
      remove: 'REMOVED',
      dismiss: 'ACTIVE',
    };

    await this.prisma.rating.update({
      where: { id: ratingId },
      data: {
        status: statusMap[action] as any,
        moderatedByAdminId: adminId,
        moderatedAt: new Date(),
        moderationNotes: notes,
        isReported: action === 'dismiss' ? false : undefined,
      },
    });

    return { message: `Rating ${action}${action === 'dismiss' ? 'ed' : 'd'}` };
  }

  // ═══════════════════════════════════════════════════════════
  // ANNOUNCEMENTS MANAGEMENT
  // ═══════════════════════════════════════════════════════════
  async createAnnouncement(data: any, adminId: string) {
    const announcement = await this.prisma.announcement.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        createdByAdminId: adminId,
      },
    });

    await this.prisma.adminActivityLog.create({
      data: {
        adminId,
        actionType: 'OTHER' as any,
        actionDescription: `Created announcement: ${data.title}`,
        targetType: 'announcement',
        targetId: announcement.id,
        targetName: data.title,
      },
    });

    return { message: 'Announcement created', data: announcement };
  }

  async getAnnouncements(page: number = 1, limit: number = 20) {
    const { skip, take } = PaginationUtil.getSkipTake(page, limit);
    const [announcements, total] = await Promise.all([
      this.prisma.announcement.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.announcement.count(),
    ]);
    return {
      data: announcements,
      meta: PaginationUtil.createMeta(total, page, limit),
    };
  }

  async updateAnnouncement(id: string, data: any) {
    const updated = await this.prisma.announcement.update({
      where: { id },
      data,
    });
    return { message: 'Announcement updated', data: updated };
  }

  async deleteAnnouncement(id: string) {
    await this.prisma.announcement.delete({ where: { id } });
    return { message: 'Announcement deleted' };
  }

  // ═══════════════════════════════════════════════════════════
  // FAQs MANAGEMENT
  // ═══════════════════════════════════════════════════════════
  async createFaq(data: any) {
    const faq = await this.prisma.fAQ.create({ data });
    return { message: 'FAQ created', data: faq };
  }

  async getAllFaqs() {
    const faqs = await this.prisma.fAQ.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return { data: faqs };
  }

  async updateFaq(id: string, data: any) {
    const faq = await this.prisma.fAQ.update({ where: { id }, data });
    return { message: 'FAQ updated', data: faq };
  }

  async deleteFaq(id: string) {
    await this.prisma.fAQ.delete({ where: { id } });
    return { message: 'FAQ deleted' };
  }

  // ═══════════════════════════════════════════════════════════
  // FEATURE MEMBER PROFILE
  // ═══════════════════════════════════════════════════════════
  async toggleMemberFeatured(memberId: string, adminId: string) {
    const member = await this.prisma.memberProfile.findUnique({
      where: { id: memberId },
      include: { user: { select: { fullName: true } } },
    });
    if (!member) throw new Error('Member not found');

    const updated = await this.prisma.memberProfile.update({
      where: { id: memberId },
      data: { isFeatured: !member.isFeatured },
    });

    await this.prisma.adminActivityLog.create({
      data: {
        adminId,
        actionType: 'OTHER' as any,
        actionDescription: `${updated.isFeatured ? 'Featured' : 'Unfeatured'} member: ${member.user.fullName}`,
        targetType: 'member',
        targetId: memberId,
        targetName: member.user.fullName,
      },
    });

    return {
      message: `Member ${updated.isFeatured ? 'featured' : 'unfeatured'}`,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // DATA EXPORT
  // ═══════════════════════════════════════════════════════════
  async exportUsers(userType?: string) {
    const where: any = {};
    if (userType) where.userType = userType;

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        email: true,
        userType: true,
        verificationStatus: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        memberProfile: {
          select: {
            providerType: true,
            state: true,
            localGovernmentArea: true,
            averageRating: true,
            totalProducts: true,
            totalServices: true,
          },
        },
        clientProfile: {
          select: { state: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data: users };
  }

  async exportTransactions(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate);
      if (endDate) where.transactionDate.lte = new Date(endDate);
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        member: {
          select: { user: { select: { fullName: true, phoneNumber: true } } },
        },
        product: { select: { name: true } },
        service: { select: { name: true } },
        tool: { select: { name: true } },
      },
      orderBy: { transactionDate: 'desc' },
    });

    return { data: transactions };
  }
}