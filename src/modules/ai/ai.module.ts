// src/modules/ai/ai.module.ts check
import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { RagService } from './rag.service';
import { IngestionService } from './ingestion.service';
import { EmbeddingService } from './embedding.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [
    RagService,
    IngestionService,
    EmbeddingService,
  ],
  exports: [EmbeddingService, IngestionService],
})
export class AiModule {}