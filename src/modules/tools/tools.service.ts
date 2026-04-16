import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationUtil } from '../../common/utils';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { ToolQueryDto } from './dto/tool-query.dto';
import { Prisma, VerificationStatus } from '@prisma/client';
import { IngestionService } from '../ai/ingestion.service';

@Injectable()
export class ToolsService {
  constructor(private prisma: PrismaService, private ingestionService: IngestionService,) {}

  private async getMemberId(userId: string) {
    const p = await this.prisma.memberProfile.findUnique({
      where: { userId },
    });
    if (!p) throw new NotFoundException('Member profile not found');
    return p.id;
  }

  private triggerReindex() {
    this.ingestionService.ingestAll().catch((err) =>
      console.error('RAG re-indexing failed:', err.message),
    );
  }

  async create(userId: string, dto: CreateToolDto) {
    const memberId = await this.getMemberId(userId);

    // Build sale price display text
    let salePriceDisplayText: string | undefined;
    if (
      dto.listingPurpose === 'FOR_SALE' ||
      dto.listingPurpose === 'BOTH'
    ) {
      if (dto.salePricingType === 'NEGOTIABLE') {
        salePriceDisplayText = 'Negotiable';
      } else if (dto.salePrice) {
        salePriceDisplayText = `₦${dto.salePrice.toLocaleString()}`;
        if (dto.salePricingType === 'BOTH') {
          salePriceDisplayText += ' (Negotiable)';
        }
      }
    }

    // Build lease price display text
    let leasePriceDisplayText: string | undefined;
    if (
      dto.listingPurpose === 'FOR_LEASE' ||
      dto.listingPurpose === 'BOTH'
    ) {
      if (dto.leasePricingType === 'NEGOTIABLE') {
        leasePriceDisplayText = 'Negotiable';
      } else if (dto.leaseRate) {
        const periodLabel = dto.leaseRatePeriod
          ?.replace('PER_', 'Per ')
          .toLowerCase();
        leasePriceDisplayText = `₦${dto.leaseRate.toLocaleString()} ${periodLabel || 'per day'}`;
        if (dto.leasePricingType === 'BOTH') {
          leasePriceDisplayText += ' (Negotiable)';
        }
      }
    }

    const tool = await this.prisma.tool.create({
      data: {
        memberId,
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        shortDescription: dto.shortDescription,
        tags: dto.tags || [],
        condition: dto.condition,
        brandName: dto.brandName,
        modelNumber: dto.modelNumber,
        quantityAvailable: dto.quantityAvailable || 1,
        listingPurpose: dto.listingPurpose,
        salePricingType: dto.salePricingType,
        salePrice: dto.salePrice,
        salePriceDisplayText,
        leasePricingType: dto.leasePricingType,
        leaseRate: dto.leaseRate,
        leaseRatePeriod: dto.leaseRatePeriod,
        leasePriceDisplayText,
        depositRequired: dto.depositRequired,
        depositAmount: dto.depositAmount,
        depositNotes: dto.depositNotes,
        pickupLocation: dto.pickupLocation,
        pickupLocationLga: dto.pickupLocationLga,
        pickupLocationState: dto.pickupLocationState,
        deliveryAvailable: dto.deliveryAvailable || false,
        deliveryFee: dto.deliveryFee,
        deliveryNotes: dto.deliveryNotes,
        publishedAt: new Date(),
      },
      include: { images: true, category: true },
    });

    await this.prisma.memberProfile.update({
      where: { id: memberId },
      data: {
        totalTools: { increment: 1 },
        activeTools: { increment: 1 },
      },
    });

    this.triggerReindex();
    return { message: 'Tool created', data: tool };
  }

