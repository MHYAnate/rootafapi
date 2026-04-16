import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RagService } from './rag.service';
import { IngestionService } from './ingestion.service';
import { AdminJwtAuthGuard } from '../../common/guards';
import { Public } from '../../common/decorators';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(
    private ragService: RagService,
    private ingestionService: IngestionService,
  ) {}

  @Public()
  @Post('chat')
  @ApiOperation({ summary: 'Ask the ROOTAF AI a question' })
  chat(
    @Body() body: { question: string; userType?: string; state?: string; name?: string },
  ) {
    return this.ragService.chat(body.question, {
      userType: body.userType,
      state: body.state,
      name: body.name,
    });
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('ingest')
  @ApiOperation({ summary: 'Re-index all data for RAG (Admin only)' })
  ingest() {
    return this.ingestionService.ingestAll();
  }
}