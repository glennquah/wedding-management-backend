import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthResponseDto, TokensDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/auth.dto';
import { JwtPayload } from './dto/jwt-payload.interface';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshJwtGuard } from './guards/refresh.guard';

import { AdminResponseDto } from 'src/admin/dto/admin-response.dto';
import { SuperAdminResponseDto } from 'src/super-admin/dto/super-admin-response.dto';
import { VendorResponseDto } from 'src/vendor/dto/vendor-response.dto';

import { CreateAdminDto } from 'src/admin/dto/create-admin.dto';
import { CreateSuperAdminDto } from 'src/super-admin/dto/create-super-admin.dto';
import { CreateVendorDto } from 'src/vendor/dto/create-vendor.dto';

import { AdminService } from 'src/admin/admin.service';
import { SuperAdminService } from 'src/super-admin/super-admin.service';
import { VendorService } from 'src/vendor/vendor.service';
import { RegisterDatingUserDto } from 'src/admin/dto/register-dating-user.dto';
import { DatingPartnerApiKeyGuard } from './guards/dating-partner.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private vendorService: VendorService,
    private authService: AuthService,
    private adminService: AdminService,
    private superAdminService: SuperAdminService,
  ) {}

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
  async registerAdmin(@Body() dto: CreateAdminDto): Promise<AdminResponseDto> {
    const admin = await this.adminService.create(dto);
    return admin;
  }

  @Post('register/dating-user')
  @ApiSecurity('apiKey')
  @UseGuards(DatingPartnerApiKeyGuard)
  @ApiOperation({ summary: 'Register dating platform user onto knotly.' })
  @ApiResponse({
    status: 201,
    description: 'Dating platform user has been successfully invited.',
    type: AdminResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict. This user is already registered on Knotly.',
  })
  async registerDatingUser(
    @Body() dto: RegisterDatingUserDto,
  ): Promise<AdminResponseDto> {
    const admin = await this.adminService.registerDatingUser(dto);
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
    type: AuthResponseDto,
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

  @Post('/request-password-reset')
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Sends a password reset email to the user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully.',
  })
  async requestPasswordReset(
    @Body() requestResetPasswordDto: RequestResetPasswordDto,
  ): Promise<void> {
    await this.authService.sendResetPasswordEmail(
      requestResetPasswordDto.email,
    );
  }

  @Post('/reset-password')
  @ApiOperation({
    summary: 'Reset password',
    description: 'Allows a user to reset their password using a valid token.',
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token.' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }
}
