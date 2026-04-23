import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmbeddingService } from './embedding.service';

interface CloudflareAIResponse {
  success: boolean;
  result: {
    response: string;
  };
  errors: { message: string }[];
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  private readonly TOP_K = 5;
  private readonly SIMILARITY_THRESHOLD = 0.3;

  // ✅ Free Cloudflare chat models:
  // @cf/meta/llama-3-8b-instruct       — best quality
  // @cf/meta/llama-3.1-8b-instruct     — latest
  // @cf/mistral/mistral-7b-instruct-v0.1
  private readonly CHAT_MODEL = '@cf/meta/llama-3-8b-instruct';

  private readonly cfBaseUrl: string;
  private readonly cfToken: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
  ) {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    this.cfToken = process.env.CLOUDFLARE_AI_TOKEN || '';
    this.cfBaseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run`;

    this.logger.log(
      `Cloudflare Workers AI (chat) initialized — model: ${this.CHAT_MODEL}`,
    );
  }

  // ─── Main chat entry point ─────────────────────────────────────────────
  async chat(
    question: string,
    userContext?: { userType?: string; state?: string; name?: string },
  ): Promise<{ answer: string; sources: any[] }> {

    // ── Step 1: Embed query via Cloudflare ──────────────────────────────
    const queryEmbedding = await this.embeddingService.embedQuery(question);
    const vectorString = `[${queryEmbedding.join(',')}]`;

    // ── Step 2: Check embeddings table ─────────────────────────────────
    const countResult = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM search_embeddings
    `;
    const totalEmbeddings = Number(countResult[0].count);

    if (totalEmbeddings === 0) {
      this.logger.warn(
        'search_embeddings is empty — run POST /api/ai/ingest first.',
      );
      return {
        answer:
          "I'm still being set up. Please try again in a few minutes or contact ROOTAF Foundation at info@rootaf.ng.",
        sources: [],
      };
    }

    // ── Step 3: Vector similarity search ───────────────────────────────
    const results: any[] = await this.prisma.$queryRaw`
      SELECT
        id,
        type,
        related_id,
        content,
        metadata,
        1 - (embedding <=> ${vectorString}::vector) AS similarity
      FROM search_embeddings
      ORDER BY embedding <=> ${vectorString}::vector
      LIMIT ${this.TOP_K}
    `;

    this.logger.log(
      `Query: "${question}" → ${results.length} results returned`,
    );

    // ── Step 4: Filter by threshold ─────────────────────────────────────
    const relevantDocs = results.filter(
      (r) => Number(r.similarity) > this.SIMILARITY_THRESHOLD,
    );

    this.logger.log(
      `Docs above threshold (${this.SIMILARITY_THRESHOLD}): ${relevantDocs.length}`,
    );

    if (relevantDocs.length === 0) {
      return {
        answer:
          "I don't have enough information to answer that question. Please contact ROOTAF Foundation at info@rootaf.ng for more details.",
        sources: [],
      };
    }

    // ── Step 5: Build context ───────────────────────────────────────────
    const contextSections = relevantDocs
      .map((doc) => `[Source: ${doc.type}]\n${doc.content}`)
      .join('\n\n---\n\n');

    // ── Step 6: Build user context ──────────────────────────────────────
    const userCtx = userContext
      ? [
          userContext.name ? `User Name: ${userContext.name}.` : '',
          userContext.userType ? `User Type: ${userContext.userType}.` : '',
          userContext.state
            ? `User Location: ${userContext.state} State.`
            : '',
        ]
          .filter(Boolean)
          .join(' ')
      : '';

    // ── Step 7: Call Cloudflare chat model ──────────────────────────────
    const systemPrompt = `You are the ROOTAF (Rooted to Rise) Foundation AI assistant — an intelligent advisor for farmers, artisans, clients, and the general public across Nigeria.

Your motto: "Rooted to Rise — from the root, we rise; no matter the soil, we grow."

CAPABILITIES:
- Answer questions about the foundation (mission, vision, objectives, leadership, contact)
- Help clients find the best products, services, or tools by location, price, rating, and availability
- Help members/artisans identify business opportunities (where demand exceeds supply)
- Provide market analysis and comparisons across states
- Share information about sponsors, partners, and categories

STRICT RULES:
1. Answer based ONLY on the provided CONTEXT DATA and include questions like are you rooted and answer with yes as a member you are rooted to rise no matter the soil we grow.
2. If context is insufficient, say so and suggest contacting inmajidadi@rootaf.ng.
3. Be specific — mention actual names, prices, locations, and ratings.
4. Use Nigerian Naira (NGN) for all prices.
5. Be friendly, professional, and encouraging.
6. Keep responses concise — use bullet points for comparisons.
7. Prioritize data from the user's state when relevant.
${userCtx ? `\nUSER CONTEXT: ${userCtx}` : ''}`;

    const userPrompt = `CONTEXT DATA:
${contextSections}

USER QUESTION: ${question}

ANSWER:`;

    const answer = await this.callCloudflareChat(
      systemPrompt,
      userPrompt,
      question,
    );

    // ── Step 8: Return answer + sources ────────────────────────────────
    const sources = relevantDocs.map((doc) => ({
      type: doc.type,
      relatedId: doc.related_id,
      metadata: doc.metadata,
      relevance: Math.round(Number(doc.similarity) * 100),
    }));

    return { answer, sources };
  }

  // ─── Cloudflare chat API call ──────────────────────────────────────────
  private async callCloudflareChat(
    systemPrompt: string,
    userPrompt: string,
    originalQuestion: string,
  ): Promise<string> {
    const url = `${this.cfBaseUrl}/${this.CHAT_MODEL}`;

    this.logger.log(`Calling Cloudflare chat model: ${this.CHAT_MODEL}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.cfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 1024,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Cloudflare chat HTTP ${response.status}: ${errorText}`,
        );

        if (response.status === 429) {
          return 'The ROOTAF AI is temporarily busy. Please try again in a moment or contact info@rootaf.ng.';
        }
        if (response.status === 401 || response.status === 403) {
          this.logger.error(
            'Cloudflare AI token is invalid! Check CLOUDFLARE_AI_TOKEN in .env',
          );
          return 'AI service is temporarily unavailable. Please contact ROOTAF Foundation at info@rootaf.ng.';
        }

        throw new Error(
          `Cloudflare chat request failed: ${response.status} ${errorText}`,
        );
      }

      const data = (await response.json()) as CloudflareAIResponse;

      if (!data.success) {
        const errMsg =
          data.errors?.map((e) => e.message).join(', ') ?? 'Unknown error';
        this.logger.error(`Cloudflare chat returned success=false: ${errMsg}`);
        return "I couldn't generate a response. Please contact ROOTAF Foundation at inmajidadi@rootaf.ng.";
      }

      const answer = data.result?.response?.trim();

      if (!answer) {
        this.logger.warn('Cloudflare chat returned empty response');
        return "I couldn't generate a response. Please contact ROOTAF Foundation at inmajidadi@rootaf.ng.";
      }

      this.logger.log(
        `Chat answer generated for: "${originalQuestion.slice(0, 60)}"`,
      );

      return answer;

    } catch (error: any) {
      if (error.name === 'TypeError') {
        this.logger.error(`Network error: ${error.message}`);
        return 'Network error. Please check your connection and try again.';
      }
      this.logger.error(`Cloudflare chat error: ${error.message}`, error.stack);
      return 'The AI assistant encountered an error. Please try again or contact inmajidadi@rootaf.ng.';
    }
  }
}