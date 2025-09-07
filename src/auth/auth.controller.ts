import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
import { AuthResponseDto, TokensDto } from './dto/auth-response.dto';
import { RefreshJwtGuard } from './guards/refresh.guard';
import { JwtPayload } from './dto/jwt-payload.interface';

import { VendorResponseDto } from 'src/vendor/dto/vendor-response.dto';
import { AdminResponseDto } from 'src/admin/dto/admin-response.dto';
import { SuperAdminResponseDto } from 'src/super-admin/dto/super-admin-response.dto';

import { CreateVendorDto } from 'src/vendor/dto/create-vendor.dto';
import { CreateAdminDto } from 'src/admin/dto/create-admin.dto';
import { CreateSuperAdminDto } from 'src/super-admin/dto/create-super-admin.dto';

import { VendorService } from 'src/vendor/vendor.service';
import { AdminService } from 'src/admin/admin.service';
import { SuperAdminService } from 'src/super-admin/super-admin.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private vendorService: VendorService,
    private authService: AuthService,
    private adminService: AdminService,
    private superAdminService: SuperAdminService,
  ) { }

  @Post('register/vendor')
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({
    status: 201,
    description: 'The test user has been successfully created.',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async registerVendor(
    @Body() dto: CreateVendorDto,
  ): Promise<VendorResponseDto> {
    const vendor = await this.vendorService.create(dto);
    return vendor;
  }

  @Post('register/admin')
  @ApiOperation({ summary: 'Create a new admin' })
  @ApiResponse({
    status: 201,
    description: 'The admin has been successfully created.',
    type: AdminResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async registerAdmin(
    @Body() dto: CreateAdminDto,
  ): Promise<AdminResponseDto> {
    const admin = await this.adminService.create(dto);
    return admin;
  }

  @ApiExcludeEndpoint()
  @Post('register/super-admin')
  @ApiOperation({ summary: 'Create a new super admin' })
  @ApiResponse({
    status: 201,
    description: 'The super admin has been successfully created.',
    type: SuperAdminResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async registerSuperAdmin(
    @Body() dto: CreateSuperAdminDto,
  ): Promise<SuperAdminResponseDto> {
    const superAdmin = await this.superAdminService.create(dto);
    return superAdmin;
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
