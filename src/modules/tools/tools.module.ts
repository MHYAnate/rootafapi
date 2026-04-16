// src/modules/tools/tools.module.ts
import { Module } from '@nestjs/common';
import { ToolsController } from './tools.controller';
import { ToolsService } from './tools.service';
import { AiModule } from '../ai/ai.module'; 
@Module({  imports: [AiModule],  controllers: [ToolsController], providers: [ToolsService], exports: [ToolsService] })
export class ToolsModule {}