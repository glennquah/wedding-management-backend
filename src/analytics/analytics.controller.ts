import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RevenuePeriod } from '../common/revenue-period.enum';
import { AnalyticsService } from './analytics.service';
import { AdminBasicStatsResponseDto } from './dto/admin-basic-stats-response.dto';
import { AdminBookingsOverTimeResponseDto } from './dto/admin-bookings-over-time-response.dto';
import { AdminRevenueByCategoryResponseDto } from './dto/admin-revenue-by-category-response.dto';
import { AdminRevenueResponseDto } from './dto/admin-revenue-response.dto';
import { AdminTopListingsResponseDto } from './dto/admin-top-listings-response.dto';
import { AdminTopVendorsResponseDto } from './dto/admin-top-vendors-response.dto';
import { AdminUserGrowthResponseDto } from './dto/admin-user-growth-response.dto';
import { AdminWeddingDatesHeatmapResponseDto } from './dto/admin-wedding-dates-heatmap-response.dto';
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
      'Returns revenue data for a vendor: MONTHLY (current month by days), YEARLY (current year by months), ALL (all time by months).',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: RevenuePeriod,
    description:
      'Time period: MONTHLY=daily breakdown for current month, YEARLY=monthly breakdown for current year, ALL=monthly breakdown for all time (default: MONTHLY)',
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
    @Query('period') period: RevenuePeriod = RevenuePeriod.MONTHLY,
  ): Promise<RevenueOverTimeResponseDto> {
    return this.analyticsService.getVendorRevenueOverTime(vendorId, period);
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

  @Get('admin/basic-stats')
  @ApiOperation({
    summary: 'Get basic platform statistics (Super Admin)',
    description:
      'Returns total vendors, couples, weddings, microsites, and guests served.',
  })
  @ApiResponse({
    status: 200,
    description: 'Basic statistics retrieved successfully',
    type: AdminBasicStatsResponseDto,
  })
  async getAdminBasicStats(): Promise<AdminBasicStatsResponseDto> {
    return this.analyticsService.getAdminBasicStats();
  }

  @Get('admin/revenue')
  @ApiOperation({
    summary: 'Get platform revenue analytics (Super Admin)',
    description:
      'Returns MTD, YTD, and all-time revenue, plus average order value and commission earned.',
  })
  @ApiResponse({
    status: 200,
    description: 'Revenue analytics retrieved successfully',
    type: AdminRevenueResponseDto,
  })
  async getAdminRevenue(): Promise<AdminRevenueResponseDto> {
    return this.analyticsService.getAdminRevenue();
  }

  @Get('admin/revenue-over-time')
  @ApiOperation({
    summary: 'Get platform revenue over time (Super Admin)',
    description:
      'Returns revenue data: MONTHLY (current month by days), YEARLY (current year by months), ALL (all time by months).',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: RevenuePeriod,
    description:
      'Time period: MONTHLY=daily breakdown for current month, YEARLY=monthly breakdown for current year, ALL=monthly breakdown for all time (default: MONTHLY)',
  })
  @ApiResponse({
    status: 200,
    description: 'Revenue over time retrieved successfully',
    type: RevenueOverTimeResponseDto,
  })
  async getAdminRevenueOverTime(
    @Query('period') period: RevenuePeriod = RevenuePeriod.MONTHLY,
  ): Promise<RevenueOverTimeResponseDto> {
    return this.analyticsService.getAdminRevenueOverTime(period);
  }

  @Get('admin/revenue-by-category')
  @ApiOperation({
    summary: 'Get revenue breakdown by wedding service category (Super Admin)',
    description:
      'Returns revenue and booking counts for each wedding service category.',
  })
  @ApiResponse({
    status: 200,
    description: 'Revenue by category retrieved successfully',
    type: AdminRevenueByCategoryResponseDto,
  })
  async getAdminRevenueByCategory(): Promise<AdminRevenueByCategoryResponseDto> {
    return this.analyticsService.getAdminRevenueByCategory();
  }

  @Get('admin/top-vendors')
  @ApiOperation({
    summary: 'Get top vendors by revenue (Super Admin)',
    description: 'Returns the top vendors sorted by revenue.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of top vendors to return (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Top vendors retrieved successfully',
    type: AdminTopVendorsResponseDto,
  })
  async getAdminTopVendors(
    @Query('limit', ParseIntPipe) limit: number = 10,
  ): Promise<AdminTopVendorsResponseDto> {
    return this.analyticsService.getAdminTopVendors(limit);
  }

  @Get('admin/top-listings')
  @ApiOperation({
    summary: 'Get top listings by revenue (Super Admin)',
    description: 'Returns the top order listings sorted by revenue.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of top listings to return (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Top listings retrieved successfully',
    type: AdminTopListingsResponseDto,
  })
  async getAdminTopListings(
    @Query('limit', ParseIntPipe) limit: number = 10,
  ): Promise<AdminTopListingsResponseDto> {
    return this.analyticsService.getAdminTopListings(limit);
  }

  @Get('admin/bookings-over-time')
  @ApiOperation({
    summary: 'Get platform bookings over time (Super Admin)',
    description:
      'Returns booking counts and revenue over time: MONTHLY (current month by days), YEARLY (current year by months), ALL (all time by months).',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: RevenuePeriod,
    description:
      'Time period: MONTHLY=daily breakdown for current month, YEARLY=monthly breakdown for current year, ALL=monthly breakdown for all time (default: MONTHLY)',
  })
  @ApiResponse({
    status: 200,
    description: 'Bookings over time retrieved successfully',
    type: AdminBookingsOverTimeResponseDto,
  })
  async getAdminBookingsOverTime(
    @Query('period') period: RevenuePeriod = RevenuePeriod.MONTHLY,
  ): Promise<AdminBookingsOverTimeResponseDto> {
    return this.analyticsService.getAdminBookingsOverTime(period);
  }

  @Get('admin/wedding-dates-heatmap')
  @ApiOperation({
    summary: 'Get wedding dates heatmap (Super Admin)',
    description:
      'Returns all wedding dates and the count of weddings scheduled for each date.',
  })
  @ApiResponse({
    status: 200,
    description: 'Wedding dates heatmap retrieved successfully',
    type: AdminWeddingDatesHeatmapResponseDto,
  })
  async getAdminWeddingDatesHeatmap(): Promise<AdminWeddingDatesHeatmapResponseDto> {
    return this.analyticsService.getAdminWeddingDatesHeatmap();
  }

  @Get('admin/user-growth')
  @ApiOperation({
    summary: 'Get user growth trend (Super Admin)',
    description:
      'Returns signup trends for both vendors and couples over time.',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: RevenuePeriod,
    description:
      'Time period: MONTHLY=daily breakdown for current month, YEARLY=monthly breakdown for current year, ALL=monthly breakdown for all time (default: MONTHLY)',
  })
  @ApiResponse({
    status: 200,
    description: 'User growth trend retrieved successfully',
    type: AdminUserGrowthResponseDto,
  })
  async getAdminUserGrowth(
    @Query('period') period: RevenuePeriod = RevenuePeriod.MONTHLY,
  ): Promise<AdminUserGrowthResponseDto> {
    return this.analyticsService.getAdminUserGrowth(period);
  }
}
