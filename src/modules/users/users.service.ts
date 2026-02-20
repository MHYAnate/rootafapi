import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationUtil } from '../../common/utils';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; userType?: string; status?: string; search?: string }) {
    const { skip, take } = PaginationUtil.getSkipTake(query.page, query.limit);
    const where: any = {};
    if (query.userType) where.userType = query.userType;
    if (query.status) where.verificationStatus = query.status;
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { phoneNumber: { contains: query.search } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

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
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, meta: PaginationUtil.createMeta(total, query.page || 1, query.limit || 12) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
        loginCount: true,
        verificationSubmittedAt: true,
        verifiedAt: true,
        rejectionReason: true,
        resubmissionCount: true,
        memberProfile: {
          include: {
            specializations: { include: { category: true } },
          },
        },
        clientProfile: true,
        verificationDocuments: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return { data: user };
  }

  async suspendUser(id: string, adminId: string, reason: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        suspendedAt: new Date(),
        suspendedReason: reason,
        suspendedByAdminId: adminId,
      },
    });

    return { message: 'User suspended successfully' };
  }

  async reactivateUser(id: string, adminId: string) {
    await this.prisma.user.update({
      where: { id },
      data: {
        isActive: true,
        suspendedAt: null,
        suspendedReason: null,
        suspendedByAdminId: null,
      },
    });
    return { message: 'User reactivated successfully' };
  }
}