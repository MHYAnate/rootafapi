// src/modules/about/about.module.ts
import { Module } from '@nestjs/common';
import { AboutController } from './about.controller';
import { AboutService } from './about.service';
import { AiModule } from '../ai/ai.module'; // ADD THIS
@Module({  imports: [AiModule], controllers: [AboutController], providers: [AboutService] })
export class AboutModule {}