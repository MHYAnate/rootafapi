import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmbeddingService } from './embedding.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class RagService {
  private genAI: GoogleGenerativeAI;

  constructor(
    private prisma: PrismaService,
    private embeddingService: EmbeddingService,
  ) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async chat(
    question: string,
    userContext?: { userType?: string; state?: string; name?: string },
  ): Promise<{ answer: string; sources: any[] }> {
    const queryEmbedding = await this.embeddingService.embed(question);
    const vectorString = `[${queryEmbedding.join(',')}]`;

    // Query the new search_embeddings table
    const results: any[] = await this.prisma.$queryRaw`
      SELECT id, type, related_id, content, metadata,
             1 - (embedding <=> ${vectorString}::vector) as similarity
      FROM search_embeddings
      ORDER BY embedding <=> ${vectorString}::vector
      LIMIT 10
    `;

    const relevantDocs = results.filter((r) => r.similarity > 0.4);

    if (relevantDocs.length === 0) {
      return {
        answer: "I don't have enough information to answer that question. Please contact ROOTAF Foundation at info@rootaf.ng for more details.",
        sources: [],
      };
    }

    const contextSections = relevantDocs.map((doc) =>
      `[Source: ${doc.type}]\n${doc.content}`
    ).join('\n\n---\n\n');

    const userCtx = userContext
      ? `\nUSER CONTEXT: ${userContext.name ? `Name: ${userContext.name}.` : ''} ${userContext.userType ? `Type: ${userContext.userType}.` : ''} ${userContext.state ? `Located in: ${userContext.state} State.` : ''}\n`
      : '';

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are the ROOTAF (Rooted to Rise) Foundation AI assistant — an intelligent advisor for farmers, artisans, clients, and the general public across Nigeria.

Your motto: "Rooted to Rise — from the root, we rise; no matter the soil, we grow." 🌱

CAPABILITIES:
- Answer questions about the foundation (mission, vision, objectives, leadership, contact)
- Help clients find the best products, services, or tools by location, price, rating, and availability
- Help members/artisans identify business opportunities (where demand exceeds supply)
- Provide market analysis and comparisons across states
- Share information about sponsors, partners, and categories

RULES:
1. Answer based ONLY on the provided context data.
2. If the context doesn't contain enough information, say so and suggest contacting inmajidadi@rootaf.ng.
3. Be specific — mention actual names, prices, locations, and ratings when available.
4. When comparing locations, rank them and explain why.
5. For market opportunity questions, highlight where demand > supply (gaps).
6. For product/service recommendations, consider price, rating, and availability together.
7. Use Nigerian Naira (₦) for all prices.
8. Be friendly, professional, and encouraging.
9. Keep responses concise but informative — use bullet points for comparisons.
10. If the user asks about a specific state, prioritize data from that state.
${userCtx}
CONTEXT DATA:
${contextSections}

USER QUESTION: ${question}

ANSWER:`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    const sources = relevantDocs.map((doc) => ({
      type: doc.type,
      relatedId: doc.related_id,
      metadata: doc.metadata,
      relevance: Math.round(doc.similarity * 100),
    }));

    return { answer, sources };
  }
}