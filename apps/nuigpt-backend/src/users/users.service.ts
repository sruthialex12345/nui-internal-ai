import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.services';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
  async updatePreferences(userId: string, preferredModel?: string) {
  return this.prisma.user.update({
    where: { id: userId },
    data: {
      preferredModel,
    },
  });
}
async lockUser(userId: string) {
  return this.prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });
}

async unlockUser(userId: string) {
  return this.prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
  });
}
async getUsageSummary(userId: string) {
  const usage = await this.prisma.tokenUsage.aggregate({
    where: { userId },
    _sum: {
      promptTokens: true,
      completionTokens: true,
      totalTokens: true,
    },
  });

  return {
    promptTokens: usage._sum.promptTokens ?? 0,
    completionTokens: usage._sum.completionTokens ?? 0,
    totalTokens: usage._sum.totalTokens ?? 0,
  };
}
}