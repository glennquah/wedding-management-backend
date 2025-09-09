import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/user-role.enum';

import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminResponseDto } from './dto/admin-response.dto';

import { AdminService } from './admin.service';

@ApiTags('admins')
@Controller('admins')
@UseGuards(JwtGuard, RolesGuard) 
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new admin' })
    @ApiResponse({
        status: 201,
        description: 'The admin has been successfully created.',
        type: AdminResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Bad request.' })
    @ApiResponse({ status: 409, description: 'Admin with this email already exists.' })
    async create(@Body() body: CreateAdminDto): Promise<AdminResponseDto> {
        return this.adminService.create(body);
    }

    @Post('bulk')
    @ApiOperation({ summary: 'Create multiple admins' })
    @ApiResponse({
        status: 201,
        description: 'The admins have been successfully created.',
        type: [AdminResponseDto],
    })
    @ApiResponse({ status: 400, description: 'Bad request.' })
    async createMultiple(@Body() body: CreateAdminDto[]): Promise<AdminResponseDto[]> {
        return this.adminService.createMultiple(body);
    }

    @Get()
    @ApiOperation({ summary: 'Get all admins' })
    @ApiResponse({
        status: 200,
        description: 'List of all admins',
        type: [AdminResponseDto],
    })
    async getAllAdmins(): Promise<AdminResponseDto[]> {
        return this.adminService.findAll();
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
    async getAdmin(@Param('id', ParseIntPipe) id: number): Promise<AdminResponseDto> {
        return this.adminService.findById(id);
    }

    @Get('email/:email')
    @ApiOperation({ summary: 'Get an admin by email' })
    @ApiResponse({
        status: 200,
        description: 'The admin details',
        type: AdminResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Admin not found.' })
    async getAdminByEmail(@Param('email') email: string): Promise<AdminResponseDto> {
        return this.adminService.findByEmail(email);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update an admin' })
    @ApiResponse({
        status: 200,
        description: 'The admin has been successfully updated.',
        type: AdminResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Admin not found.' })
    @ApiResponse({ status: 400, description: 'Bad request.' })
    @ApiResponse({ status: 409, description: 'Admin with this email already exists.' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateAdminDto
    ): Promise<AdminResponseDto> {
        return this.adminService.update(id, body);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an admin' })
    @ApiResponse({
        status: 200,
        description: 'The admin has been successfully deleted.',
    })
    @ApiResponse({ status: 404, description: 'Admin not found.' })
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.adminService.deleteAdmin(id);
    }
}