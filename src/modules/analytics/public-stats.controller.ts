// src/modules/analytics/public-stats.controller.ts

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PublicStatsService } from './public-stats.service';

@ApiTags('Public Stats')
@Controller('analytics')
export class PublicStatsController {
  constructor(private readonly publicStatsService: PublicStatsService) {}

  @Get('public-stats')
  @SkipThrottle()
  @ApiOperation({
    summary: 'Get public platform statistics',
    description:
      'Returns aggregated platform statistics for the public homepage. No authentication required.',
  })
  @ApiResponse({
    status: 200,
    description: 'Platform statistics retrieved successfully',
  })
  async getPublicStats() {
    return this.publicStatsService.getPublicStats();
  }
}