// src/modules/events/events.controller.ts
import { Controller, Get, Post, Put, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { AdminJwtAuthGuard } from '../../common/guards';
import { CurrentAdmin, Public } from '../../common/decorators';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly service: EventsService) {}
  @Public() @Get() findAll(@Query('page') p?: number, @Query('limit') l?: number, @Query('status') s?: string) { return this.service.findAllPublic(p, l, s); }
  @Public() @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @UseGuards(AdminJwtAuthGuard) @Post() @ApiBearerAuth('admin-jwt') create(@Body() d: any, @CurrentAdmin('id') aid: string) { return this.service.create(d, aid); }
  @UseGuards(AdminJwtAuthGuard) @Put(':id') @ApiBearerAuth('admin-jwt') update(@Param('id') id: string, @Body() d: any, @CurrentAdmin('id') aid: string) { return this.service.update(id, d, aid); }
  @UseGuards(AdminJwtAuthGuard) @Patch(':id/publish') @ApiBearerAuth('admin-jwt') publish(@Param('id') id: string) { return this.service.publish(id); }
  @UseGuards(AdminJwtAuthGuard) @Post(':id/gallery') @ApiBearerAuth('admin-jwt') addGallery(@Param('id') id: string, @Body() d: any, @CurrentAdmin('id') aid: string) { return this.service.addGalleryImage(id, d, aid); }
  @UseGuards(AdminJwtAuthGuard) @Post(':id/agenda') @ApiBearerAuth('admin-jwt') addAgenda(@Param('id') id: string, @Body() d: any) { return this.service.addAgendaItem(id, d); }
  @UseGuards(AdminJwtAuthGuard) @Delete(':id') @ApiBearerAuth('admin-jwt') remove(@Param('id') id: string) { return this.service.remove(id); }
}