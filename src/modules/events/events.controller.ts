// src/modules/events/events.controller.ts
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
  // PUBLIC ENDPOINTS (no auth required)
  // ═══════════════════════════════════════════════════════════

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get published events (public)' })
  findAllPublic(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.service.findAllPublic(
      page ? +page : 1,
      limit ? +limit : 12,
      status,
    );
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get single event by ID (public)' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════
  // ADMIN ENDPOINTS (requires admin JWT)
  // ═══════════════════════════════════════════════════════════

  @UseGuards(AdminJwtAuthGuard)
  @Get('admin/all')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Get ALL events including unpublished (admin)' })
  findAllAdmin(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('eventType') eventType?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAllAdmin(
      page ? +page : 1,
      limit ? +limit : 12,
      status,
      eventType,
      search,
    );
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post()
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Create event (admin)' })
  create(@Body() data: any, @CurrentAdmin('id') adminId: string) {
    return this.service.create(data, adminId);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Update event (admin)' })
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
  @ApiOperation({ summary: 'Publish event (admin)' })
  publish(@Param('id') id: string) {
    return this.service.publish(id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch(':id/unpublish')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Unpublish event (admin)' })
  unpublish(@Param('id') id: string) {
    return this.service.unpublish(id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Delete event (admin)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // ─── Gallery ──────────────────────────────────────────────

  @UseGuards(AdminJwtAuthGuard)
  @Post(':id/gallery')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Add gallery image (admin)' })
  addGallery(
    @Param('id') id: string,
    @Body() data: any,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.service.addGalleryImage(id, data, adminId);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Delete(':eventId/gallery/:imageId')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Remove gallery image (admin)' })
  removeGallery(@Param('imageId') imageId: string) {
    return this.service.removeGalleryImage(imageId);
  }

  // ─── Agenda ───────────────────────────────────────────────

  @UseGuards(AdminJwtAuthGuard)
  @Post(':id/agenda')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Add agenda item (admin)' })
  addAgenda(@Param('id') id: string, @Body() data: any) {
    return this.service.addAgendaItem(id, data);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Put(':eventId/agenda/:itemId')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Update agenda item (admin)' })
  updateAgenda(@Param('itemId') itemId: string, @Body() data: any) {
    return this.service.updateAgendaItem(itemId, data);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Delete(':eventId/agenda/:itemId')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Remove agenda item (admin)' })
  removeAgenda(@Param('itemId') itemId: string) {
    return this.service.removeAgendaItem(itemId);
  }
}