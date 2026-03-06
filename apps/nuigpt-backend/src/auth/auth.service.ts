import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.services';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateGoogleUser(profile: any) {
    const allowedDomain = '@numentica-ui.com';

    if (!profile.email.endsWith(allowedDomain)) {
      throw new UnauthorizedException('Unauthorized domain');
    }

    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
        },
      });
    }

    return user;
  }

  async generateJwt(user: any) {
    return this.jwtService.sign({
      sub: user.id, 
      email: user.email,
      role: user.role,
    });
  }
}
