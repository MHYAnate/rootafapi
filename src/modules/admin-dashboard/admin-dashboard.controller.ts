import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminJwtAuthGuard } from '../../common/guards';
import { CurrentAdmin } from '../../common/decorators';

@ApiTags('Admin Dashboard')
@Controller('admin/dashboard')
@UseGuards(AdminJwtAuthGuard)
@ApiBearerAuth('admin-jwt')
export class AdminDashboardController {
  constructor(private readonly service: AdminDashboardService) {}

  // ─── Dashboard Overview ────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Complete dashboard overview with all stats' })
  getOverview() {
    return this.service.getOverview();
  }

  // ─── Activity Logs ─────────────────────────────────────────
  @Get('activity-log')
  @ApiOperation({ summary: 'Get admin activity log with filters' })
  getActivityLog(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('adminId') adminId?: string,
    @Query('actionType') actionType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getActivityLog(
      page,
      limit,
      adminId,
      actionType,
      startDate,
      endDate,
    );
  }

  // ─── Content Reports ──────────────────────────────────────
  @Get('reports/content')
  @ApiOperation({ summary: 'Get content reports (flagged items)' })
  getContentReports(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.service.getContentReports(page, limit, status);
  }

  @Post('reports/content/:id/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve a content report' })
  resolveReport(
    @Param('id') id: string,
    @CurrentAdmin('id') adminId: string,
    @Body()
    body: { resolution: string; notes: string; actionTaken: string },
  ) {
    return this.service.resolveContentReport(
      id,
      adminId,
      body.resolution,
      body.notes,
      body.actionTaken,
    );
  }

  // ─── Listing Management ───────────────────────────────────
  @Patch('listings/:type/:id/feature')
  @ApiOperation({ summary: 'Toggle listing featured status' })
  toggleFeatured(
    @Param('type') type: 'product' | 'service' | 'tool',
    @Param('id') id: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.service.toggleListingFeatured(type, id, adminId);
  }

  @Post('listings/:type/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a listing (admin action)' })
  deactivateListing(
    @Param('type') type: 'product' | 'service' | 'tool',
    @Param('id') id: string,
    @CurrentAdmin('id') adminId: string,
    @Body('reason') reason: string,
  ) {
    return this.service.deactivateListing(type, id, adminId, reason);
  }

  // ─── Member Management ────────────────────────────────────
  @Patch('members/:id/feature')
  @ApiOperation({ summary: 'Toggle member featured status' })
  toggleMemberFeatured(
    @Param('id') id: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.service.toggleMemberFeatured(id, adminId);
  }

  // ─── Rating Moderation ────────────────────────────────────
  @Get('ratings/reported')
  @ApiOperation({ summary: 'Get reported ratings for moderation' })
  getReportedRatings(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.getReportedRatings(page, limit);
  }

  @Post('ratings/:id/moderate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Moderate a rating (hide/remove/dismiss)' })
  moderateRating(
    @Param('id') id: string,
    @CurrentAdmin('id') adminId: string,
    @Body() body: { action: 'hide' | 'remove' | 'dismiss'; notes?: string },
  ) {
    return this.service.moderateRating(id, adminId, body.action, body.notes);
  }

  // ─── Announcements ────────────────────────────────────────
  @Get('announcements')
  @ApiOperation({ summary: 'Get all announcements' })
  getAnnouncements(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.getAnnouncements(page, limit);
  }

  @Post('announcements')
  @ApiOperation({ summary: 'Create announcement' })
  createAnnouncement(
    @Body() data: any,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.service.createAnnouncement(data, adminId);
  }

  @Put('announcements/:id')
  @ApiOperation({ summary: 'Update announcement' })
  updateAnnouncement(@Param('id') id: string, @Body() data: any) {
    return this.service.updateAnnouncement(id, data);
  }

  @Delete('announcements/:id')
  @ApiOperation({ summary: 'Delete announcement' })
  deleteAnnouncement(@Param('id') id: string) {
    return this.service.deleteAnnouncement(id);
  }

  // ─── FAQs ─────────────────────────────────────────────────
  @Get('faqs')
  @ApiOperation({ summary: 'Get all FAQs (admin)' })
  getAllFaqs() {
    return this.service.getAllFaqs();
  }

  @Post('faqs')
  @ApiOperation({ summary: 'Create FAQ' })
  createFaq(@Body() data: any) {
    return this.service.createFaq(data);
  }

  @Put('faqs/:id')
  @ApiOperation({ summary: 'Update FAQ' })
  updateFaq(@Param('id') id: string, @Body() data: any) {
    return this.service.updateFaq(id, data);
  }

  @Delete('faqs/:id')
  @ApiOperation({ summary: 'Delete FAQ' })
  deleteFaq(@Param('id') id: string) {
    return this.service.deleteFaq(id);
  }

  // ─── Data Export ──────────────────────────────────────────
  @Get('export/users')
  @ApiOperation({ summary: 'Export users data' })
  exportUsers(@Query('userType') userType?: string) {
    return this.service.exportUsers(userType);
  }

  @Get('export/transactions')
  @ApiOperation({ summary: 'Export transactions data' })
  exportTransactions(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.exportTransactions(startDate, endDate);
  }
}