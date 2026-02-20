// src/modules/about/about.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AboutService } from './about.service';
import { AdminJwtAuthGuard } from '../../common/guards';
import { CurrentAdmin, Public } from '../../common/decorators';

@ApiTags('About')
@Controller('about')
export class AboutController {
  constructor(private readonly service: AboutService) {}
  @Public() @Get() getAll() { return this.service.getAllContent(); }

  @UseGuards(AdminJwtAuthGuard) @Put('content/:sectionKey') @ApiBearerAuth('admin-jwt')
  updateContent(@Param('sectionKey') key: any, @Body() data: any, @CurrentAdmin('id') aid: string) { return this.service.updateContent(key, data, aid); }

  @UseGuards(AdminJwtAuthGuard) @Post('leadership') @ApiBearerAuth('admin-jwt')
  createLeadership(@Body() data: any) { return this.service.createLeadership(data); }

  @UseGuards(AdminJwtAuthGuard) @Put('leadership/:id') @ApiBearerAuth('admin-jwt')
  updateLeadership(@Param('id') id: string, @Body() data: any) { return this.service.updateLeadership(id, data); }

  @UseGuards(AdminJwtAuthGuard) @Delete('leadership/:id') @ApiBearerAuth('admin-jwt')
  deleteLeadership(@Param('id') id: string) { return this.service.deleteLeadership(id); }

  @UseGuards(AdminJwtAuthGuard) @Post('objectives') @ApiBearerAuth('admin-jwt')
  createObjective(@Body() data: any) { return this.service.createObjective(data); }
}