import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ResearchService } from './research.service';

@Module({
  providers: [AiService, ResearchService],
  controllers: [AiController],
})
export class AiModule {}
