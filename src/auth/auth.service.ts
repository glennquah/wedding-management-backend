import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { LoginDto } from './dto/auth.dto';
import { AuthResponseDto, TokensDto } from './dto/auth-response.dto';
import { JwtPayload } from './dto/jwt-payload.interface';
import { UserResponseDto } from 'src/user/dto/user-response.dto';
import { toUserResponseDto } from 'src/user/user.mapper';
import { UserService } from 'src/user/user.service';

const EXPIRE_TIME = 5 * 60 * 60 * 1000; // 5H

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService, 
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(dto);
    const payload = {
      username: user.email,
      sub: {
        name: user.name,
      },
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
      username: user.username,
      sub: user.sub,
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
    const user = await this.userService.findByEmail(dto.username);

    if (user && (await compare(dto.password, user.password))) {
      return toUserResponseDto(user);
    }

    throw new UnauthorizedException('Username or password is incorrect');
  }
}
