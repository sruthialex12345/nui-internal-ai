import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.services';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async addMessage(
    userId: string,
    chatId: string,
    role: string,
    content: string,
  ) {
    // Validate chat ownership
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.message.create({
      data: {
        chatId,
        userId,
        role,
        content,
      },
    });
  }

  async getMessages(userId: string, chatId: string) {
    // Validate ownership
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat || chat.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });
  }
}