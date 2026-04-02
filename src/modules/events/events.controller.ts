// src/modules/events/events.controller.ts
//updated to to fullyy support admin and public endpoints with pagination, filtering, and status management
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { AdminJwtAuthGuard } from '../../common/guards';
import { CurrentAdmin, Public } from '../../common/decorators';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly service: EventsService) {}

  // ═══════════════════════════════════════════════════════════
  // PUBLIC ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all published events (public)' })
  findAllPublic(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.service.findAllPublic(page, limit, status);
  }

  @Public()
  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming published events' })
  findUpcoming(@Query('limit') limit?: number) {
    return this.service.findUpcoming(limit);
  }

  @Public()
  @Get('past')
  @ApiOperation({ summary: 'Get past events' })
  findPast(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.findPast(page, limit);
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get featured events' })
  findFeatured() {
    return this.service.findFeatured();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID (public)' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════
  // ADMIN ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  @UseGuards(AdminJwtAuthGuard)
  @Get('admin/all')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Get all events including drafts (admin only)' })
  findAllAdmin(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('isPublished') isPublished?: string,
  ) {
    return this.service.findAllAdmin(page, limit, status, isPublished);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('admin/:id')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Get event by ID for admin (includes unpublished)' })
  findOneAdmin(@Param('id') id: string) {
    return this.service.findOneAdmin(id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post()
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Create a new event' })
  create(@Body() data: any, @CurrentAdmin('id') adminId: string) {
    return this.service.create(data, adminId);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Update an event' })
  update(
    @Param('id') id: string,
    @Body() data: any,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.service.update(id, data, adminId);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch(':id/publish')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Publish an event' })
  publish(@Param('id') id: string, @CurrentAdmin('id') adminId: string) {
    return this.service.publish(id, adminId);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch(':id/unpublish')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Unpublish an event' })
  unpublish(@Param('id') id: string, @CurrentAdmin('id') adminId: string) {
    return this.service.unpublish(id, adminId);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch(':id/status')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Update event status' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.service.updateStatus(id, status, adminId);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post(':id/gallery')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Add gallery image to event' })
  addGalleryImage(
    @Param('id') id: string,
    @Body() data: any,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.service.addGalleryImage(id, data, adminId);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Delete(':id/gallery/:imageId')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Remove gallery image from event' })
  removeGalleryImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.service.removeGalleryImage(id, imageId);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post(':id/agenda')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Add agenda item to event' })
  addAgendaItem(@Param('id') id: string, @Body() data: any) {
    return this.service.addAgendaItem(id, data);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Put(':id/agenda/:itemId')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Update agenda item' })
  updateAgendaItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() data: any,
  ) {
    return this.service.updateAgendaItem(id, itemId, data);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Delete(':id/agenda/:itemId')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Remove agenda item from event' })
  removeAgendaItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.service.removeAgendaItem(id, itemId);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Delete an event' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}