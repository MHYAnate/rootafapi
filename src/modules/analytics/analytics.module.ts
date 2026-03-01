// src/modules/analytics/analytics.module.ts

import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PublicStatsController } from './public-stats.controller';
import { PublicStatsService } from './public-stats.service';

@Module({
  controllers: [AnalyticsController, PublicStatsController],
  providers: [AnalyticsService, PublicStatsService],
  exports: [AnalyticsService, PublicStatsService],
})
export class AnalyticsModule {}