import { Controller, Get, Post, Put, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { AdminJwtAuthGuard } from '../../common/guards';
import { Public } from '../../common/decorators';
import { CategoryType } from '@prisma/client';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all categories (public)' })
  findAll(@Query('type') type?: CategoryType) {
    return this.service.findAll(type);
  }

  @Public()
  @Get('type/:type')
  @ApiOperation({ summary: 'Get categories by type (public)' })
  findByType(@Param('type') type: CategoryType) {
    return this.service.findByType(type);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID (public)' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post()
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Create category (Admin)' })
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Update category (Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch(':id/toggle')
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Toggle category active status (Admin)' })
  toggle(@Param('id') id: string) {
    return this.service.toggleActive(id);
  }
}