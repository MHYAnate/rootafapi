// src/modules/events/events.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationUtil } from '../../common/utils';
import { Prisma, EventStatus } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════
  // PUBLIC METHODS
  // ═══════════════════════════════════════════════════════════

  async findAllPublic(page: number = 1, limit: number = 12, status?: string) {
    const { skip, take } = PaginationUtil.getSkipTake(page, limit);
    const where: Prisma.EventWhereInput = { isPublished: true };
    
    if (status) {
      where.status = status as EventStatus;
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take,
        orderBy: { startDate: 'desc' },
        include: {
          gallery: { take: 1, orderBy: { displayOrder: 'asc' } },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events,
      meta: PaginationUtil.createMeta(total, page, limit),
    };
  }

  async findUpcoming(limit: number = 6) {
    const now = new Date();
    const events = await this.prisma.event.findMany({
      where: {
        isPublished: true,
        startDate: { gte: now },
        status: { in: ['UPCOMING', 'ONGOING'] },
      },
      orderBy: { startDate: 'asc' },
      take: limit,
      include: {
        gallery: { take: 1, orderBy: { displayOrder: 'asc' } },
      },
    });

    return { data: events };
  }

  async findPast(page: number = 1, limit: number = 12) {
    const { skip, take } = PaginationUtil.getSkipTake(page, limit);
    const now = new Date();
    
    const where: Prisma.EventWhereInput = {
      isPublished: true,
      OR: [
        { endDate: { lt: now } },
        { AND: [{ endDate: null }, { startDate: { lt: now } }] },
      ],
      status: 'COMPLETED',
    };

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take,
        orderBy: { startDate: 'desc' },
        include: {
          gallery: { take: 3, orderBy: { displayOrder: 'asc' } },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events,
      meta: PaginationUtil.createMeta(total, page, limit),
    };
  }

  async findFeatured() {
    const events = await this.prisma.event.findMany({
      where: {
        isPublished: true,
        isFeatured: true,
      },
      orderBy: { startDate: 'desc' },
      take: 4,
      include: {
        gallery: { take: 1, orderBy: { displayOrder: 'asc' } },
      },
    });

    return { data: events };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, isPublished: true },
      include: {
        gallery: { orderBy: { displayOrder: 'asc' } },
        agenda: { orderBy: { displayOrder: 'asc' } },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Increment view count
    await this.prisma.event.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return { data: event };
  }

  // ═══════════════════════════════════════════════════════════
  // ADMIN METHODS
  // ═══════════════════════════════════════════════════════════

  async findAllAdmin(
    page: number = 1,
    limit: number = 12,
    status?: string,
    isPublished?: string,
  ) {
    const { skip, take } = PaginationUtil.getSkipTake(page, limit);
    const where: Prisma.EventWhereInput = {};

    // Filter by status
    if (status) {
      where.status = status as EventStatus;
    }

    // Filter by published status
    if (isPublished !== undefined) {
      where.isPublished = isPublished === 'true';
    }

    const [events, total, stats] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take,
        orderBy: [
          { isPublished: 'asc' }, // Drafts first
          { startDate: 'desc' },
        ],
        include: {
          gallery: { take: 1, orderBy: { displayOrder: 'asc' } },
          createdByAdmin: {
            select: { id: true, fullName: true },
          },
        },
      }),
      this.prisma.event.count({ where }),
      this.getEventStats(),
    ]);

    return {
      data: events,
      meta: PaginationUtil.createMeta(total, page, limit),
      stats,
    };
  }

  async findOneAdmin(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        gallery: { orderBy: { displayOrder: 'asc' } },
        agenda: { orderBy: { displayOrder: 'asc' } },
        createdByAdmin: {
          select: { id: true, fullName: true },
        },
        lastUpdatedByAdmin: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return { data: event };
  }

  async getEventStats() {
    const [total, published, drafts, upcoming, ongoing, completed] =
      await Promise.all([
        this.prisma.event.count(),
        this.prisma.event.count({ where: { isPublished: true } }),
        this.prisma.event.count({ where: { isPublished: false } }),
        this.prisma.event.count({ where: { status: 'UPCOMING', isPublished: true } }),
        this.prisma.event.count({ where: { status: 'ONGOING', isPublished: true } }),
        this.prisma.event.count({ where: { status: 'COMPLETED' } }),
      ]);

    return {
      total,
      published,
      drafts,
      upcoming,
      ongoing,
      completed,
    };
  }

  async create(data: any, adminId: string) {
    const event = await this.prisma.event.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: 'DRAFT' as EventStatus,
        isPublished: false,
        createdByAdminId: adminId,
      },
    });

    return {
      message: 'Event created successfully',
      data: event,
    };
  }

  async update(id: string, data: any, adminId: string) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Event not found');
    }

    const event = await this.prisma.event.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        lastUpdatedByAdminId: adminId,
      },
      include: {
        gallery: { orderBy: { displayOrder: 'asc' } },
        agenda: { orderBy: { displayOrder: 'asc' } },
      },
    });

    return {
      message: 'Event updated successfully',
      data: event,
    };
  }

  async publish(id: string, adminId: string) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Event not found');
    }

    const event = await this.prisma.event.update({
      where: { id },
      data: {
        isPublished: true,
        publishedAt: new Date(),
        status: 'UPCOMING' as EventStatus,
        lastUpdatedByAdminId: adminId,
      },
    });

    return {
      message: 'Event published successfully',
      data: event,
    };
  }

  async unpublish(id: string, adminId: string) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Event not found');
    }

    const event = await this.prisma.event.update({
      where: { id },
      data: {
        isPublished: false,
        status: 'DRAFT' as EventStatus,
        lastUpdatedByAdminId: adminId,
      },
    });

    return {
      message: 'Event unpublished successfully',
      data: event,
    };
  }

  async updateStatus(id: string, status: string, adminId: string) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Event not found');
    }

    const event = await this.prisma.event.update({
      where: { id },
      data: {
        status: status as EventStatus,
        lastUpdatedByAdminId: adminId,
      },
    });

    return {
      message: 'Event status updated successfully',
      data: event,
    };
  }

  async addGalleryImage(eventId: string, data: any, adminId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const image = await this.prisma.eventGalleryImage.create({
      data: {
        eventId,
        ...data,
        uploadedByAdminId: adminId,
      },
    });

    return {
      message: 'Image added successfully',
      data: image,
    };
  }

  async removeGalleryImage(eventId: string, imageId: string) {
    const image = await this.prisma.eventGalleryImage.findFirst({
      where: { id: imageId, eventId },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.prisma.eventGalleryImage.delete({ where: { id: imageId } });

    return { message: 'Image removed successfully' };
  }

  async addAgendaItem(eventId: string, data: any) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const item = await this.prisma.eventAgendaItem.create({
      data: {
        eventId,
        ...data,
      },
    });

    return {
      message: 'Agenda item added successfully',
      data: item,
    };
  }

  async updateAgendaItem(eventId: string, itemId: string, data: any) {
    const item = await this.prisma.eventAgendaItem.findFirst({
      where: { id: itemId, eventId },
    });

    if (!item) {
      throw new NotFoundException('Agenda item not found');
    }

    const updated = await this.prisma.eventAgendaItem.update({
      where: { id: itemId },
      data,
    });

    return {
      message: 'Agenda item updated successfully',
      data: updated,
    };
  }

  async removeAgendaItem(eventId: string, itemId: string) {
    const item = await this.prisma.eventAgendaItem.findFirst({
      where: { id: itemId, eventId },
    });

    if (!item) {
      throw new NotFoundException('Agenda item not found');
    }

    await this.prisma.eventAgendaItem.delete({ where: { id: itemId } });

    return { message: 'Agenda item removed successfully' };
  }

  async remove(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.prisma.event.delete({ where: { id } });

    return { message: 'Event deleted successfully' };
  }
}