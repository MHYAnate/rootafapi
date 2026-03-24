// src/modules/events/events.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationUtil } from '../../common/utils';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════
  // PUBLIC — only published events
  // ═══════════════════════════════════════════════════════════
  async findAllPublic(page: number = 1, limit: number = 12, status?: string) {
    const { skip, take } = PaginationUtil.getSkipTake(page, limit);
    const where: Prisma.EventWhereInput = { isPublished: true };
    if (status) where.status = status as any;

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take,
        orderBy: { startDate: 'desc' },
        include: { gallery: { take: 1, orderBy: { displayOrder: 'asc' } } },
      }),
      this.prisma.event.count({ where }),
    ]);

    return { data: events, meta: PaginationUtil.createMeta(total, page, limit) };
  }

  // ═══════════════════════════════════════════════════════════
  // ADMIN — ALL events including unpublished/draft
  // ═══════════════════════════════════════════════════════════
  async findAllAdmin(
    page: number = 1,
    limit: number = 12,
    status?: string,
    eventType?: string,
    search?: string,
  ) {
    const { skip, take } = PaginationUtil.getSkipTake(page, limit);
    const where: Prisma.EventWhereInput = {};

    // NO isPublished filter — admin sees everything

    if (status) where.status = status as any;
    if (eventType) where.eventType = eventType as any;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { venueName: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { gallery: { take: 1, orderBy: { displayOrder: 'asc' } } },
      }),
      this.prisma.event.count({ where }),
    ]);

    return { data: events, meta: PaginationUtil.createMeta(total, page, limit) };
  }

  // ═══════════════════════════════════════════════════════════
  // SINGLE EVENT
  // ═══════════════════════════════════════════════════════════
  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        gallery: { orderBy: { displayOrder: 'asc' } },
        agenda: { orderBy: { displayOrder: 'asc' } },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    await this.prisma.event.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
    return { data: event };
  }

  // ═══════════════════════════════════════════════════════════
  // CREATE
  // ═══════════════════════════════════════════════════════════
  async create(data: any, adminId: string) {
    const event = await this.prisma.event.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        createdByAdminId: adminId,
      },
    });
    return { message: 'Event created', data: event };
  }

  // ═══════════════════════════════════════════════════════════
  // UPDATE
  // ═══════════════════════════════════════════════════════════
  async update(id: string, data: any, adminId: string) {
    const event = await this.prisma.event.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        lastUpdatedByAdminId: adminId,
      },
    });
    return { message: 'Event updated', data: event };
  }

  // ═══════════════════════════════════════════════════════════
  // PUBLISH
  // ═══════════════════════════════════════════════════════════
  async publish(id: string) {
    const event = await this.prisma.event.update({
      where: { id },
      data: { isPublished: true, publishedAt: new Date() },
    });
    return { message: 'Event published', data: event };
  }

  // ═══════════════════════════════════════════════════════════
  // UNPUBLISH
  // ═══════════════════════════════════════════════════════════
  async unpublish(id: string) {
    const event = await this.prisma.event.update({
      where: { id },
      data: { isPublished: false },
    });
    return { message: 'Event unpublished', data: event };
  }

  // ═══════════════════════════════════════════════════════════
  // GALLERY
  // ═══════════════════════════════════════════════════════════
  async addGalleryImage(eventId: string, data: any, adminId: string) {
    const img = await this.prisma.eventGalleryImage.create({
      data: { eventId, ...data, uploadedByAdminId: adminId },
    });
    return { message: 'Image added', data: img };
  }

  async removeGalleryImage(imageId: string) {
    await this.prisma.eventGalleryImage.delete({ where: { id: imageId } });
    return { message: 'Image removed' };
  }

  // ═══════════════════════════════════════════════════════════
  // AGENDA
  // ═══════════════════════════════════════════════════════════
  async addAgendaItem(eventId: string, data: any) {
    const item = await this.prisma.eventAgendaItem.create({
      data: { eventId, ...data },
    });
    return { message: 'Agenda item added', data: item };
  }

  async updateAgendaItem(itemId: string, data: any) {
    const item = await this.prisma.eventAgendaItem.update({
      where: { id: itemId },
      data,
    });
    return { message: 'Agenda item updated', data: item };
  }

  async removeAgendaItem(itemId: string) {
    await this.prisma.eventAgendaItem.delete({ where: { id: itemId } });
    return { message: 'Agenda item removed' };
  }

  // ═══════════════════════════════════════════════════════════
  // DELETE
  // ═══════════════════════════════════════════════════════════
  async remove(id: string) {
    await this.prisma.event.delete({ where: { id } });
    return { message: 'Event deleted' };
  }
}