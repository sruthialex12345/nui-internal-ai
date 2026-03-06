import { Controller, Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';

interface JwtRequest extends Request {
  user: {
    sub: string;
  };
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('respond')
  async respond(
    @Req() req: JwtRequest,
    @Body()
    body: {
      chatId: string;
      deepResearch?: boolean;
      imageBase64?: string;
      imageMime?: string;
    },
    @Res() res: Response,
  ) {
    return this.aiService.respond(
      req.user.sub,
      body.chatId,
      res,
      body.deepResearch ?? false,
      body.imageBase64,
      body.imageMime,
    );
  }
}
