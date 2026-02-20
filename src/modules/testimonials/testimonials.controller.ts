// src/modules/testimonials/testimonials.controller.ts
import { Controller, Get, Post, Put, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TestimonialsService } from './testimonials.service';
import { AdminJwtAuthGuard } from '../../common/guards';
import { CurrentAdmin, Public } from '../../common/decorators';

@ApiTags('Testimonials')
@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly service: TestimonialsService) {}
  @Public() @Get() findAll(@Query('page') p?: number, @Query('limit') l?: number) { return this.service.findAllPublic(p, l); }
  @UseGuards(AdminJwtAuthGuard) @Post() @ApiBearerAuth('admin-jwt') create(@Body() d: any) { return this.service.create(d); }
  @UseGuards(AdminJwtAuthGuard) @Put(':id') @ApiBearerAuth('admin-jwt') update(@Param('id') id: string, @Body() d: any) { return this.service.update(id, d); }
  @UseGuards(AdminJwtAuthGuard) @Patch(':id/approve') @ApiBearerAuth('admin-jwt') approve(@Param('id') id: string, @CurrentAdmin('id') aid: string) { return this.service.approve(id, aid); }
  @UseGuards(AdminJwtAuthGuard) @Delete(':id') @ApiBearerAuth('admin-jwt') remove(@Param('id') id: string) { return this.service.remove(id); }
}