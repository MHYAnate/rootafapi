// src/modules/events/events.module.ts
import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { AiModule } from '../ai/ai.module';
@Module({  imports: [AiModule],  controllers: [EventsController], providers: [EventsService] })
export class EventsModule {}