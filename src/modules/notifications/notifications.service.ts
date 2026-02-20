// src/modules/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationUtil } from '../../common/utils';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getMyNotifications(userId: string, page: number = 1, limit: number = 20) {
    const { skip, take } = PaginationUtil.getSkipTake(page, limit);
    const [notifs, total] = await Promise.all([
      this.prisma.notification.findMany({ where: { userId, status: { not: 'DELETED' } }, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.notification.count({ where: { userId, status: { not: 'DELETED' } } }),
    ]);
    return { data: notifs, meta: PaginationUtil.createMeta(total, page, limit) };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({ where: { userId, status: 'UNREAD' } });
    return { data: { count } };
  }

  async markAsRead(userId: string, notifId: string) {
    await this.prisma.notification.updateMany({ where: { id: notifId, userId }, data: { status: 'READ', readAt: new Date() } });
    return { message: 'Marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({ where: { userId, status: 'UNREAD' }, data: { status: 'READ', readAt: new Date() } });
    return { message: 'All marked as read' };
  }
}