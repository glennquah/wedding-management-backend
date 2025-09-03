import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  Post, 
  Put,
  ParseIntPipe, 
  UseGuards 
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { GuestResponseDto } from './dto/guest-response.dto';
import { toGuestResponseDto } from './guest.mapper';
import { GuestService } from './guest.service';

@ApiTags('guests')
@Controller('guests')
// @UseGuards(JwtGuard) // Temporarily disabled for testing
export class GuestController {
  constructor(private service: GuestService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new guest' })
  @ApiResponse({
    status: 201,
    description: 'The guest has been successfully created.',
    type: GuestResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Body() body: CreateGuestDto): Promise<GuestResponseDto> {
    const guest = await this.service.create(body);
    return toGuestResponseDto(guest);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple guests' })
  @ApiResponse({
    status: 201,
    description: 'The guests have been successfully created.',
    type: [GuestResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async createMultiple(@Body() body: CreateGuestDto[]): Promise<GuestResponseDto[]> {
    const guests = await this.service.createMultiple(body);
    return guests.map(toGuestResponseDto);
  }

  @Get('wedding/:weddingId')
  @ApiOperation({ summary: 'Get all guests for a specific wedding' })
  @ApiResponse({
    status: 200,
    description: 'List of guests for the wedding',
    type: [GuestResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  async getGuestsByWedding(@Param('weddingId', ParseIntPipe) weddingId: number): Promise<GuestResponseDto[]> {
    const guests = await this.service.findByWeddingId(weddingId);
    return guests.map(toGuestResponseDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a guest by ID' })
  @ApiResponse({
    status: 200,
    description: 'The guest details',
    type: GuestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Guest not found.' })
  async getGuest(@Param('id', ParseIntPipe) id: number): Promise<GuestResponseDto> {
    const guest = await this.service.findById(id);
    return toGuestResponseDto(guest);
  }

  @Put(':id')
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
    @Body() body: UpdateGuestDto
  ): Promise<GuestResponseDto> {
    const guest = await this.service.update(id, body);
    return toGuestResponseDto(guest);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a guest' })
  @ApiResponse({
    status: 200,
    description: 'The guest has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Guest not found.' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.service.delete(id);
    return { message: 'Guest successfully deleted' };
  }

  @Delete('wedding/:weddingId')
  @ApiOperation({ summary: 'Delete all guests for a specific wedding' })
  @ApiResponse({
    status: 200,
    description: 'All guests for the wedding have been successfully deleted.',
  })
  async deleteGuestsByWedding(@Param('weddingId', ParseIntPipe) weddingId: number): Promise<{ message: string }> {
    await this.service.deleteByWeddingId(weddingId);
    return { message: 'All guests for the wedding successfully deleted' };
  }

  @Put(':id/confirm')
  @ApiOperation({ summary: 'Confirm guest attendance' })
  @ApiResponse({
    status: 200,
    description: 'The guest confirmation has been updated.',
    type: GuestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Guest not found.' })
  async confirmGuest(@Param('id', ParseIntPipe) id: number): Promise<GuestResponseDto> {
    const guest = await this.service.update(id, { confirmationStatus: 'confirmed' });
    return toGuestResponseDto(guest);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject guest attendance' })
  @ApiResponse({
    status: 200,
    description: 'The guest confirmation has been updated.',
    type: GuestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Guest not found.' })
  async rejectGuest(@Param('id', ParseIntPipe) id: number): Promise<GuestResponseDto> {
    const guest = await this.service.update(id, { confirmationStatus: 'rejected' });
    return toGuestResponseDto(guest);
  }
}