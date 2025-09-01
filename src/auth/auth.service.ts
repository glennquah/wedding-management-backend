import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { TestUserService } from 'src/test-user/test-user.service';
import { LoginDto } from './dto/auth.dto';
import { AuthResponseDto, TokensDto } from './dto/auth-response.dto';
import { toTestUserResponseDto } from 'src/test-user/test-user.mapper';
import { TestUserResponseDto } from 'src/test-user/dto/test-user-response.dto';
import { JwtPayload } from './dto/jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(
        private testUserService: TestUserService, 
        private jwtService: JwtService
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
                    expiresIn: '1h',
                    secret: process.env.JWT_SECRET_KEY,
                }),
                refreshToken: await this.jwtService.signAsync(payload, {
                    expiresIn: '7d',
                    secret: process.env.JWT_REFRESH_KEY,
                }),
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
                expiresIn: '1h',
                secret: process.env.JWT_SECRET_KEY,
            }),
            refreshToken: await this.jwtService.signAsync(payload, {
                expiresIn: '7d',
                secret: process.env.JWT_REFRESH_KEY,
            }),
        };
    }

    private async validateUser(dto: LoginDto): Promise<TestUserResponseDto> {
        const user = await this.testUserService.findByEmail(dto.username);
    
        if(user && (await compare(dto.password, user.password))) {
            return toTestUserResponseDto(user);
        }
    
        throw new UnauthorizedException("Username or password is incorrect")
    }
}
