import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
import { AuthResponseDto, TokensDto } from './dto/auth-response.dto';
import { RefreshJwtGuard } from './guards/refresh.guard';
import { JwtPayload } from './dto/jwt-payload.interface';
import { VendorResponseDto } from 'src/vendor/dto/vendor-response.dto';
import { VendorService } from 'src/vendor/vendor.service';
import { CreateVendorDto } from 'src/vendor/dto/create-vendor.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private vendorService: VendorService,
    private authService: AuthService,
  ) {}

  @Post('register/vendor')
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({
    status: 201,
    description: 'The test user has been successfully created.',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async registerTestUser(
    @Body() dto: CreateVendorDto,
  ): Promise<VendorResponseDto> {
    const vendor = await this.vendorService.createVendor(dto);
    return vendor;
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
