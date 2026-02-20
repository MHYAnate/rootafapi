import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationUtil, PriceDisplayUtil } from '../../common/utils';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { Prisma, VerificationStatus } from '@prisma/client';
import { MESSAGES } from '../../common/constants';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private async getMemberProfileId(userId: string): Promise<string> {
    const profile = await this.prisma.memberProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Member profile not found');
    return profile.id;
  }

  async create(userId: string, dto: CreateProductDto) {
    const memberId = await this.getMemberProfileId(userId);

    const priceDisplayText = PriceDisplayUtil.formatPrice(
      dto.pricingType,
      dto.priceAmount,
      dto.pricePerUnit,
    );

    const product = await this.prisma.product.create({
      data: {
        memberId,
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        shortDescription: dto.shortDescription,
        tags: dto.tags || [],
        unitOfMeasure: dto.unitOfMeasure,
        minimumOrderQuantity: dto.minimumOrderQuantity,
        availableQuantity: dto.availableQuantity,
        pricingType: dto.pricingType,
        priceAmount: dto.priceAmount,
        pricePerUnit: dto.pricePerUnit,
        priceDisplayText,
        availability: dto.availability || 'AVAILABLE',
        seasonalInfo: dto.seasonalInfo,
        externalVideoLink: dto.externalVideoLink,
        publishedAt: new Date(),
      },
      include: { images: true, category: true },
    });

    await this.prisma.memberProfile.update({
      where: { id: memberId },
      data: { totalProducts: { increment: 1 }, activeProducts: { increment: 1 } },
    });

    return { message: MESSAGES.PRODUCT.CREATED, data: product };
  }

  async findAllPublic(query: ProductQueryDto) {
    const { skip, take } = PaginationUtil.getSkipTake(query.page, query.limit);

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      member: { user: { verificationStatus: VerificationStatus.VERIFIED, isActive: true } },
    };

    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.memberId) where.memberId = query.memberId;
    if (query.pricingType) where.pricingType = query.pricingType;
    if (query.availability) where.availability = query.availability;
    if (query.state) where.member = { ...where.member as any, state: query.state };
    if (query.minPrice || query.maxPrice) {
      where.priceAmount = {};
      if (query.minPrice) where.priceAmount.gte = query.minPrice;
      if (query.maxPrice) where.priceAmount.lte = query.maxPrice;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { tags: { hasSome: [query.search] } },
      ];
    }

    const orderBy: any = {};
    if (query.sortBy === 'price') orderBy.priceAmount = query.sortOrder || 'asc';
    else if (query.sortBy === 'rating') orderBy.averageRating = query.sortOrder || 'desc';
    else if (query.sortBy === 'name') orderBy.name = query.sortOrder || 'asc';
    else orderBy.createdAt = query.sortOrder || 'desc';

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          category: { select: { id: true, name: true, categoryCode: true } },
          member: {
            select: {
              id: true,
              profilePhotoThumbnail: true,
              state: true,
              localGovernmentArea: true,
              averageRating: true,
              user: { select: { fullName: true, phoneNumber: true } },
            },
          },
        },
        skip,
        take,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data: products, meta: PaginationUtil.createMeta(total, query.page || 1, query.limit || 12) };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        category: true,
        member: {
          select: {
            id: true,
            profilePhotoUrl: true,
            profilePhotoThumbnail: true,
            bio: true,
            state: true,
            localGovernmentArea: true,
            averageRating: true,
            totalRatings: true,
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
    if (!product) throw new NotFoundException(MESSAGES.PRODUCT.NOT_FOUND);

    await this.prisma.product.update({ where: { id }, data: { viewCount: { increment: 1 } } });

    return { data: product };
  }

  async update(userId: string, productId: string, dto: UpdateProductDto) {
    const memberId = await this.getMemberProfileId(userId);
    const product = await this.prisma.product.findFirst({ where: { id: productId, memberId } });
    if (!product) throw new NotFoundException(MESSAGES.PRODUCT.NOT_FOUND);

    let priceDisplayText = product.priceDisplayText;
    if (dto.pricingType || dto.priceAmount !== undefined || dto.pricePerUnit !== undefined) {
      priceDisplayText = PriceDisplayUtil.formatPrice(
        dto.pricingType || product.pricingType,
        dto.priceAmount ?? (product.priceAmount ? Number(product.priceAmount) : undefined),
        dto.pricePerUnit ?? product.pricePerUnit ?? undefined,
      );
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { ...dto, priceDisplayText },
      include: { images: true, category: true },
    });

    return { message: MESSAGES.PRODUCT.UPDATED, data: updated };
  }

  async remove(userId: string, productId: string) {
    const memberId = await this.getMemberProfileId(userId);
    const product = await this.prisma.product.findFirst({ where: { id: productId, memberId } });
    if (!product) throw new NotFoundException(MESSAGES.PRODUCT.NOT_FOUND);

    await this.prisma.product.update({ where: { id: productId }, data: { isActive: false } });
    await this.prisma.memberProfile.update({
      where: { id: memberId },
      data: { activeProducts: { decrement: 1 } },
    });

    return { message: MESSAGES.PRODUCT.DELETED };
  }

  async addImage(
    userId: string,
    productId: string,
    imageUrl: string,
    thumbnailUrl: string,
    mediumUrl: string,
    isPrimary: boolean = false,
  ) {
    const memberId = await this.getMemberProfileId(userId);
    const product = await this.prisma.product.findFirst({ where: { id: productId, memberId } });
    if (!product) throw new NotFoundException(MESSAGES.PRODUCT.NOT_FOUND);

    if (isPrimary) {
      await this.prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }

    const image = await this.prisma.productImage.create({
      data: { productId, imageUrl, thumbnailUrl, mediumUrl, isPrimary },
    });

    return { message: 'Image added', data: image };
  }

  async removeImage(userId: string, productId: string, imageId: string) {
    const memberId = await this.getMemberProfileId(userId);
    const product = await this.prisma.product.findFirst({ where: { id: productId, memberId } });
    if (!product) throw new NotFoundException(MESSAGES.PRODUCT.NOT_FOUND);

    await this.prisma.productImage.delete({ where: { id: imageId } });
    return { message: 'Image removed' };
  }

  async getMyProducts(userId: string, query: ProductQueryDto) {
    const memberId = await this.getMemberProfileId(userId);
    const { skip, take } = PaginationUtil.getSkipTake(query.page, query.limit);

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { memberId },
        include: { images: { where: { isPrimary: true }, take: 1 }, category: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where: { memberId } }),
    ]);

    return { data: products, meta: PaginationUtil.createMeta(total, query.page || 1, query.limit || 12) };
  }
}