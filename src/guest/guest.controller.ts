import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/common/user-role.enum';
import { ConfirmationStatus } from '../common/confirmation-status.enum';
import { CreateGuestDto } from './dto/create-guest.dto';
import { GuestResponseDto } from './dto/guest-response.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { GuestService } from './guest.service';

@ApiTags('guests')
@Controller('guests')
@UseGuards(JwtGuard, RolesGuard)
export class GuestController {
  constructor(private guestService: GuestService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create a new guest' })
  @ApiResponse({
    status: 201,
    description: 'The guest has been successfully created.',
    type: GuestResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Body() body: CreateGuestDto): Promise<GuestResponseDto> {
    const guest = await this.guestService.create(body);
    return this.guestService.toGuestResponseDto(guest);
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create multiple guests' })
  @ApiResponse({
    status: 201,
    description: 'The guests have been successfully created.',
    type: [GuestResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async createMultiple(
    @Body() body: CreateGuestDto[],
  ): Promise<GuestResponseDto[]> {
    const guests = await this.guestService.createMultiple(body);
    return guests.map((guest) => this.guestService.toGuestResponseDto(guest));
  }

  @Get('')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all guests for all weddings' })
  @ApiResponse({
    status: 200,
    description: 'List of guests for all weddings',
    type: [GuestResponseDto],
  })
  @Roles(UserRole.SUPERADMIN)
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  async getAllGuests(): Promise<GuestResponseDto[]> {
    const guests = await this.guestService.findAllGuest();
    const guestsDto = guests.map((guest) =>
      this.guestService.toGuestResponseDto(guest),
    );
    return guestsDto;
  }

  @Get('wedding/:weddingId')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all guests for a specific wedding' })
  @ApiResponse({
    status: 200,
    description: 'List of guests for the wedding',
    type: [GuestResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  async getGuestsByWedding(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ): Promise<GuestResponseDto[]> {
    const guests = await this.guestService.findByWeddingId(weddingId);
    return guests.map((guest) => this.guestService.toGuestResponseDto(guest));
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get a guest by ID' })
  @ApiResponse({
    status: 200,
    description: 'The guest details',
    type: GuestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Guest not found.' })
  async getGuest(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GuestResponseDto> {
    const guest = await this.guestService.findById(id);
    return this.guestService.toGuestResponseDto(guest);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Update a guest' })
  @ApiResponse({
    status: 200,
    description: 'The guest has been successfully updated.',
    type: GuestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Guest not found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateGuestDto,
  ): Promise<GuestResponseDto> {
    const guest = await this.guestService.update(id, body);
    return this.guestService.toGuestResponseDto(guest);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete a guest' })
  @ApiResponse({
    status: 200,
    description: 'The guest has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Guest not found.' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.guestService.delete(id);
  }

  @Delete('wedding/:weddingId')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete all guests for a specific wedding' })
  @ApiResponse({
    status: 200,
    description: 'All guests for the wedding have been successfully deleted.',
  })
  async deleteGuestsByWedding(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ): Promise<void> {
    await this.guestService.deleteByWeddingId(weddingId);
  }

  @Put(':id/confirm')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Confirm guest attendance' })
  @ApiResponse({
    status: 200,
    description: 'The guest confirmation has been updated.',
    type: GuestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Guest not found.' })
  async confirmGuest(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GuestResponseDto> {
    const guest = await this.guestService.update(id, {
      confirmationStatus: ConfirmationStatus.CONFIRMED,
    });
    return this.guestService.toGuestResponseDto(guest);
  }

  @Put(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Reject guest attendance' })
  @ApiResponse({
    status: 200,
    description: 'The guest confirmation has been updated.',
    type: GuestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Guest not found.' })
  async rejectGuest(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GuestResponseDto> {
    const guest = await this.guestService.update(id, {
      confirmationStatus: ConfirmationStatus.REJECTED,
    });
    return this.guestService.toGuestResponseDto(guest);
  }

  @Put(':id/mark-attendance')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Toggle guest attendance status' })
  @ApiResponse({
    status: 200,
    description: 'The guest attendance has been toggled.',
    type: GuestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Guest not found.' })
  async markAttendance(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GuestResponseDto> {
    const guest = await this.guestService.markAttendance(id);
    return this.guestService.toGuestResponseDto(guest);
  }

  @Put(':id/check-in')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Check in a guest' })
  @ApiResponse({
    status: 200,
    description: 'The guest has been checked in.',
    type: GuestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Guest not found.' })
  async checkIn(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GuestResponseDto> {
    const guest = await this.guestService.checkIn(id);
    return this.guestService.toGuestResponseDto(guest);
  }

  @Delete(':id/check-in')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Remove guest check-in' })
  @ApiResponse({
    status: 200,
    description: 'The guest check-in has been removed.',
    type: GuestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Guest not found.' })
  async removeCheckIn(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GuestResponseDto> {
    const guest = await this.guestService.removeCheckIn(id);
    return this.guestService.toGuestResponseDto(guest);
  }
}
