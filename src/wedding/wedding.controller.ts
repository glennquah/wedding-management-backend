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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtPayload } from 'src/auth/dto/jwt-payload.interface';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/common/user-role.enum';
import { CreateWeddingDto } from './dto/create-wedding.dto';
import { DateOptimizerPreferencesDto } from './dto/date-optimizer-preferences.dto';
import { UpdateWeddingDto } from './dto/update-wedding.dto';
import { WeddingResponseDto } from './dto/wedding-response.dto';
import { WeddingService } from './wedding.service';
import { SetWeddingDateDto } from './dto/set-wedding-date.dto';

@ApiTags('weddings')
@Controller('weddings')
export class WeddingController {
  constructor(private service: WeddingService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create a new wedding' })
  @ApiResponse({
    status: 201,
    description: 'The wedding has been successfully created.',
    type: WeddingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Body() body: CreateWeddingDto): Promise<WeddingResponseDto> {
    const wedding = await this.service.create(body);
    return this.service.toWeddingResponseDto(wedding);
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all weddings' })
  @ApiResponse({
    status: 200,
    description: 'List of all weddings',
    type: [WeddingResponseDto],
  })
  async findAll(): Promise<WeddingResponseDto[]> {
    const weddings = await this.service.findAll();
    const weddingsDto = weddings.map((wedding) =>
      this.service.toWeddingResponseDto(wedding),
    );
    return weddingsDto;
  }

  @Get('admin/my-weddings')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get weddings associated with the logged-in admin' })
  @ApiResponse({
    status: 200,
    description: 'List of weddings associated with the admin',
    type: [WeddingResponseDto],
  })
  async getAdminWeddings(
    @Request() req: Request & { user: JwtPayload },
  ): Promise<WeddingResponseDto[]> {
    const weddings = await this.service.findByAdminId(req.user.sub);
    return weddings.map((wedding) =>
      this.service.toWeddingResponseDto(wedding),
    );
  }

  @Get(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.VENDOR)
  @ApiOperation({ summary: 'Get a wedding by ID' })
  @ApiResponse({
    status: 200,
    description: 'The wedding details',
    type: WeddingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WeddingResponseDto> {
    const wedding = await this.service.findById(id);
    return this.service.toWeddingResponseDto(wedding);
  }

  @Put(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Update a wedding' })
  @ApiResponse({
    status: 200,
    description: 'The wedding has been successfully updated.',
    type: WeddingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateWeddingDto,
  ): Promise<WeddingResponseDto> {
    const wedding = await this.service.update(id, body);
    return this.service.toWeddingResponseDto(wedding);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete a wedding' })
  @ApiResponse({
    status: 200,
    description: 'The wedding has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.delete(id);
  }

  @Post(':id/key-attendees/:adminId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Add a key attendee for date optimization' })
  @ApiResponse({
    status: 201,
    description: 'Key attendee added successfully',
  })
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  async addKeyAttendee(
    @Param('id', ParseIntPipe) weddingId: number,
    @Param('adminId', ParseIntPipe) adminId: number,
  ): Promise<{ message: string }> {
    await this.service.addKeyAttendee(weddingId, adminId);
    return { message: 'Key attendee added successfully' };
  }

  @Delete(':id/key-attendees/:adminId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Remove a key attendee' })
  @ApiResponse({
    status: 200,
    description: 'Key attendee removed successfully',
  })
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  async removeKeyAttendee(
    @Param('id', ParseIntPipe) weddingId: number,
    @Param('adminId', ParseIntPipe) adminId: number,
  ): Promise<{ message: string }> {
    await this.service.removeKeyAttendee(weddingId, adminId);
    return { message: 'Key attendee removed successfully' };
  }

  @Get(':id/key-attendees')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all key attendees for a wedding' })
  @ApiResponse({
    status: 200,
    description: 'List of key attendee IDs',
    schema: {
      type: 'object',
      properties: {
        keyAttendeeIds: {
          type: 'array',
          items: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  async getKeyAttendees(
    @Param('id', ParseIntPipe) weddingId: number,
  ): Promise<{ keyAttendeeIds: number[] }> {
    const keyAttendeeIds = await this.service.getKeyAttendees(weddingId);
    return { keyAttendeeIds };
  }

  @Get(':id/main-couple')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get main couple for a wedding' })
  @ApiResponse({
    status: 200,
    description: 'Main couple members',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          email: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  async getMainCouple(@Param('id', ParseIntPipe) weddingId: number) {
    return this.service.getMainCouple(weddingId);
  }

  @Put(':id/date-optimizer-preferences')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Update date optimizer preferences for a wedding' })
  @ApiResponse({
    status: 200,
    description: 'Date optimizer preferences updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  async updateDateOptimizerPreferences(
    @Param('id', ParseIntPipe) weddingId: number,
    @Body() preferences: DateOptimizerPreferencesDto,
  ): Promise<{ message: string }> {
    await this.service.updateDateOptimizerPreferences(weddingId, preferences);
    return { message: 'Date optimizer preferences updated successfully' };
  }

  @Get(':id/date-optimizer-preferences')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get date optimizer preferences for a wedding' })
  @ApiResponse({
    status: 200,
    description: 'Date optimizer preferences',
    type: DateOptimizerPreferencesDto,
  })
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  async getDateOptimizerPreferences(
    @Param('id', ParseIntPipe) weddingId: number,
  ): Promise<DateOptimizerPreferencesDto> {
    return this.service.getDateOptimizerPreferences(weddingId);
  }

  @Put(':id/date')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Set the official wedding date' })
  @ApiResponse({
    status: 200,
    description: 'Wedding date updated successfully.',
    type: WeddingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  async setWeddingDate(
    @Param('id', ParseIntPipe) weddingId: number,
    @Body() body: SetWeddingDateDto,
  ): Promise<WeddingResponseDto> {
    const updatedWedding = await this.service.setWeddingDate(
      weddingId,
      body.date,
    );
    return this.service.toWeddingResponseDto(updatedWedding);
  }
}
