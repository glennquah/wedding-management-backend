import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TestUserService } from 'src/test-user/test-user.service';
import { CreateTestUserDto } from 'src/test-user/dto/create-test-user.dto';
import { TestUserResponseDto } from 'src/test-user/dto/test-user-response.dto';
import { LoginDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { RefreshJwtGuard } from './guards/refresh.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private testUserService: TestUserService, 
        private authService: AuthService
    ) {};

    @Post('register')
    @ApiOperation({ summary: 'Create a new test user' })
    @ApiResponse({
        status: 201,
        description: 'The test user has been successfully created.',
        type: TestUserResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Bad request.' })
    async registerTestUser(@Body() dto: CreateTestUserDto) {
        return await this.testUserService.create(dto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login user' })
    @ApiResponse({
        status: 200,
        description: 'The user has been successfully logged in.'
    })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async login(@Body() dto: LoginDto) {
        return await this.authService.login(dto);
    }

    @UseGuards(RefreshJwtGuard)
    @Post('refresh')
    @ApiOperation({ summary: 'Login user' })
    @ApiResponse({
        status: 200,
        description: 'The JWT token has been refreshed.'
    })
    async refreshToken(@Request() req) {
        return await this.authService.refreshToken(req.user);
    }
}
