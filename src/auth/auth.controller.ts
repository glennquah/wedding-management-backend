import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TestUserService } from 'src/test-user/test-user.service';
import { AuthService } from './auth.service';
import { CreateTestUserDto } from 'src/test-user/dto/create-test-user.dto';
import { TestUserResponseDto } from 'src/test-user/dto/test-user-response.dto';
import { LoginDto } from './dto/auth.dto';
import { AuthResponseDto, TokensDto } from './dto/auth-response.dto';
import { RefreshJwtGuard } from './guards/refresh.guard';
import { toTestUserResponseDto } from 'src/test-user/test-user.mapper';
import { JwtPayload } from './dto/jwt-payload.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private testUserService: TestUserService,
    private authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Create a new test user' })
  @ApiResponse({
    status: 201,
    description: 'The test user has been successfully created.',
    type: TestUserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async registerTestUser(
    @Body() dto: CreateTestUserDto,
  ): Promise<TestUserResponseDto> {
    const user = await this.testUserService.create(dto);
    return toTestUserResponseDto(user);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully logged in.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return await this.authService.login(dto);
  }

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({
    status: 200,
    description: 'The JWT token has been refreshed.',
    type: AuthResponseDto,
  })
  async refreshToken(
    @Request() req: Request & { user: JwtPayload },
  ): Promise<TokensDto> {
    return await this.authService.refreshToken(req.user);
  }
}
