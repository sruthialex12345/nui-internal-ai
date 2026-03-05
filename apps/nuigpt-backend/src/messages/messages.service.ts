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

    const message = await this.prisma.message.create({
      data: {
        chatId,
        userId,
        role,
        content,
      },
    });

    // If first user message, update chat title
if (role === 'USER' && chat.title === 'New Chat') {

  let title = content
    .replace(/\?/g, '')
    .replace(/^what is/i, '')
    .replace(/^how to/i, '')
    .replace(/^explain/i, '')
    .trim();

  title = title.charAt(0).toUpperCase() + title.slice(1);

  await this.prisma.chat.update({
    where: { id: chatId },
    data: {
      title: title.slice(0, 40),
    },
  });
}

    return message;
  }

async updateMessage(userId: string, id: string, content: string) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) throw new NotFoundException('Message not found');
    if (message.userId !== userId) throw new ForbiddenException('Access denied');
    return this.prisma.message.update({ where: { id }, data: { content } });
  }

async deleteMessage(userId: string, id: string) {
  const message = await this.prisma.message.findUnique({
    where: { id },
    include: { chat: true },
  });
  if (!message) throw new NotFoundException('Message not found');
  // Check ownership via chat instead — covers AI messages with no userId
  if (message.chat.userId !== userId) throw new ForbiddenException('Access denied');
  return this.prisma.message.delete({ where: { id } });
}

  async getMessages(userId: string, chatId: string) {    // Validate ownership
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
