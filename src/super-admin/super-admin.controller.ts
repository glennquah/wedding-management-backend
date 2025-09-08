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

import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { UpdateSuperAdminDto } from './dto/update-super-admin.dto';
import { SuperAdminResponseDto } from './dto/super-admin-response.dto';

import { SuperAdminService } from './super-admin.service';

@ApiTags('super-admins')
@Controller('super-admins')
@UseGuards(JwtGuard, RolesGuard) 
export class SuperAdminController {
    constructor(private service: SuperAdminService) { }

    @Post()
    @Roles(UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Create a new super admin' })
    @ApiResponse({
        status: 201,
        description: 'The super admin has been successfully created.',
        type: SuperAdminResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Bad request.' })
    @ApiResponse({ status: 409, description: 'Super admin with this email already exists.' })
    async create(@Body() body: CreateSuperAdminDto): Promise<SuperAdminResponseDto> {
        return this.service.create(body);
    }

    @Post('bulk')
    @ApiOperation({ summary: 'Create multiple super admins' })
    @ApiResponse({
        status: 201,
        description: 'The super admins have been successfully created.',
        type: [SuperAdminResponseDto],
    })
    @ApiResponse({ status: 400, description: 'Bad request.' })
    async createMultiple(@Body() body: CreateSuperAdminDto[]): Promise<SuperAdminResponseDto[]> {
        return this.service.createMultiple(body);
    }

    @Get()
    @ApiOperation({ summary: 'Get all super admins' })
    @ApiResponse({
        status: 200,
        description: 'List of all super admins',
        type: [SuperAdminResponseDto],
    })
    async getAllAdmins(): Promise<SuperAdminResponseDto[]> {
        return this.service.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a super admin by ID' })
    @ApiResponse({
        status: 200,
        description: 'The super admin details',
        type: SuperAdminResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Super admin not found.' })
    async getAdmin(@Param('id', ParseIntPipe) id: number): Promise<SuperAdminResponseDto> {
        return this.service.findById(id);
    }

    @Get('email/:email')
    @ApiOperation({ summary: 'Get a super admin by email' })
    @ApiResponse({
        status: 200,
        description: 'The super admin details',
        type: SuperAdminResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Super admin not found.' })
    async getAdminByEmail(@Param('email') email: string): Promise<SuperAdminResponseDto> {
        return this.service.findByEmail(email);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a super admin' })
    @ApiResponse({
        status: 200,
        description: 'The super admin has been successfully updated.',
        type: SuperAdminResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Super admin not found.' })
    @ApiResponse({ status: 400, description: 'Bad request.' })
    @ApiResponse({ status: 409, description: 'Super admin with this email already exists.' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateSuperAdminDto
    ): Promise<SuperAdminResponseDto> {
        return this.service.update(id, body);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a super admin' })
    @ApiResponse({
        status: 200,
        description: 'The super admin has been successfully deleted.',
    })
    @ApiResponse({ status: 404, description: 'Super admin not found.' })
    async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
        await this.service.delete(id);
        return { message: 'Super admin successfully deleted' };
    }
}