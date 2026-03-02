import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  async addMessage(
    @Req() req: any,
    @Body() body: any,
  ) {
    return this.messagesService.addMessage(
      req.user.sub,
      body.chatId,
      body.role,
      body.content,
    );
  }

  @Get()
  async getMessages(
    @Req() req: any,
    @Query('chatId') chatId: string,
  ) {
    return this.messagesService.getMessages(
      req.user.sub,
      chatId,
    );
  }
}