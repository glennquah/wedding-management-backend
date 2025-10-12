import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AnalyticsService } from './analytics.service';
import { GuestCountResponseDto } from './dto/guest-count-response.dto';
import { RevenueOverTimeResponseDto } from './dto/revenue-over-time-response.dto';
import { RsvpCountResponseDto } from './dto/rsvp-count-response.dto';
import { SpendingResponseDto } from './dto/spending-response.dto';
import { VendorBookingsResponseDto } from './dto/vendor-bookings-response.dto';
import { VendorRevenueResponseDto } from './dto/vendor-revenue-response.dto';
import { VendorTopProductsResponseDto } from './dto/vendor-top-products-response.dto';

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

  @Get('vendor/:vendorId/revenue')
  @ApiOperation({
    summary: 'Get vendor revenue analytics',
    description:
      'Returns MTD (Month-to-Date), YTD (Year-to-Date), and all-time revenue for a vendor.',
  })
  @ApiResponse({
    status: 200,
    description: 'Vendor revenue retrieved successfully',
    type: VendorRevenueResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vendor not found',
  })
  async getVendorRevenue(
    @Param('vendorId', ParseIntPipe) vendorId: number,
  ): Promise<VendorRevenueResponseDto> {
    return this.analyticsService.getVendorRevenue(vendorId);
  }

  @Get('vendor/:vendorId/revenue-over-time')
  @ApiOperation({
    summary: 'Get vendor revenue over time',
    description:
      'Returns monthly revenue data for a vendor, suitable for line charts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Revenue over time retrieved successfully',
    type: RevenueOverTimeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vendor not found',
  })
  async getVendorRevenueOverTime(
    @Param('vendorId', ParseIntPipe) vendorId: number,
  ): Promise<RevenueOverTimeResponseDto> {
    return this.analyticsService.getVendorRevenueOverTime(vendorId);
  }

  @Get('vendor/:vendorId/top-products')
  @ApiOperation({
    summary: 'Get vendor top selling products',
    description:
      'Returns the top selling products (listings) for a vendor, sorted by revenue.',
  })
  @ApiResponse({
    status: 200,
    description: 'Top products retrieved successfully',
    type: VendorTopProductsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vendor not found',
  })
  async getVendorTopProducts(
    @Param('vendorId', ParseIntPipe) vendorId: number,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ): Promise<VendorTopProductsResponseDto> {
    return this.analyticsService.getVendorTopProducts(vendorId, limit);
  }

  @Get('vendor/:vendorId/bookings')
  @ApiOperation({
    summary: 'Get vendor bookings count',
    description:
      'Returns total bookings count and breakdown by status (pending, confirmed, completed, cancelled).',
  })
  @ApiResponse({
    status: 200,
    description: 'Bookings count retrieved successfully',
    type: VendorBookingsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vendor not found',
  })
  async getVendorBookings(
    @Param('vendorId', ParseIntPipe) vendorId: number,
  ): Promise<VendorBookingsResponseDto> {
    return this.analyticsService.getVendorBookings(vendorId);
  }
}
