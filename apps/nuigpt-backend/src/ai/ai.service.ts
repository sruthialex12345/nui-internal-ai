import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.services';
import { ConfigService } from '@nestjs/config';
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

  async respond(userId: string, chatId: string) {
    // 1️⃣ Validate chat ownership
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { messages: true },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // 2️⃣ Get user model preference
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const model = user?.preferredModel ?? 'gpt-4o-mini';

    // 3️⃣ Format messages for OpenAI
    const formattedMessages = chat.messages.map((msg) => ({
      role:
        msg.role === 'USER'
          ? 'user'
          : msg.role === 'ASSISTANT'
            ? 'assistant'
            : 'system',
      content: msg.content,
    })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

    // 4️⃣ Call OpenAI
    const completion = await this.openai.chat.completions.create({
      model,
      messages: formattedMessages,
    });

    const assistantMessage = completion.choices[0].message.content ?? '';

    // 5️⃣ Store assistant message
    const savedMessage = await this.prisma.message.create({
      data: {
        chatId,
        role: 'ASSISTANT',
        content: assistantMessage,
      },
    });

    // 6️⃣ Store token usage
    if (completion.usage) {
      await this.prisma.tokenUsage.create({
        data: {
          userId,
          model,
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        },
      });
    }

    return savedMessage;
  }
}
