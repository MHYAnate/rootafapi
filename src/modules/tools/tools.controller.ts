// src/modules/tools/tools.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ToolsService } from './tools.service';
import { CreateToolDto, UpdateToolDto, ToolQueryDto } from './dto';
import { JwtAuthGuard, VerifiedUserGuard } from '../../common/guards';
import { CurrentUser, Public } from '../../common/decorators';

@ApiTags('Tools')
@Controller('tools')
export class ToolsController {
  constructor(private readonly service: ToolsService) {}
  @Public() @Get() findAll(@Query() q: ToolQueryDto) { return this.service.findAllPublic(q); }
  @Public() @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @UseGuards(JwtAuthGuard, VerifiedUserGuard) @Get('me/list') @ApiBearerAuth('user-jwt')
  getMyTools(@CurrentUser('id') uid: string, @Query() q: ToolQueryDto) { return this.service.getMyTools(uid, q); }
  @UseGuards(JwtAuthGuard, VerifiedUserGuard) @Post() @ApiBearerAuth('user-jwt')
  create(@CurrentUser('id') uid: string, @Body() dto: CreateToolDto) { return this.service.create(uid, dto); }
  @UseGuards(JwtAuthGuard, VerifiedUserGuard) @Put(':id') @ApiBearerAuth('user-jwt')
  update(@CurrentUser('id') uid: string, @Param('id') id: string, @Body() dto: UpdateToolDto) { return this.service.update(uid, id, dto); }
  @UseGuards(JwtAuthGuard, VerifiedUserGuard) @Delete(':id') @ApiBearerAuth('user-jwt')
  remove(@CurrentUser('id') uid: string, @Param('id') id: string) { return this.service.remove(uid, id); }
  @UseGuards(JwtAuthGuard, VerifiedUserGuard) @Post(':id/images') @ApiBearerAuth('user-jwt')
  addImage(@CurrentUser('id') uid: string, @Param('id') id: string, @Body() b: { imageUrl: string; thumbnailUrl: string; isPrimary?: boolean }) { return this.service.addImage(uid, id, b.imageUrl, b.thumbnailUrl, b.isPrimary); }
}