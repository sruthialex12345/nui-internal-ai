// import {
//   Injectable,
//   ForbiddenException,
//   NotFoundException,
// } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.services';
// import { ConfigService } from '@nestjs/config';
// import type { Response } from 'express';
// import OpenAI from 'openai';

// @Injectable()
// export class AiService {
//   private openai: OpenAI;

//   constructor(
//     private prisma: PrismaService,
//     private config: ConfigService,
//   ) {
//     this.openai = new OpenAI({
//       apiKey: 'dummy-key',
//       baseURL: 'http://localhost:4000',
//     });
//   }

//   async respond(
//     userId: string,
//     chatId: string,
//     res: Response,
//     imageBase64?: string,
//     imageMime?: string,
//   ) {
//     // 1️⃣ Validate chat ownership
//     const chat = await this.prisma.chat.findUnique({
//       where: { id: chatId },
//     });

//     if (!chat) throw new NotFoundException('Chat not found');
//     if (chat.userId !== userId) throw new ForbiddenException('Access denied');

//     // 2️⃣ Get user model preference
//     const user = await this.prisma.user.findUnique({ where: { id: userId } });
//     const model = imageBase64
//       ? 'gpt-4o'
//       : (user?.preferredModel ?? 'gpt-4o-mini');

//     // 3️⃣ Fetch messages fresh from DB (ensures deletes are committed)
//     const freshMessages = await this.prisma.message.findMany({
//       where: { chatId },
//       orderBy: { createdAt: 'asc' },
//     });

//     const formattedMessages = freshMessages.map((msg) => ({
//       role:
//         msg.role === 'USER'
//           ? 'user'
//           : msg.role === 'ASSISTANT'
//             ? 'assistant'
//             : 'system',
//       content: msg.content,
//     })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

//     // If image provided, replace last user message with vision format
//     if (imageBase64) {
//       const base64Data = imageBase64.split(',')[1];
//       const lastUserIdx = [...formattedMessages]
//         .reverse()
//         .findIndex((m) => m.role === 'user');
//       if (lastUserIdx !== -1) {
//         const realIdx = formattedMessages.length - 1 - lastUserIdx;
//         formattedMessages[realIdx] = {
//           role: 'user',
//           content: [
//             {
//               type: 'image_url',
//               image_url: {
//                 url: `data:${imageMime ?? 'image/png'};base64,${base64Data}`,
//               },
//             },
//             {
//               type: 'text',
//               text:
//                 (formattedMessages[realIdx].content as string) ||
//                 'What is in this image?',
//             },
//           ],
//         };
//       }
//     }

//     // 4️⃣ System prompt
//     const systemPrompt: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
//       role: 'system',
//       content: `You are a helpful, knowledgeable AI assistant .
// - Be concise and clear in your responses
// - Use markdown formatting where appropriate (code blocks, bold, bullet points)
// - For code, always specify the language in code blocks
// - Be friendly and conversational
// - If you don't know something, say so honestly`,
//     };

//     // 5️⃣ Set SSE headers so frontend can read stream
//     res.setHeader('Content-Type', 'text/event-stream');
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Connection', 'keep-alive');
//     res.flushHeaders();

//     // 6️⃣ Call OpenAI with stream: true
//     const stream = await this.openai.chat.completions.create({
//       model,
//       messages: [systemPrompt, ...formattedMessages],
//       stream: true,
//       stream_options: { include_usage: true },
//     });

//     let fullContent = '';
//     let usage: any = null;

//     for await (const chunk of stream) {
//       const delta = chunk.choices[0]?.delta?.content ?? '';
//       if (delta) {
//         fullContent += delta;
//         res.write(`data: ${JSON.stringify({ delta })}\n\n`);
//       }
//       if (chunk.usage) {
//         usage = chunk.usage;
//       }
//     }

//     // 7️⃣ Save the complete message to DB once stream finishes
//     // 7️⃣ Save the complete message to DB once stream finishes
//     await this.prisma.message.create({
//       data: {
//         chatId,
//         role: 'ASSISTANT',
//         content: fullContent,
//       },
//     });

//     // 7b️⃣ Save token usage
//     if (usage) {
//       await this.prisma.tokenUsage.create({
//         data: {
//           userId,
//           model,
//           promptTokens: usage.prompt_tokens,
//           completionTokens: usage.completion_tokens,
//           totalTokens: usage.total_tokens,
//         },
//       });
//     }

//     // 8️⃣ Tell frontend the stream is done
//     res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
//     res.end();
//   }
// }

import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.services';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import OpenAI from 'openai';
import { ResearchService } from './research.service';

