import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  VerificationStatus,
  AdminActionType,
  DocumentVerificationStatus,
  UserType,
} from '@prisma/client';
import { PaginationUtil, PasswordUtil } from '../../common/utils';

@Injectable()
export class VerificationService {
  constructor(private prisma: PrismaService) {}

  private async logAdminAction(
    adminId: string,
    actionType: AdminActionType,
    description: string,
    targetType: string,
    targetId: string,
    targetName: string,
  ) {
    await this.prisma.adminActivityLog.create({
      data: {
        adminId,
        actionType,
        actionDescription: description,
        targetType,
        targetId,
        targetName,
      },
    });
  }

  // ═══════════════════════════════════════════════════════════
  // GET ALL PENDING VERIFICATIONS
  // ═══════════════════════════════════════════════════════════
  async getPendingVerifications(
    page: number = 1,
    limit: number = 12,
    userType?: string,
  ) {
    const { skip, take } = PaginationUtil.getSkipTake(page, limit);

    const where: any = {
      verificationStatus: {
        in: [VerificationStatus.PENDING, VerificationStatus.RESUBMITTED],
      },
    };
    if (userType) where.userType = userType;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          phoneNumber: true,
          fullName: true,
          email: true,
          userType: true,
          verificationStatus: true,
          verificationSubmittedAt: true,
          resubmissionCount: true,
          createdAt: true,
          verificationDocuments: {
            select: { id: true, documentType: true, verificationStatus: true },
          },
          memberProfile: {
            select: {
              providerType: true,
              state: true,
              localGovernmentArea: true,
            },
          },
          clientProfile: {
            select: {
              state: true,
              ninPhotoUrl: true,
            },
          },
        },
        skip,
        take,
        orderBy: { verificationSubmittedAt: 'asc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: PaginationUtil.createMeta(total, page, limit),
    };
  }

  // ═══════════════════════════════════════════════════════════
  // GET ALL UNDER REVIEW
  // ═══════════════════════════════════════════════════════════
  async getUnderReview(page: number = 1, limit: number = 12) {
    const { skip, take } = PaginationUtil.getSkipTake(page, limit);
    const where = { verificationStatus: VerificationStatus.UNDER_REVIEW };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          phoneNumber: true,
          fullName: true,
          userType: true,
          verificationStatus: true,
          verificationStartedAt: true,
          verifiedByAdmin: { select: { fullName: true } },
        },
        skip,
        take,
        orderBy: { verificationStartedAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, meta: PaginationUtil.createMeta(total, page, limit) };
  }

  // ═══════════════════════════════════════════════════════════
  // GET VERIFICATION DETAIL FOR SINGLE USER
  // ═══════════════════════════════════════════════════════════
  async getVerificationDetail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberProfile: {
          include: {
            specializations: { include: { category: true } },
          },
        },
        clientProfile: true,
        verificationDocuments: {
          orderBy: { uploadedAt: 'desc' },
          include: {
            verifiedByAdmin: { select: { fullName: true } },
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return { data: user };
  }

  // ═══════════════════════════════════════════════════════════
  // START REVIEW (Mark as Under Review)
  // ═══════════════════════════════════════════════════════════
  async startReview(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (
      user.verificationStatus !== VerificationStatus.PENDING &&
      user.verificationStatus !== VerificationStatus.RESUBMITTED
    ) {
      throw new BadRequestException(
        `Cannot start review. Current status: ${user.verificationStatus}`,
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: VerificationStatus.UNDER_REVIEW,
        verificationStartedAt: new Date(),
        verifiedByAdminId: adminId,
      },
    });

    return { message: 'Verification review started' };
  }

  // ═══════════════════════════════════════════════════════════
  // APPROVE USER VERIFICATION
  // ═══════════════════════════════════════════════════════════
  async approveUser(userId: string, adminId: string, notes?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.$transaction([
      // Update user status
      this.prisma.user.update({
        where: { id: userId },
        data: {
          verificationStatus: VerificationStatus.VERIFIED,
          verifiedAt: new Date(),
          verifiedByAdminId: adminId,
          rejectionReason: null,
          rejectionDetails: null,
        },
      }),

      // Approve all pending documents
      this.prisma.verificationDocument.updateMany({
        where: {
          userId,
          verificationStatus: DocumentVerificationStatus.PENDING,
        },
        data: {
          verificationStatus: DocumentVerificationStatus.APPROVED,
          verifiedAt: new Date(),
          verifiedByAdminId: adminId,
        },
      }),

      // Create notification
      this.prisma.notification.create({
        data: {
          userId,
          type: 'VERIFICATION_APPROVED',
          title: '🎉 Account Verified!',
          message:
            'Your account has been verified successfully. You now have full access to all platform features.',
        },
      }),

      // Log activity
      this.prisma.adminActivityLog.create({
        data: {
          adminId,
          actionType:
            user.userType === UserType.MEMBER
              ? AdminActionType.MEMBER_VERIFICATION_APPROVED
              : AdminActionType.CLIENT_VERIFICATION_APPROVED,
          actionDescription: `Approved ${user.userType.toLowerCase()} verification for ${user.fullName} (${user.phoneNumber})`,
          targetType: 'user',
          targetId: userId,
          targetName: user.fullName,
          additionalData: notes ? { notes } : undefined,
        },
      }),
    ]);

    return { message: 'User verified successfully' };
  }

  // ═══════════════════════════════════════════════════════════
  // REJECT USER VERIFICATION
  // ═══════════════════════════════════════════════════════════
  async rejectUser(
    userId: string,
    adminId: string,
    reason: string,
    details: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          verificationStatus: VerificationStatus.REJECTED,
          rejectionReason: reason,
          rejectionDetails: details,
          verifiedByAdminId: adminId,
        },
      }),

      this.prisma.notification.create({
        data: {
          userId,
          type: 'VERIFICATION_REJECTED',
          title: 'Verification Not Approved',
          message: `Your verification was not approved. Reason: ${reason}. Details: ${details}. You may resubmit with corrected information.`,
        },
      }),

      this.prisma.adminActivityLog.create({
        data: {
          adminId,
          actionType:
            user.userType === UserType.MEMBER
              ? AdminActionType.MEMBER_VERIFICATION_REJECTED
              : AdminActionType.CLIENT_VERIFICATION_REJECTED,
          actionDescription: `Rejected ${user.userType.toLowerCase()} verification for ${user.fullName}: ${reason}`,
          targetType: 'user',
          targetId: userId,
          targetName: user.fullName,
          additionalData: { reason, details },
        },
      }),
    ]);

    return { message: 'User verification rejected' };
  }

  // ═══════════════════════════════════════════════════════════
  // REQUEST RESUBMISSION
  // ═══════════════════════════════════════════════════════════
  async requestResubmission(
    userId: string,
    adminId: string,
    reason: string,
    specificDocuments?: string[],
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          verificationStatus: VerificationStatus.REJECTED,
          rejectionReason: 'Resubmission Required',
          rejectionDetails: reason,
          verifiedByAdminId: adminId,
        },
      }),

      // Mark specific documents for resubmission if specified
      ...(specificDocuments?.length
        ? specificDocuments.map((docId) =>
            this.prisma.verificationDocument.update({
              where: { id: docId },
              data: {
                verificationStatus:
                  DocumentVerificationStatus.RESUBMISSION_REQUIRED,
                rejectionReason: reason,
                verifiedByAdminId: adminId,
              },
            }),
          )
        : []),

      this.prisma.notification.create({
        data: {
          userId,
          type: 'RESUBMISSION_REQUIRED',
          title: 'Document Resubmission Required',
          message: `Please resubmit your verification documents. Reason: ${reason}`,
          data: specificDocuments ? { documentIds: specificDocuments } : undefined,
        },
      }),

      this.prisma.adminActivityLog.create({
        data: {
          adminId,
          actionType:
            user.userType === UserType.MEMBER
              ? AdminActionType.MEMBER_RESUBMISSION_REQUESTED
              : AdminActionType.CLIENT_RESUBMISSION_REQUESTED,
          actionDescription: `Requested document resubmission from ${user.fullName}`,
          targetType: 'user',
          targetId: userId,
          targetName: user.fullName,
        },
      }),
    ]);

    return { message: 'Resubmission request sent to user' };
  }

  // ═══════════════════════════════════════════════════════════
  // VERIFY INDIVIDUAL DOCUMENT
  // ═══════════════════════════════════════════════════════════
  async verifyDocument(
    documentId: string,
    adminId: string,
    status: DocumentVerificationStatus,
    rejectionReason?: string,
  ) {
    const doc = await this.prisma.verificationDocument.findUnique({
      where: { id: documentId },
    });
    if (!doc) throw new NotFoundException('Document not found');

    await this.prisma.verificationDocument.update({
      where: { id: documentId },
      data: {
        verificationStatus: status,
        verifiedAt: new Date(),
        verifiedByAdminId: adminId,
        rejectionReason,
      },
    });

    return { message: `Document ${status.toLowerCase()}` };
  }

  // ═══════════════════════════════════════════════════════════
  // SUSPEND VERIFIED USER
  // ═══════════════════════════════════════════════════════════
  async suspendUser(userId: string, adminId: string, reason: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          verificationStatus: VerificationStatus.SUSPENDED,
          isActive: false,
          suspendedAt: new Date(),
          suspendedReason: reason,
          suspendedByAdminId: adminId,
        },
      }),

      // Terminate all user sessions
      this.prisma.userSession.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false, terminatedAt: new Date() },
      }),

      this.prisma.notification.create({
        data: {
          userId,
          type: 'SYSTEM_ANNOUNCEMENT',
          title: 'Account Suspended',
          message: `Your account has been suspended. Reason: ${reason}. Contact admin for more information.`,
        },
      }),

      this.prisma.adminActivityLog.create({
        data: {
          adminId,
          actionType: AdminActionType.USER_SUSPENDED,
          actionDescription: `Suspended user ${user.fullName}: ${reason}`,
          targetType: 'user',
          targetId: userId,
          targetName: user.fullName,
        },
      }),
    ]);

    return { message: 'User suspended' };
  }

  // ═══════════════════════════════════════════════════════════
  // REACTIVATE SUSPENDED USER
  // ═══════════════════════════════════════════════════════════
  async reactivateUser(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          verificationStatus: VerificationStatus.VERIFIED,
          isActive: true,
          suspendedAt: null,
          suspendedReason: null,
          suspendedByAdminId: null,
        },
      }),

      this.prisma.notification.create({
        data: {
          userId,
          type: 'SYSTEM_ANNOUNCEMENT',
          title: 'Account Reactivated',
          message:
            'Your account has been reactivated. You can now access all platform features.',
        },
      }),

      this.prisma.adminActivityLog.create({
        data: {
          adminId,
          actionType: AdminActionType.USER_REACTIVATED,
          actionDescription: `Reactivated user ${user.fullName}`,
          targetType: 'user',
          targetId: userId,
          targetName: user.fullName,
        },
      }),
    ]);

    return { message: 'User reactivated' };
  }

  // ═══════════════════════════════════════════════════════════
  // PROCESS PASSWORD RESET REQUEST
  // ═══════════════════════════════════════════════════════════
  async getPendingPasswordResets(page: number = 1, limit: number = 12) {
    const { skip, take } = PaginationUtil.getSkipTake(page, limit);
    const where = { status: 'PENDING' as any };

    const [requests, total] = await Promise.all([
      this.prisma.passwordResetRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true,
              userType: true,
              verificationStatus: true,
              email: true,
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.passwordResetRequest.count({ where }),
    ]);

    return { data: requests, meta: PaginationUtil.createMeta(total, page, limit) };
  }

  async processPasswordReset(
    requestId: string,
    adminId: string,
    temporaryPassword: string,
    adminNotes?: string,
  ) {
    const request = await this.prisma.passwordResetRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });
    if (!request) throw new NotFoundException('Reset request not found');
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request already processed');
    }

    const hash = await PasswordUtil.hash(temporaryPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: request.userId },
        data: { passwordHash: hash },
      }),

      this.prisma.passwordResetRequest.update({
        where: { id: requestId },
        data: {
          status: 'COMPLETED',
          processedByAdminId: adminId,
          processedAt: new Date(),
          temporaryPasswordHash: hash,
          adminNotes,
        },
      }),

      this.prisma.notification.create({
        data: {
          userId: request.userId,
          type: 'PASSWORD_RESET_READY',
          title: 'Password Reset Complete',
          message:
            'Your password has been reset by the admin. Please login with your temporary password and change it immediately.',
        },
      }),

      this.prisma.adminActivityLog.create({
        data: {
          adminId,
          actionType: AdminActionType.USER_PASSWORD_RESET,
          actionDescription: `Processed password reset for ${request.user.fullName} (${request.user.phoneNumber})`,
          targetType: 'user',
          targetId: request.userId,
          targetName: request.user.fullName,
        },
      }),
    ]);

    return { message: 'Password reset processed successfully' };
  }

  async rejectPasswordReset(
    requestId: string,
    adminId: string,
    reason: string,
  ) {
    const request = await this.prisma.passwordResetRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });
    if (!request) throw new NotFoundException('Request not found');

    await this.prisma.$transaction([
      this.prisma.passwordResetRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          processedByAdminId: adminId,
          processedAt: new Date(),
          adminNotes: reason,
        },
      }),
      this.prisma.notification.create({
        data: {
          userId: request.userId,
          type: 'SYSTEM_ANNOUNCEMENT',
          title: 'Password Reset Request Rejected',
          message: `Your password reset request was rejected. Reason: ${reason}`,
        },
      }),
    ]);

    return { message: 'Password reset request rejected' };
  }

  // ═══════════════════════════════════════════════════════════
  // ADMIN RESET USER PASSWORD DIRECTLY
  // ═══════════════════════════════════════════════════════════
  async adminResetUserPassword(
    userId: string,
    adminId: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const hash = await PasswordUtil.hash(newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hash, failedLoginAttempts: 0, lockedUntil: null },
      }),

      this.prisma.notification.create({
        data: {
          userId,
          type: 'PASSWORD_RESET_READY',
          title: 'Password Reset by Admin',
          message: 'Your password has been reset. Please login and change it.',
        },
      }),

      this.prisma.adminActivityLog.create({
        data: {
          adminId,
          actionType: AdminActionType.USER_PASSWORD_RESET,
          actionDescription: `Directly reset password for ${user.fullName}`,
          targetType: 'user',
          targetId: userId,
          targetName: user.fullName,
        },
      }),
    ]);

    return { message: 'User password reset successfully' };
  }

  // ═══════════════════════════════════════════════════════════
  // VERIFICATION STATISTICS
  // ═══════════════════════════════════════════════════════════
  async getVerificationStats() {
    const statusCounts = await this.prisma.user.groupBy({
      by: ['verificationStatus'],
      _count: true,
    });

    const typeCounts = await this.prisma.user.groupBy({
      by: ['userType', 'verificationStatus'],
      _count: true,
    });

    const pendingCount = await this.prisma.user.count({
      where: {
        verificationStatus: {
          in: [VerificationStatus.PENDING, VerificationStatus.RESUBMITTED],
        },
      },
    });

    const pendingResets = await this.prisma.passwordResetRequest.count({
      where: { status: 'PENDING' },
    });

    // Average verification time (last 30 days)
    const recentVerified = await this.prisma.user.findMany({
      where: {
        verificationStatus: VerificationStatus.VERIFIED,
        verifiedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: { verificationSubmittedAt: true, verifiedAt: true },
    });

    let avgVerificationHours = 0;
    if (recentVerified.length > 0) {
      const totalHours = recentVerified.reduce((sum, u) => {
        if (u.verificationSubmittedAt && u.verifiedAt) {
          return (
            sum +
            (u.verifiedAt.getTime() - u.verificationSubmittedAt.getTime()) /
              3600000
          );
        }
        return sum;
      }, 0);
      avgVerificationHours = Math.round(totalHours / recentVerified.length);
    }

    return {
      data: {
        statusCounts,
        typeCounts,
        pendingCount,
        pendingResets,
        avgVerificationHours,
      },
    };
  }
}