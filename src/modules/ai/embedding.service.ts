import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { pipeline } from '@huggingface/transformers';

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private embedder: any = null;
  private readonly logger = new Logger(EmbeddingService.name);

  async onModuleInit() {
    this.logger.log('Loading HuggingFace embedding model (all-MiniLM-L6-v2)...');
    // This downloads the model to a local cache on first run (~30MB)
    this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      dtype: 'fp32',
    });
    this.logger.log('HuggingFace embedding model loaded successfully.');
  }

  async embed(text: string): Promise<number[]> {
    if (!this.embedder) throw new Error('Embedding model not loaded yet');
    
    const output = await this.embedder(text, {
      pooling: 'mean',
      normalize: true,
    });

    // Returns a 384-dimensional vector
    return Array.from(output.data) as number[];
  }
}