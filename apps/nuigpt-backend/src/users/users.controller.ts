import { Controller, Get, Req, UseGuards, } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { Patch, Body } from '@nestjs/common';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { Param, ForbiddenException } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return this.usersService.findById(req.user.sub);
  }
  @Get('usage/summary')
  @UseGuards(JwtAuthGuard)
  async getUsageSummary(@Req() req: any) {
    return this.usersService.getUsageSummary(req.user.sub);
  }

  @Patch('preferences')
  @UseGuards(JwtAuthGuard)
  async updatePreferences(@Req() req: any, @Body() dto: UpdatePreferencesDto) {
    return this.usersService.updatePreferences(
      req.user.sub,
      dto.preferredModel,
    );
  }
  @Patch('me/model')
  @UseGuards(JwtAuthGuard)
  async updateModel(@Req() req: any, @Body() body: { model: string }) {
    return this.usersService.updatePreferredModel(req.user.sub, body.model);
  }
  @Patch(':id/lock')
  @UseGuards(JwtAuthGuard)
  async lockUser(@Req() req: any, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admins only');
    }

    return this.usersService.lockUser(id);
  }

  @Patch(':id/unlock')
  @UseGuards(JwtAuthGuard)
  async unlockUser(@Req() req: any, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admins only');
    }

    return this.usersService.unlockUser(id);
  }
}
