import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatsService } from './chats.service';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private chatsService: ChatsService) {}

  @Post()
  async createChat(@Req() req: any, @Body() body: any) {
    return this.chatsService.createChat(
      req.user.sub,
      body?.title,
    );
  }

  @Get()
  async getUserChats(@Req() req: any) {
    return this.chatsService.getUserChats(req.user.sub);
  }

  @Get(':id')
  async getChat(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.chatsService.getChatById(req.user.sub, id);
  }
}
