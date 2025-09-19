import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/common/user-role.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';

import { AdminResponseDto } from './dto/admin-response.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

import { AdminService } from './admin.service';

import { JwtPayload } from 'src/auth/dto/jwt-payload.interface';

@ApiTags('admins')
@Controller('admins')
@UseGuards(JwtGuard, RolesGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new admin' })
  @ApiResponse({
    status: 201,
    description: 'The admin has been successfully created.',
    type: AdminResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({
    status: 409,
    description: 'Admin with this email already exists.',
  })
  async create(@Body() body: CreateAdminDto): Promise<AdminResponseDto> {
    return this.adminService.create(body);
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create multiple admins' })
  @ApiResponse({
    status: 201,
    description: 'The admins have been successfully created.',
    type: [AdminResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async createMultiple(
    @Body() body: CreateAdminDto[],
  ): Promise<AdminResponseDto[]> {
    return this.adminService.createMultiple(body);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all admins' })
  @ApiResponse({
    status: 200,
    description: 'List of all admins',
    type: [AdminResponseDto],
  })
  async getAllAdmins(): Promise<AdminResponseDto[]> {
    return this.adminService.findAll();
  }

  @Get('my-main-wedding')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get the main wedding ID for the logged-in admin' })
  @ApiResponse({
    status: 200,
    description: 'The main wedding ID associated with the admin',
    schema: {
      type: 'object',
      properties: {
        mainWeddingId: {
          type: 'number',
          nullable: true,
          description: 'The ID of the main wedding, or null if not set',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Admin not found.' })
  async getMyMainWedding(
    @Request() req: Request & { user: JwtPayload },
  ): Promise<{ mainWeddingId: number | null }> {
    return this.adminService.getMainWeddingId(req.user.sub);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get an admin by ID' })
  @ApiResponse({
    status: 200,
    description: 'The admin details',
    type: AdminResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Admin not found.' })
  async getAdmin(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AdminResponseDto> {
    return this.adminService.findById(id);
  }

  @Get('email/:email')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get an admin by email' })
  @ApiResponse({
    status: 200,
    description: 'The admin details',
    type: AdminResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Admin not found.' })
  async getAdminByEmail(
    @Param('email') email: string,
  ): Promise<AdminResponseDto> {
    return this.adminService.findByEmail(email);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Update an admin' })
  @ApiResponse({
    status: 200,
    description: 'The admin has been successfully updated.',
    type: AdminResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Admin not found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({
    status: 409,
    description: 'Admin with this email already exists.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAdminDto,
  ): Promise<AdminResponseDto> {
    return this.adminService.update(id, body);
  }

  @Delete('delete-self')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Delete own admin profile (requires password confirmation)',
  })
  @ApiResponse({
    status: 200,
    description: 'The admin profile has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Invalid password.' })
  @ApiResponse({ status: 404, description: 'Admin not found.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: { type: 'string', example: 'mypassword123' },
      },
      required: ['password'],
    },
  })
  async deleteSelf(
    @Request() req: Request & { user: JwtPayload },
    @Body() body: { password: string },
  ): Promise<void> {
    await this.adminService.deleteSelf(req.user.sub, body.password);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({
    summary: 'Delete an admin (super admin only, no password required)',
  })
  @ApiResponse({
    status: 200,
    description: 'The admin has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Admin not found.' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.adminService.delete(id);
  }

  @Put(':id/suspend')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Suspend admin' })
  @ApiResponse({
    status: 200,
    description: 'The admin has been marked as suspended.',
    type: AdminResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Admin not found.' })
  async suspendAdmin(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AdminResponseDto> {
    return this.adminService.update(id, {
      isSuspended: true,
    });
  }

  @Put(':id/unsuspend')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Unsuspend admin' })
  @ApiResponse({
    status: 200,
    description: 'The admin has been marked as unsuspended.',
    type: AdminResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Admin not found.' })
  async unsuspendAdmin(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AdminResponseDto> {
    return this.adminService.update(id, {
      isSuspended: false,
    });
  }
}
