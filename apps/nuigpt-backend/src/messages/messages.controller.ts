import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Query,
  Param,
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

  @Patch(':id')
  async updateMessage(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.messagesService.updateMessage(req.user.sub, id, body.content);
  }

  @Delete(':id')
  async deleteMessage(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.messagesService.deleteMessage(req.user.sub, id);
  }
}