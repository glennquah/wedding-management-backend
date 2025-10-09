import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AnalyticsService } from './analytics.service';
import { GuestCountResponseDto } from './dto/guest-count-response.dto';
import { RsvpCountResponseDto } from './dto/rsvp-count-response.dto';
import { SpendingResponseDto } from './dto/spending-response.dto';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('guest-count/:weddingId')
  @ApiOperation({
    summary: 'Get guest count for a wedding',
    description:
      'Returns the total number of guests, primary guests, and accompanying guests for a specific wedding.',
  })
  @ApiResponse({
    status: 200,
    description: 'Guest count retrieved successfully',
    type: GuestCountResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Wedding not found',
  })
  async getGuestCount(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ): Promise<GuestCountResponseDto> {
    return this.analyticsService.getGuestCount(weddingId);
  }

  @Get('spending/:weddingId')
  @ApiOperation({
    summary: 'Get spending analytics for a wedding',
    description:
      'Returns total spending from orders, allocated budget, current spending, remaining budget, and budget usage percentage.',
  })
  @ApiResponse({
    status: 200,
    description: 'Spending analytics retrieved successfully',
    type: SpendingResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Wedding not found',
  })
  async getSpending(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ): Promise<SpendingResponseDto> {
    return this.analyticsService.getSpending(weddingId);
  }

  @Get('rsvp-count/:weddingId')
  @ApiOperation({
    summary: 'Get RSVP count for a wedding',
    description:
      'Returns the number of guests who have confirmed attendance, pending RSVPs, and RSVP percentage.',
  })
  @ApiResponse({
    status: 200,
    description: 'RSVP count retrieved successfully',
    type: RsvpCountResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Wedding not found',
  })
  async getRsvpCount(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ): Promise<RsvpCountResponseDto> {
    return this.analyticsService.getRsvpCount(weddingId);
  }
}
