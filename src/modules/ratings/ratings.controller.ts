// src/modules/ratings/ratings.controller.ts
import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser, Public } from '../../common/decorators';

@ApiTags('Ratings')
@Controller('ratings')
export class RatingsController {
  constructor(private readonly service: RatingsService) {}
  @Public() @Get('member/:memberId') findByMember(@Param('memberId') id: string, @Query('page') p?: number, @Query('limit') l?: number) { return this.service.findByMember(id, p, l); }
  @UseGuards(JwtAuthGuard) @Post() @ApiBearerAuth('user-jwt')
  create(@CurrentUser('id') uid: string, @Body() dto: CreateRatingDto) { return this.service.create(uid, dto); }
  @UseGuards(JwtAuthGuard) @Get('me/given') @ApiBearerAuth('user-jwt')
  myGiven(@CurrentUser('id') uid: string) { return this.service.getMyRatingsGiven(uid); }
  @UseGuards(JwtAuthGuard) @Get('me/received') @ApiBearerAuth('user-jwt')
  myReceived(@CurrentUser('id') uid: string, @Query('page') p?: number) { return this.service.getMyRatingsReceived(uid, p); }
}