import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { EmailNotificationService } from 'src/email-notification/email-notification.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserResponseDto } from 'src/user/dto/user-response.dto';
import { UserService } from 'src/user/user.service';
import { AuthResponseDto, TokensDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/auth.dto';
import { JwtPayload } from './dto/jwt-payload.interface';

const EXPIRE_TIME = 5 * 60 * 60 * 1000; // 5H

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private emailNotificationService: EmailNotificationService,
    private prisma: PrismaService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(dto);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return {
      user,
      backendTokens: {
        accessToken: await this.jwtService.signAsync(payload, {
          expiresIn: '5h',
          secret: process.env.JWT_SECRET_KEY,
        }),
        refreshToken: await this.jwtService.signAsync(payload, {
          expiresIn: '7d',
          secret: process.env.JWT_REFRESH_KEY,
        }),
        expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
      },
    };
  }

  async refreshToken(user: JwtPayload): Promise<TokensDto> {
    const payload = {
      sub: user.sub,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: '5h',
        secret: process.env.JWT_SECRET_KEY,
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_KEY,
      }),
      expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
    };
  }

  private async validateUser(dto: LoginDto): Promise<UserResponseDto> {
    const user = await this.userService.findRawByEmail(dto.username);

    if (user && (await compare(dto.password, user.password))) {
      return this.userService.toUserResponseDto(user);
    }

    throw new UnauthorizedException('Username or password is incorrect');
  }

  async sendResetPasswordEmail(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role === UserRole.superAdmin) return;

    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        expiresIn: '24h',
        secret: process.env.JWT_SECRET_KEY,
      },
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.emailNotificationService.sendForgetPasswordEmail(
      email,
      resetLink,
      user.name,
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decodedToken = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });

      if (!decodedToken || !decodedToken.sub) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      const userId = decodedToken.sub;
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      const hashedPassword = await hash(newPassword, 10);

      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
