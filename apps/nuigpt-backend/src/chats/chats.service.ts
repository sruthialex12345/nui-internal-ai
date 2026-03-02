import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.services';

@Injectable()
export class ChatsService {
  constructor(private prisma: PrismaService) {}

  async createChat(userId: string, title?: string) {
    return this.prisma.chat.create({
      data: {
        userId,
        title: title ?? 'New Chat',
      },
    });
  }

  async getUserChats(userId: string) {
    return this.prisma.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getChatById(userId: string, chatId: string) {
    const chat = await this.prisma.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
      include: {
        messages: true,
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }
}