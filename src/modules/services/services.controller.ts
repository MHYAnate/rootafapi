import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto, ServiceQueryDto } from './dto';
import { JwtAuthGuard, VerifiedUserGuard } from '../../common/guards';
import { CurrentUser, Public } from '../../common/decorators';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly service: ServicesService) {}

  @Public() @Get() @ApiOperation({ summary: 'Get all services (public)' })
  findAll(@Query() query: ServiceQueryDto) { return this.service.findAllPublic(query); }

  @Public() @Get(':id') @ApiOperation({ summary: 'Get service by ID (public)' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @UseGuards(JwtAuthGuard, VerifiedUserGuard) @Get('me/list') @ApiBearerAuth('user-jwt')
  getMyServices(@CurrentUser('id') userId: string, @Query() query: ServiceQueryDto) {
    return this.service.getMyServices(userId, query);
  }

  @UseGuards(JwtAuthGuard, VerifiedUserGuard) @Post() @ApiBearerAuth('user-jwt')
  create(@CurrentUser('id') userId: string, @Body() dto: CreateServiceDto) { return this.service.create(userId, dto); }

  @UseGuards(JwtAuthGuard, VerifiedUserGuard) @Put(':id') @ApiBearerAuth('user-jwt')
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.service.update(userId, id, dto);
  }

  @UseGuards(JwtAuthGuard, VerifiedUserGuard) @Delete(':id') @ApiBearerAuth('user-jwt')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) { return this.service.remove(userId, id); }

  @UseGuards(JwtAuthGuard, VerifiedUserGuard) @Post(':id/images') @ApiBearerAuth('user-jwt')
  addImage(@CurrentUser('id') userId: string, @Param('id') id: string,
    @Body() body: { imageUrl: string; thumbnailUrl: string; isPrimary?: boolean }) {
    return this.service.addImage(userId, id, body.imageUrl, body.thumbnailUrl, body.isPrimary);
  }
}