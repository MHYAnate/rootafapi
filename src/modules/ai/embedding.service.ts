import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';

@Injectable()
export class EmbeddingService {
  private genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly MODEL = 'gemini-embedding-001';
  readonly DIMENSION = 768;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.logger.log(`Using Google ${this.MODEL} for embeddings (${this.DIMENSION}-dim)`);
  }

  async embed(text: string): Promise<number[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.MODEL });
      const result = await model.embedContent({
        content: { role: 'user', parts: [{ text }] },
        taskType: TaskType.RETRIEVAL_DOCUMENT,
      });
      return result.embedding.values;
    } catch (error) {
      this.logger.error(`Embedding failed: ${error.message}`);
      throw error;
    }
  }

  async embedQuery(text: string): Promise<number[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.MODEL });
      const result = await model.embedContent({
        content: { role: 'user', parts: [{ text }] },
        taskType: TaskType.RETRIEVAL_QUERY,
      });
      return result.embedding.values;
    } catch (error) {
      this.logger.error(`Query embedding failed: ${error.message}`);
      throw error;
    }
  }
}