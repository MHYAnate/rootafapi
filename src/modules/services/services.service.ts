import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationUtil, PriceDisplayUtil } from '../../common/utils';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceQueryDto } from './dto/service-query.dto';
import { Prisma, VerificationStatus } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  private async getMemberProfileId(userId: string) {
    const p = await this.prisma.memberProfile.findUnique({ where: { userId } });
    if (!p) throw new NotFoundException('Member profile not found');
    return p.id;
  }

  async create(userId: string, dto: CreateServiceDto) {
    const memberId = await this.getMemberProfileId(userId);
    const priceDisplayText = PriceDisplayUtil.formatPrice(dto.pricingType, dto.startingPrice, dto.priceBasis);

    const service = await this.prisma.service.create({
      data: {
        memberId,
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        shortDescription: dto.shortDescription,
        tags: dto.tags || [],
        serviceArea: dto.serviceArea,
        servicesLocations: dto.servicesLocations || [],
        estimatedDuration: dto.estimatedDuration,
        pricingType: dto.pricingType,
        startingPrice: dto.startingPrice,
        maximumPrice: dto.maximumPrice,
        priceBasis: dto.priceBasis,
        priceDisplayText,
        availability: dto.availability || 'AVAILABLE',
        workingDays: dto.workingDays || [],
        workingHoursStart: dto.workingHoursStart,
        workingHoursEnd: dto.workingHoursEnd,
        materialsCostIncluded: dto.materialsCostIncluded ?? false,
        externalVideoLink: dto.externalVideoLink,
        portfolioLink: dto.portfolioLink,
        publishedAt: new Date(),
      },
      include: { images: true, category: true },
    });

    await this.prisma.memberProfile.update({
      where: { id: memberId },
      data: { totalServices: { increment: 1 }, activeServices: { increment: 1 } },
    });

    return { message: 'Service created', data: service };
  }

  async findAllPublic(query: ServiceQueryDto) {
    const { skip, take } = PaginationUtil.getSkipTake(query.page, query.limit);
    const where: Prisma.ServiceWhereInput = {
      isActive: true,
      member: { user: { verificationStatus: VerificationStatus.VERIFIED, isActive: true } },
    };
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.memberId) where.memberId = query.memberId;
    if (query.pricingType) where.pricingType = query.pricingType;
    if (query.state) where.member = { ...where.member as any, state: query.state };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = query.sortBy === 'price' ? { startingPrice: query.sortOrder || 'asc' }
      : query.sortBy === 'rating' ? { averageRating: query.sortOrder || 'desc' }
      : { createdAt: query.sortOrder || 'desc' };

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where, skip, take, orderBy,
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          category: { select: { id: true, name: true, categoryCode: true } },
          member: {
            select: {
              id: true, profilePhotoThumbnail: true, state: true, localGovernmentArea: true, averageRating: true,
              user: { select: { fullName: true, phoneNumber: true } },
            },
          },
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    return { data: services, meta: PaginationUtil.createMeta(total, query.page || 1, query.limit || 12) };
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        category: true,
        member: {
          select: {
            id: true, profilePhotoUrl: true, bio: true, state: true, localGovernmentArea: true,
            averageRating: true, totalRatings: true,
            user: { select: { id: true, fullName: true, phoneNumber: true } },
          },
        },
        ratings: {
          where: { status: 'ACTIVE' },
          include: { client: { include: { user: { select: { fullName: true } } } } },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!service) throw new NotFoundException('Service not found');
    await this.prisma.service.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return { data: service };
  }

  async update(userId: string, serviceId: string, dto: UpdateServiceDto) {
    const memberId = await this.getMemberProfileId(userId);
    const service = await this.prisma.service.findFirst({ where: { id: serviceId, memberId } });
    if (!service) throw new NotFoundException('Service not found');
    const updated = await this.prisma.service.update({ where: { id: serviceId }, data: { ...dto }, include: { images: true, category: true } });
    return { message: 'Service updated', data: updated };
  }

  async remove(userId: string, serviceId: string) {
    const memberId = await this.getMemberProfileId(userId);
    const service = await this.prisma.service.findFirst({ where: { id: serviceId, memberId } });
    if (!service) throw new NotFoundException('Service not found');
    await this.prisma.service.update({ where: { id: serviceId }, data: { isActive: false } });
    await this.prisma.memberProfile.update({ where: { id: memberId }, data: { activeServices: { decrement: 1 } } });
    return { message: 'Service deleted' };
  }

  async addImage(userId: string, serviceId: string, imageUrl: string, thumbnailUrl: string, isPrimary: boolean = false) {
    const memberId = await this.getMemberProfileId(userId);
    const service = await this.prisma.service.findFirst({ where: { id: serviceId, memberId } });
    if (!service) throw new NotFoundException('Service not found');
    if (isPrimary) await this.prisma.serviceImage.updateMany({ where: { serviceId }, data: { isPrimary: false } });
    const image = await this.prisma.serviceImage.create({ data: { serviceId, imageUrl, thumbnailUrl, isPrimary } });
    return { message: 'Image added', data: image };
  }

  async getMyServices(userId: string, query: ServiceQueryDto) {
    const memberId = await this.getMemberProfileId(userId);
    const { skip, take } = PaginationUtil.getSkipTake(query.page, query.limit);
    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where: { memberId },
        include: { images: { where: { isPrimary: true }, take: 1 }, category: true },
        skip, take, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.service.count({ where: { memberId } }),
    ]);
    return { data: services, meta: PaginationUtil.createMeta(total, query.page || 1, query.limit || 12) };
  }
}