interface ResearchResult {
  title: string;
  url: string;
  content: string;
}

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private research: ResearchService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
  }

  async respond(
    userId: string,
    chatId: string,
    res: Response,
    deepResearch = false,
    imageBase64?: string,
    imageMime?: string,
  ) {
    // 1️⃣ Validate chat ownership
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // 2️⃣ Get user preferred model
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const model = imageBase64
      ? 'gpt-4o'
      : (user?.preferredModel ?? 'gpt-4o-mini');

    // 3️⃣ Fetch messages
    const freshMessages = await this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });

    const latestUserMessage = freshMessages
      .filter((m) => m.role === 'USER')
      .pop()?.content;

    const roleMap: Record<string, 'user' | 'assistant' | 'system'> = {
      USER: 'user',
      ASSISTANT: 'assistant',
      SYSTEM: 'system',
    };

    const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
      freshMessages.map((msg) => ({
        role: roleMap[msg.role] ?? 'system',
        content: msg.content,
      }));

    // Inject image into last user message if provided
    if (imageBase64) {
      const base64Data = imageBase64.includes(',')
        ? imageBase64.split(',')[1]
        : imageBase64;
      const lastUserIdx = [...formattedMessages]
        .reverse()
        .findIndex((m) => m.role === 'user');
      if (lastUserIdx !== -1) {
        const realIdx = formattedMessages.length - 1 - lastUserIdx;
        formattedMessages[realIdx] = {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${imageMime ?? 'image/png'};base64,${base64Data}`,
              },
            },
            {
              type: 'text',
              text:
                (formattedMessages[realIdx].content as string) ||
                'What is in this image?',
            },
          ],
        };
      }
    }

    // 4️⃣ 🔬 Deep Research (only when enabled)
    let researchContext = '';

if (deepResearch && latestUserMessage) {
  try {
    console.log('🔬 Deep Research triggered for:', latestUserMessage);
    const searchResults = await this.research.search(latestUserMessage);
    console.log('✅ Tavily returned', searchResults?.length, 'results');
        const results: ResearchResult[] = searchResults;
        const formatResult = (r: ResearchResult) =>
          `Source: ${r.url}\nTitle: ${r.title}\nContent: ${r.content}`;
        researchContext = results.map(formatResult).join('\n\n');
      } catch (err) {
        console.error('Research search failed:', err);
      }
    }

    // 5️⃣ System Prompt
    const systemPrompt: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: 'system',
      content: [
    'You are NUIGPT, a highly capable AI assistant similar to ChatGPT.',
    'You are helpful, harmless, and honest.',
    '',
    'RESPONSE STYLE:',
    '- Match response length to the question: short answers for simple questions, detailed for complex ones',
    '- Use markdown naturally: **bold** for emphasis, `code` for technical terms, headers for long structured answers',
    '- Use bullet points only when listing 3+ items, not for everything',
    '- Write in a warm, conversational tone — not robotic',
    '- Get straight to the answer',
    '',
    'CODE:',
    '- Always use fenced code blocks with the correct language tag',
    '- Explain code clearly but concisely',
    '',
    'HONESTY:',
    '- If you are unsure, say so clearly and ask for clarification instead of guessing',
    '- Do not hallucinate facts or make up sources',
   deepResearch && researchContext
  ? [
      '',
      '⚠️ DEEP RESEARCH MODE — CRITICAL INSTRUCTIONS:',
      'You have been provided with LIVE, REAL-TIME web search results below.',
      'You MUST answer using ONLY the research data provided. Do NOT say you cannot provide real-time updates.',
      'Do NOT use your training data as the primary source — the research data below is more current.',
      'You MUST cite sources inline like: "According to [Title](url)..."',
      'If the research data answers the question, use it confidently and completely.',
      '',
      '=== LIVE RESEARCH DATA START ===',
      researchContext,
      '=== LIVE RESEARCH DATA END ===',
    ].join('\n')
  : '',
  ]
    .filter(Boolean)
    .join('\n'),
};

    // 6️⃣ Setup SSE streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // 7️⃣ OpenAI Streaming
    const stream = await this.openai.chat.completions.create({
      model,
      messages: [systemPrompt, ...formattedMessages],
      stream: true,
      stream_options: { include_usage: true },
    });

    let fullContent = '';

    let usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    } | null = null;

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content ?? '';

      if (delta) {
        fullContent += delta;
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }

      if (
        chunk.usage &&
        typeof chunk.usage.prompt_tokens === 'number' &&
        typeof chunk.usage.completion_tokens === 'number' &&
        typeof chunk.usage.total_tokens === 'number'
      ) {
        usage = {
          prompt_tokens: chunk.usage.prompt_tokens,
          completion_tokens: chunk.usage.completion_tokens,
          total_tokens: chunk.usage.total_tokens,
        };
      }
    }

    // 8️⃣ Save AI response
    await this.prisma.message.create({
      data: {
        chatId,
        role: 'ASSISTANT',
        content: fullContent,
      },
    });

    // 9️⃣ Save token usage
    if (usage) {
      await this.prisma.tokenUsage.create({
        data: {
          userId,
          model,
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        },
      });
    }

    // 🔚 Finish stream
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  }
}
