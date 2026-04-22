// src/modules/ai/embedding.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

// Cloudflare BGE embedding response shape
interface CloudflareEmbeddingResponse {
  success: boolean;
  result: {
    shape: number[];
    data: number[][];
  };
  errors: { message: string }[];
}

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingService.name);

  // ✅ BGE-base produces exactly 768 dimensions — matches your DB perfectly
  private readonly EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';
  readonly DIMENSION = 768;

  private readonly cfBaseUrl: string;
  private readonly cfToken: string;

  constructor() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    this.cfToken = process.env.CLOUDFLARE_AI_TOKEN || '';

    if (!accountId) {
      this.logger.error(
        '══════════════════════════════════════════════════\n' +
        '  CLOUDFLARE_ACCOUNT_ID is missing from .env!\n' +
        '══════════════════════════════════════════════════',
      );
    }

    if (!this.cfToken) {
      this.logger.error(
        '══════════════════════════════════════════════════\n' +
        '  CLOUDFLARE_AI_TOKEN is missing from .env!\n' +
        '══════════════════════════════════════════════════',
      );
    }

    this.cfBaseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run`;

    this.logger.log(
      `Embedding provider: Cloudflare Workers AI\n` +
      `Embedding model: ${this.EMBEDDING_MODEL}\n` +
      `Dimensions: ${this.DIMENSION}`,
    );
  }

  async onModuleInit(): Promise<void> {
    await this.validateDimension();
  }

  // ─── Validate embedding dimensions on startup ──────────────────────────
  private async validateDimension(): Promise<void> {
    try {
      const testEmbedding = await this.embed('dimension validation test');
      if (testEmbedding.length !== this.DIMENSION) {
        throw new Error(
          `Dimension mismatch! Expected ${this.DIMENSION} but got ${testEmbedding.length}`,
        );
      }
      this.logger.log(
        `Embedding dimension validation passed: ${testEmbedding.length}D ✓`,
      );
    } catch (error) {
      this.logger.error(
        `Embedding dimension validation failed: ${error.message}`,
      );
    }
  }

  // ─── Core embed method (for ingestion) ────────────────────────────────
  async embed(text: string): Promise<number[]> {
    return this.callCloudflarEmbedding(text);
  }

  // ─── Core embedQuery method (for search queries) ───────────────────────
  async embedQuery(text: string): Promise<number[]> {
    // BGE models use the same endpoint for both document and query embedding
    return this.callCloudflarEmbedding(text);
  }

  // ─── Cloudflare embedding API call ────────────────────────────────────
  private async callCloudflarEmbedding(text: string): Promise<number[]> {
    const url = `${this.cfBaseUrl}/${this.EMBEDDING_MODEL}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.cfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorText = await response.text();

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            `Cloudflare Auth Error (${response.status}): Invalid CLOUDFLARE_AI_TOKEN. ` +
            `Check your token at https://dash.cloudflare.com/profile/api-tokens`,
          );
        }

        if (response.status === 429) {
          throw new Error(
            `Cloudflare rate limit hit. Wait a moment and try again.`,
          );
        }

        throw new Error(
          `Cloudflare Embedding Error (${response.status}): ${errorText}`,
        );
      }

      const data = (await response.json()) as CloudflareEmbeddingResponse;

      if (!data.success) {
        const errMsg =
          data.errors?.map((e) => e.message).join(', ') ?? 'Unknown error';
        throw new Error(`Cloudflare embedding failed: ${errMsg}`);
      }

      // Cloudflare returns data as array of arrays — we sent one text so take index 0
      const embedding = data.result?.data?.[0];

      if (!embedding || !Array.isArray(embedding)) {
        throw new Error(
          `Cloudflare returned invalid embedding structure: ${JSON.stringify(data.result)}`,
        );
      }

      this.assertDimension(embedding, 'callCloudflareEmbedding');
      return embedding;

    } catch (error: any) {
      // Re-throw with context if it's our own error
      if (
        error.message?.includes('Cloudflare') ||
        error.message?.includes('dimension')
      ) {
        throw error;
      }

      // Network error
      if (error.name === 'TypeError') {
        throw new Error(
          `Network error calling Cloudflare embedding API: ${error.message}`,
        );
      }

      throw new Error(`Embedding failed: ${error.message}`);
    }
  }

  // ─── Dimension assertion ───────────────────────────────────────────────
  private assertDimension(values: number[], caller: string): void {
    if (values.length !== this.DIMENSION) {
      throw new Error(
        `[${caller}] Expected ${this.DIMENSION} dimensions but got ${values.length}`,
      );
    }
  }
}