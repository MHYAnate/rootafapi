// src/modules/analytics/analytics.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AdminJwtAuthGuard } from '../../common/guards';

@ApiTags('Analytics')
@Controller('admin/analytics')
@UseGuards(AdminJwtAuthGuard)
@ApiBearerAuth('admin-jwt')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}
  @Get('dashboard') getDashboard() { return this.service.getDashboardStats(); }
  @Get('verifications') getVerifications() { return this.service.getVerificationStats(); }
  @Get('members-by-state') getMembersByState() { return this.service.getMembersByState(); }
  @Get('recent-activity') getActivity(@Query('limit') l?: number) { return this.service.getRecentActivity(l); }
}