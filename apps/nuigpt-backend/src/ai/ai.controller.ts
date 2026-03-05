// import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { AiService } from './ai.service';

// @Controller('ai')
// @UseGuards(JwtAuthGuard)
// export class AiController {
//   constructor(private aiService: AiService) {}

//   @Post('respond')
//   async respond(
//     @Req() req: any,
//     @Body() body: { chatId: string },
//   ) {
//     return this.aiService.respond(
//       req.user.sub,
//       body.chatId,
//     );
//   }
// }




import { Controller, Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
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
    @Res() res: Response,
  ) {
    return this.aiService.respond(req.user.sub, body.chatId, res);
  }
}