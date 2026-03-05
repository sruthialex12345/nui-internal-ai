// import {
//   Injectable,
//   ForbiddenException,
//   NotFoundException,
// } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.services';
// import { ConfigService } from '@nestjs/config';
// import OpenAI from 'openai';

// @Injectable()
// export class AiService {
//   private openai: OpenAI;

//   constructor(
//     private prisma: PrismaService,
//     private config: ConfigService,
//   ) {
//     this.openai = new OpenAI({
//       apiKey: this.config.get<string>('OPENAI_API_KEY'),
//     });
//   }

//   async respond(userId: string, chatId: string) {
//     // 1️⃣ Validate chat ownership
//     const chat = await this.prisma.chat.findUnique({
//       where: { id: chatId },
//       include: { messages: true },
//     });

//     if (!chat) {
//       throw new NotFoundException('Chat not found');
//     }

//     if (chat.userId !== userId) {
//       throw new ForbiddenException('Access denied');
//     }

//     // 2️⃣ Get user model preference
//     const user = await this.prisma.user.findUnique({
//       where: { id: userId },
//     });

//     const model = user?.preferredModel ?? 'gpt-4o-mini';

//     // 3️⃣ Format messages for OpenAI
//     const formattedMessages = chat.messages.map((msg) => ({
//       role:
//         msg.role === 'USER'
//           ? 'user'
//           : msg.role === 'ASSISTANT'
//             ? 'assistant'
//             : 'system',
//       content: msg.content,
//     })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

//    // 4️⃣ Call OpenAI
// const systemPrompt: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
//   role: 'system',
//   content: `You are a helpful, knowledgeable AI assistant.
// - Be concise and clear in your responses
// - Use markdown formatting where appropriate (code blocks, bold, bullet points)
// - For code, always specify the language in code blocks
// - Be friendly and conversational
// - If you don't know something, say so honestly`,
// };

// const completion = await this.openai.chat.completions.create({
//   model,
//   messages: [systemPrompt, ...formattedMessages],
// });
//     const assistantMessage = completion.choices[0].message.content ?? '';

//     // 5️⃣ Store assistant message
//     const savedMessage = await this.prisma.message.create({
//       data: {
//         chatId,
//         role: 'ASSISTANT',
//         content: assistantMessage,
//       },
//     });

//     // 6️⃣ Store token usage
//     if (completion.usage) {
//       await this.prisma.tokenUsage.create({
//         data: {
//           userId,
//           model,
//           promptTokens: completion.usage.prompt_tokens,
//           completionTokens: completion.usage.completion_tokens,
//           totalTokens: completion.usage.total_tokens,
//         },
//       });
//     }

//     return savedMessage;
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

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
  }

  async respond(
    userId: string,
    chatId: string,
    res: Response,
    imageBase64?: string,
    imageMime?: string,
  ) {
    // 1️⃣ Validate chat ownership
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) throw new NotFoundException('Chat not found');
    if (chat.userId !== userId) throw new ForbiddenException('Access denied');

    // 2️⃣ Get user model preference
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const model = imageBase64
      ? 'gpt-4o'
      : (user?.preferredModel ?? 'gpt-4o-mini');

    // 3️⃣ Fetch messages fresh from DB (ensures deletes are committed)
    const freshMessages = await this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });

    const formattedMessages = freshMessages.map((msg) => ({
      role:
        msg.role === 'USER'
          ? 'user'
          : msg.role === 'ASSISTANT'
            ? 'assistant'
            : 'system',
      content: msg.content,
    })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

    // If image provided, replace last user message with vision format
    if (imageBase64) {
      const base64Data = imageBase64.split(',')[1];
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

    // 4️⃣ System prompt
    const systemPrompt: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: 'system',
      content: `You are a helpful, knowledgeable AI assistant . 
- Be concise and clear in your responses
- Use markdown formatting where appropriate (code blocks, bold, bullet points)
- For code, always specify the language in code blocks
- Be friendly and conversational
- If you don't know something, say so honestly`,
    };

    // 5️⃣ Set SSE headers so frontend can read stream
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // 6️⃣ Call OpenAI with stream: true
    const stream = await this.openai.chat.completions.create({
      model,
      messages: [systemPrompt, ...formattedMessages],
      stream: true,
      stream_options: { include_usage: true },
    });

    let fullContent = '';
    let usage: any = null;

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? '';
      if (delta) {
        fullContent += delta;
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
      if (chunk.usage) {
        usage = chunk.usage;
      }
    }

    // 7️⃣ Save the complete message to DB once stream finishes
    // 7️⃣ Save the complete message to DB once stream finishes
    await this.prisma.message.create({
      data: {
        chatId,
        role: 'ASSISTANT',
        content: fullContent,
      },
    });

    // 7b️⃣ Save token usage
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

    // 8️⃣ Tell frontend the stream is done
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  }
}
