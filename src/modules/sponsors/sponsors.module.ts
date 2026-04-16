// src/modules/sponsors/sponsors.module.ts
import { Module } from '@nestjs/common';
import { SponsorsController } from './sponsors.controller';
import { SponsorsService } from './sponsors.service';
import { AiModule } from '../ai/ai.module'; 
@Module({imports: [AiModule], controllers: [SponsorsController], providers: [SponsorsService] })
export class SponsorsModule {}