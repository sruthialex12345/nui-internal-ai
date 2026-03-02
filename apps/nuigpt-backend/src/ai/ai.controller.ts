import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('respond')
  async respond(
    @Req() req: any,
    @Body() body: { chatId: string },
  ) {
    return this.aiService.respond(
      req.user.sub,
      body.chatId,
    );
  }
}