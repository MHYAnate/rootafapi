// src/modules/notifications/notifications.controller.ts
import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('user-jwt')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}
  @Get() getMy(@CurrentUser('id') uid: string, @Query('page') p?: number) { return this.service.getMyNotifications(uid, p); }
  @Get('unread-count') getCount(@CurrentUser('id') uid: string) { return this.service.getUnreadCount(uid); }
  @Patch(':id/read') markRead(@CurrentUser('id') uid: string, @Param('id') id: string) { return this.service.markAsRead(uid, id); }
  @Patch('read-all') markAll(@CurrentUser('id') uid: string) { return this.service.markAllAsRead(uid); }
}