// src/modules/ratings/ratings.module.ts
import { Module } from '@nestjs/common';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { AiModule } from '../ai/ai.module';
@Module({ imports: [AiModule],  controllers: [RatingsController], providers: [RatingsService], exports: [RatingsService] })
export class RatingsModule {}