  async findAllPublic(query: ToolQueryDto) {
    const { skip, take } = PaginationUtil.getSkipTake(
      query.page,
      query.limit,
    );

    const where: Prisma.ToolWhereInput = {
      isActive: true,
      member: {
        user: {
          verificationStatus: VerificationStatus.VERIFIED,
          isActive: true,
        },
      },
    };

    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.memberId) where.memberId = query.memberId;
    if (query.condition) where.condition = query.condition;
    if (query.listingPurpose) where.listingPurpose = query.listingPurpose;
    if (query.state)
      where.member = { ...(where.member as any), state: query.state };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { tags: { hasSome: [query.search] } },
      ];
    }

    const orderBy: any =
      query.sortBy === 'price'
        ? { salePrice: query.sortOrder || 'asc' }
        : query.sortBy === 'name'
          ? { name: query.sortOrder || 'asc' }
          : { createdAt: query.sortOrder || 'desc' };

    const [tools, total] = await Promise.all([
      this.prisma.tool.findMany({
        where,
        skip,
        take,
        orderBy,
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
              user: {
                select: { fullName: true, phoneNumber: true },
              },
            },
          },
        },
      }),
      this.prisma.tool.count({ where }),
    ]);

    
    return {
      data: tools,
      meta: PaginationUtil.createMeta(
        total,
        query.page || 1,
        query.limit || 12,
      ),
    };
  }

  async findOne(id: string) {
    const tool = await this.prisma.tool.findUnique({
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
            user: {
              select: {
                id: true,
                fullName: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });
    if (!tool) throw new NotFoundException('Tool not found');

    await this.prisma.tool.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

   
    return { data: tool };
  }

  async update(userId: string, toolId: string, dto: UpdateToolDto) {
    const memberId = await this.getMemberId(userId);
    const tool = await this.prisma.tool.findFirst({
      where: { id: toolId, memberId },
    });
    if (!tool) throw new NotFoundException('Tool not found');

    const updated = await this.prisma.tool.update({
      where: { id: toolId },
      data: { ...dto },
      include: { images: true, category: true },
    });

    this.triggerReindex();
    return { message: 'Tool updated', data: updated };
  }

  async remove(userId: string, toolId: string) {
    const memberId = await this.getMemberId(userId);
    const tool = await this.prisma.tool.findFirst({
      where: { id: toolId, memberId },
    });
    if (!tool) throw new NotFoundException('Tool not found');

    await this.prisma.tool.update({
      where: { id: toolId },
      data: { isActive: false },
    });
    await this.prisma.memberProfile.update({
      where: { id: memberId },
      data: { activeTools: { decrement: 1 } },
    });

    this.triggerReindex();
    return { message: 'Tool deleted' };
  }

  async addImage(
    userId: string,
    toolId: string,
    imageUrl: string,
    thumbnailUrl: string,
    isPrimary: boolean = false,
  ) {
    const memberId = await this.getMemberId(userId);
    const tool = await this.prisma.tool.findFirst({
      where: { id: toolId, memberId },
    });
    if (!tool) throw new NotFoundException('Tool not found');

    if (isPrimary) {
      await this.prisma.toolImage.updateMany({
        where: { toolId },
        data: { isPrimary: false },
      });
    }

    const img = await this.prisma.toolImage.create({
      data: { toolId, imageUrl, thumbnailUrl, isPrimary },
    });

   
    return { message: 'Image added', data: img };
  }

  async removeImage(userId: string, toolId: string, imageId: string) {
    const memberId = await this.getMemberId(userId);
    const tool = await this.prisma.tool.findFirst({
      where: { id: toolId, memberId },
    });
    if (!tool) throw new NotFoundException('Tool not found');

    await this.prisma.toolImage.delete({ where: { id: imageId } });
    this.triggerReindex();
    return { message: 'Image removed' };
  }

  async getMyTools(userId: string, query: ToolQueryDto) {
    const memberId = await this.getMemberId(userId);
    const { skip, take } = PaginationUtil.getSkipTake(
      query.page,
      query.limit,
    );

    const [tools, total] = await Promise.all([
      this.prisma.tool.findMany({
        where: { memberId },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: true,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tool.count({ where: { memberId } }),
    ]);

    return {
      data: tools,
      meta: PaginationUtil.createMeta(
        total,
        query.page || 1,
        query.limit || 12,
      ),
    };
  }
}