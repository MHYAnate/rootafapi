// src/modules/events/events.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationUtil } from '../../common/utils';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAllPublic(page: number = 1, limit: number = 12, status?: string) {
    const { skip, take } = PaginationUtil.getSkipTake(page, limit);
    const where: Prisma.EventWhereInput = { isPublished: true };
    if (status) where.status = status as any;
    const [events, total] = await Promise.all([
      this.prisma.event.findMany({ where, skip, take, orderBy: { startDate: 'desc' }, include: { gallery: { take: 1, orderBy: { displayOrder: 'asc' } } } }),
      this.prisma.event.count({ where }),
    ]);
    return { data: events, meta: PaginationUtil.createMeta(total, page, limit) };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { gallery: { orderBy: { displayOrder: 'asc' } }, agenda: { orderBy: { displayOrder: 'asc' } } },
    });
    if (!event) throw new NotFoundException('Event not found');
    await this.prisma.event.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return { data: event };
  }

  async create(data: any, adminId: string) {
    const event = await this.prisma.event.create({ data: { ...data, startDate: new Date(data.startDate), endDate: data.endDate ? new Date(data.endDate) : null, createdByAdminId: adminId } });
    return { message: 'Event created', data: event };
  }

  async update(id: string, data: any, adminId: string) {
    const event = await this.prisma.event.update({
      where: { id },
      data: { ...data, startDate: data.startDate ? new Date(data.startDate) : undefined, endDate: data.endDate ? new Date(data.endDate) : undefined, lastUpdatedByAdminId: adminId },
    });
    return { message: 'Event updated', data: event };
  }

  async publish(id: string) {
    const event = await this.prisma.event.update({ where: { id }, data: { isPublished: true, publishedAt: new Date() } });
    return { message: 'Event published', data: event };
  }

  async addGalleryImage(eventId: string, data: any, adminId: string) {
    const img = await this.prisma.eventGalleryImage.create({ data: { eventId, ...data, uploadedByAdminId: adminId } });
    return { message: 'Image added', data: img };
  }

  async addAgendaItem(eventId: string, data: any) {
    const item = await this.prisma.eventAgendaItem.create({ data: { eventId, ...data } });
    return { message: 'Agenda item added', data: item };
  }

  async remove(id: string) {
    await this.prisma.event.delete({ where: { id } });
    return { message: 'Event deleted' };
  }
}