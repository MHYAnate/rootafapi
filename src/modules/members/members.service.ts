import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationUtil } from '../../common/utils';
import { MemberQueryDto } from './dto/member-query.dto';
import { UpdateMemberProfileDto } from './dto/update-member-profile.dto';
import { VerificationStatus, Prisma } from '@prisma/client';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async findAllPublic(query: MemberQueryDto) {
    const { skip, take } = PaginationUtil.getSkipTake(query.page, query.limit);

    const where: Prisma.MemberProfileWhereInput = {
      user: { verificationStatus: VerificationStatus.VERIFIED, isActive: true },
    };

    if (query.providerType) where.providerType = query.providerType;
    if (query.state) where.state = query.state;
    if (query.lga) where.localGovernmentArea = query.lga;
    if (query.categoryId) {
      where.specializations = { some: { categoryId: query.categoryId } };
    }
    if (query.search) {
      where.OR = [
        { user: { fullName: { contains: query.search, mode: 'insensitive' } } },
        { bio: { contains: query.search, mode: 'insensitive' } },
        { tagline: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (query.sortBy === 'rating') orderBy.averageRating = query.sortOrder || 'desc';
    else if (query.sortBy === 'name') orderBy.user = { fullName: query.sortOrder || 'asc' };
    else orderBy.createdAt = query.sortOrder || 'desc';

    const [members, total] = await Promise.all([
      this.prisma.memberProfile.findMany({
        where,
        include: {
          user: {
            select: { id: true, fullName: true, phoneNumber: true, verificationStatus: true },
          },
          specializations: { include: { category: { select: { id: true, name: true, categoryCode: true } } } },
        },
        skip,
        take,
        orderBy,
      }),
      this.prisma.memberProfile.count({ where }),
    ]);

    return { data: members, meta: PaginationUtil.createMeta(total, query.page || 1, query.limit || 12) };
  }

  async findOnePublic(id: string) {
    const member = await this.prisma.memberProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, fullName: true, phoneNumber: true, email: true, verificationStatus: true },
        },
        specializations: { include: { category: true } },
        products: {
          where: { isActive: true },
          include: { images: { where: { isPrimary: true }, take: 1 } },
          take: 6,
          orderBy: { createdAt: 'desc' },
        },
        services: {
          where: { isActive: true },
          include: { images: { where: { isPrimary: true }, take: 1 } },
          take: 6,
          orderBy: { createdAt: 'desc' },
        },
        tools: {
          where: { isActive: true },
          include: { images: { where: { isPrimary: true }, take: 1 } },
          take: 6,
          orderBy: { createdAt: 'desc' },
        },
        certificates: {
          where: { isVisible: true },
          orderBy: { displayOrder: 'asc' },
        },
        ratingsReceived: {
          where: { status: 'ACTIVE' },
          include: {
            client: {
              include: { user: { select: { fullName: true } } },
            },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        externalLinks: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } },
      },
    });

    if (!member) throw new NotFoundException('Member not found');

    // Increment view count
    await this.prisma.memberProfile.update({
      where: { id },
      data: { profileViewCount: { increment: 1 } },
    });

    return { data: member };
  }

  async updateProfile(userId: string, dto: UpdateMemberProfileDto) {
    const profile = await this.prisma.memberProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    const updated = await this.prisma.memberProfile.update({
      where: { userId },
      data: { ...dto },
      include: {
        user: { select: { id: true, fullName: true, phoneNumber: true } },
        specializations: { include: { category: true } },
      },
    });

    return { message: 'Profile updated', data: updated };
  }

  async updateProfilePhoto(userId: string, photoUrl: string, thumbnailUrl: string) {
    await this.prisma.memberProfile.update({
      where: { userId },
      data: { profilePhotoUrl: photoUrl, profilePhotoThumbnail: thumbnailUrl },
    });
    return { message: 'Profile photo updated' };
  }

  async addSpecialization(
    userId: string,
    categoryId: string,
    isPrimary: boolean = false,
    specificSkills: string[] = [],
    description?: string,
  ) {
    const profile = await this.prisma.memberProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Category not found');

    const spec = await this.prisma.memberSpecialization.create({
      data: {
        memberId: profile.id,
        categoryId,
        specializationType: category.categoryType.includes('FARMER') ? 'FARMER' : 'ARTISAN',
        isPrimary,
        specificSkills,
        description,
      },
      include: { category: true },
    });

    return { message: 'Specialization added', data: spec };
  }

  async removeSpecialization(userId: string, specId: string) {
    const profile = await this.prisma.memberProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    const spec = await this.prisma.memberSpecialization.findFirst({
      where: { id: specId, memberId: profile.id },
    });
    if (!spec) throw new NotFoundException('Specialization not found');

    await this.prisma.memberSpecialization.delete({ where: { id: specId } });
    return { message: 'Specialization removed' };
  }

  async getMyProfile(userId: string) {
    const profile = await this.prisma.memberProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, fullName: true, phoneNumber: true, email: true, verificationStatus: true } },
        specializations: { include: { category: true } },
      },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return { data: profile };
  }
}