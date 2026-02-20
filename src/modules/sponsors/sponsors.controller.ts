// src/modules/sponsors/sponsors.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SponsorsService } from './sponsors.service';
import { AdminJwtAuthGuard } from '../../common/guards';
import { Public } from '../../common/decorators';

@ApiTags('Sponsors')
@Controller('sponsors')
export class SponsorsController {
  constructor(private readonly service: SponsorsService) {}
  @Public() @Get() findAll(@Query('page') p?: number, @Query('limit') l?: number) { return this.service.findAll(p, l); }
  @Public() @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @UseGuards(AdminJwtAuthGuard) @Post() @ApiBearerAuth('admin-jwt') create(@Body() d: any) { return this.service.create(d); }
  @UseGuards(AdminJwtAuthGuard) @Put(':id') @ApiBearerAuth('admin-jwt') update(@Param('id') id: string, @Body() d: any) { return this.service.update(id, d); }
  @UseGuards(AdminJwtAuthGuard) @Delete(':id') @ApiBearerAuth('admin-jwt') remove(@Param('id') id: string) { return this.service.remove(id); }
}