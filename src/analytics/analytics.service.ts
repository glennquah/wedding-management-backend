import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConfirmationStatus } from '../common/confirmation-status.enum';
import { OrderStatus } from '../common/order-status.enum';
import { RevenuePeriod } from '../common/revenue-period.enum';
import { PrismaService } from '../prisma/prisma.service';
import { GuestCountResponseDto } from './dto/guest-count-response.dto';
import {
  RevenueDataPoint,
  RevenueOverTimeResponseDto,
} from './dto/revenue-over-time-response.dto';
import { RsvpCountResponseDto } from './dto/rsvp-count-response.dto';
import { SpendingResponseDto } from './dto/spending-response.dto';
import { VendorBookingsResponseDto } from './dto/vendor-bookings-response.dto';
import { VendorRevenueResponseDto } from './dto/vendor-revenue-response.dto';
import {
  TopProductData,
  VendorTopProductsResponseDto,
} from './dto/vendor-top-products-response.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getGuestCount(weddingId: number): Promise<GuestCountResponseDto> {
    // Verify wedding exists
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${weddingId} not found`);
    }

    // Get all guests for the wedding
    const allGuests = await this.prisma.guest.findMany({
      where: { weddingId },
    });

    // Calculate primary and accompanying guests
    const primaryGuests = allGuests.filter(
      (guest) => guest.primaryGuestId === null,
    );
    const accompanyingGuests = allGuests.filter(
      (guest) => guest.primaryGuestId !== null,
    );

    return {
      totalGuests: allGuests.length,
      primaryGuests: primaryGuests.length,
      accompanyingGuests: accompanyingGuests.length,
    };
  }

  async getSpending(weddingId: number): Promise<SpendingResponseDto> {
    // Verify wedding exists and get budget info
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${weddingId} not found`);
    }

    // Get all orders for the wedding
    const orders = await this.prisma.order.findMany({
      where: { weddingId },
    });

    // Calculate total spending from orders
    const totalSpending = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );

    // Calculate remaining budget
    const allocatedBudget = wedding.allocatedBudget;
    const currentSpending = wedding.currentSpending;
    const remainingBudget = allocatedBudget - currentSpending;

    // Calculate budget used percentage
    const budgetUsedPercentage =
      allocatedBudget > 0 ? (currentSpending / allocatedBudget) * 100 : 0;

    return {
      totalSpending,
      allocatedBudget,
      currentSpending,
      remainingBudget,
      budgetUsedPercentage: Math.round(budgetUsedPercentage * 100) / 100, // Round to 2 decimal places
      orderCount: orders.length,
      currency: orders.length > 0 ? orders[0].currency : 'SGD',
    };
  }

  async getRsvpCount(weddingId: number): Promise<RsvpCountResponseDto> {
    // Verify wedding exists
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${weddingId} not found`);
    }

    // Get all guests for the wedding
    const allGuests = await this.prisma.guest.findMany({
      where: { weddingId },
    });

    const totalInvited = allGuests.length;

    // Count guests who confirmed attendance
    const confirmed = allGuests.filter(
      (guest) => guest.confirmationStatus === ConfirmationStatus.CONFIRMED,
    ).length;

    // Count guests who haven't RSVPed yet
    const pending = allGuests.filter(
      (guest) => guest.confirmationStatus === ConfirmationStatus.PENDING,
    ).length;

    // Calculate RSVP percentage
    const rsvpPercentage =
      totalInvited > 0 ? (confirmed / totalInvited) * 100 : 0;

    return {
      totalInvited,
      confirmed,
      pending,
      rsvpPercentage: Math.round(rsvpPercentage * 100) / 100, // Round to 2 decimal places
    };
  }

  async getVendorRevenue(vendorId: number): Promise<VendorRevenueResponseDto> {
    // Verify vendor exists
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    // Get all orders for this vendor's listings with PAID or COMPLETED status
    const orders = await this.prisma.order.findMany({
      where: {
        listings: {
          some: {
            listing: {
              vendorId: vendorId,
            },
          },
        },
        orderStatus: {
          in: [OrderStatus.PAID, OrderStatus.COMPLETED],
        },
      },
      include: {
        listings: {
          where: {
            listing: {
              vendorId: vendorId,
            },
          },
          include: {
            listing: true,
          },
        },
      },
    });

    // Calculate revenue for each period
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let mtd = 0;
    let ytd = 0;
    let allTime = 0;

    orders.forEach((order) => {
      // Calculate vendor's portion from this order
      const vendorRevenue = order.listings.reduce(
        (sum, ol) => sum + ol.listing.price,
        0,
      );

      allTime += vendorRevenue;

      if (order.purchaseDate >= startOfYear) {
        ytd += vendorRevenue;
      }

      if (order.purchaseDate >= startOfMonth) {
        mtd += vendorRevenue;
      }
    });

    return {
      mtd: Math.round(mtd * 100) / 100,
      ytd: Math.round(ytd * 100) / 100,
      allTime: Math.round(allTime * 100) / 100,
      currency: 'SGD',
    };
  }

  async getVendorRevenueOverTime(
    vendorId: number,
    period: RevenuePeriod = RevenuePeriod.MONTHLY,
  ): Promise<RevenueOverTimeResponseDto> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    // Filter orders based on period and get all orders for this vendor's listings
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const whereClause: Prisma.OrderWhereInput = {
      listings: {
        some: {
          listing: {
            vendorId: vendorId,
          },
        },
      },
      orderStatus: {
        in: [OrderStatus.PAID, OrderStatus.COMPLETED],
      },
    };

    // Add date filter based on period
    if (period === RevenuePeriod.MONTHLY) {
      whereClause.purchaseDate = {
        gte: startOfMonth,
      };
    } else if (period === RevenuePeriod.YEARLY) {
      whereClause.purchaseDate = {
        gte: startOfYear,
      };
    }
    // For ALL, no date filter is applied

    const orders = await this.prisma.order.findMany({
      where: whereClause,
      include: {
        listings: {
          where: {
            listing: {
              vendorId: vendorId,
            },
          },
          include: {
            listing: true,
          },
        },
      },
      orderBy: {
        purchaseDate: 'asc',
      },
    });

    // Group by the specified period
    const periodMap = new Map<string, { revenue: number; count: number }>();

    orders.forEach((order) => {
      let periodKey: string;

      if (period === RevenuePeriod.MONTHLY) {
        periodKey = order.purchaseDate.toISOString().substring(0, 10);
      } else if (period === RevenuePeriod.YEARLY) {
        periodKey = order.purchaseDate.toISOString().substring(0, 7);
      } else {
        periodKey = order.purchaseDate.toISOString().substring(0, 7);
      }

      const vendorRevenue = order.listings.reduce(
        (sum, ol) => sum + ol.listing.price,
        0,
      );

      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, { revenue: 0, count: 0 });
      }

      const periodData = periodMap.get(periodKey)!;
      periodData.revenue += vendorRevenue;
      periodData.count += 1;
    });

    // Convert map to array and sort chronologically
    const data: RevenueDataPoint[] = Array.from(periodMap.entries())
      .map(([periodKey, periodData]) => ({
        period: periodKey,
        revenue: Math.round(periodData.revenue * 100) / 100,
        orderCount: periodData.count,
        isPredictedValue: false,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    // Generate predictions for the next 3 months only for YEARLY or ALL periods
    let allData = data;
    if (period === RevenuePeriod.YEARLY || period === RevenuePeriod.ALL) {
      const predictions = this.generateRevenuePredictions(data, 3);
      allData = [...data, ...predictions];
    }

    return {
      data: allData,
      periodType: period,
      currency: 'SGD',
    };
  }

  private generateRevenuePredictions(
    historicalData: RevenueDataPoint[],
    periodsToPredict: number,
  ): RevenueDataPoint[] {
    if (historicalData.length === 0) {
      return [];
    }

    // Use (1 year) data points for trend analysis (or all if less than 12)
    const recentData = historicalData.slice(-12);

    const avgRevenue =
      recentData.reduce((sum, point) => sum + point.revenue, 0) /
      recentData.length;

    // Calculate linear regression to detect trend
    let trend = 0;
    if (recentData.length >= 2) {
      const n = recentData.length;
      let sumX = 0;
      let sumY = 0;
      let sumXY = 0;
      let sumX2 = 0;

      recentData.forEach((point, index) => {
        sumX += index;
        sumY += point.revenue;
        sumXY += index * point.revenue;
        sumX2 += index * index;
      });

      trend = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    }

    const predictions: RevenueDataPoint[] = [];
    const lastPeriod = historicalData[historicalData.length - 1].period;
    const lastDate = new Date(lastPeriod);

    for (let i = 1; i <= periodsToPredict; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setMonth(nextDate.getMonth() + i);

      const periodStr = nextDate.toISOString().substring(0, 7);

      // Predict revenue using moving average + trend
      const predictedRevenue = avgRevenue + trend * (recentData.length + i - 1);

      // Ensure predicted revenue is non-negative
      const finalRevenue = Math.max(0, predictedRevenue);

      predictions.push({
        period: periodStr,
        revenue: Math.round(finalRevenue * 100) / 100,
        orderCount: 0,
        isPredictedValue: true,
      });
    }

    return predictions;
  }

  async getVendorTopProducts(
    vendorId: number,
    limit: number = 10,
  ): Promise<VendorTopProductsResponseDto> {
    // Verify vendor exists
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    // Get all listings with their order data
    const listings = await this.prisma.listing.findMany({
      where: {
        vendorId: vendorId,
      },
      include: {
        orders: {
          where: {
            order: {
              orderStatus: {
                in: [OrderStatus.PAID, OrderStatus.COMPLETED],
              },
            },
          },
          include: {
            order: true,
          },
        },
      },
    });

    // Calculate revenue and booking count for each listing
    const productData: TopProductData[] = listings
      .map((listing) => {
        const bookingCount = listing.orders.length;
        const revenue = listing.orders.reduce(
          (sum, _ol) => sum + listing.price,
          0,
        );

        return {
          listingId: listing.id,
          listingName: listing.listingName,
          revenue: Math.round(revenue * 100) / 100,
          bookingCount,
          price: listing.price,
        };
      })
      .filter((product) => product.bookingCount > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    return {
      topProducts: productData,
      currency: 'SGD',
    };
  }

  async getVendorBookings(
    vendorId: number,
  ): Promise<VendorBookingsResponseDto> {
    // Verify vendor exists
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    // Get all bookings (OrderListing) for this vendor's listings
    const bookings = await this.prisma.orderListing.findMany({
      where: {
        listing: {
          vendorId: vendorId,
        },
      },
    });

    // Count by status
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(
      (b) => b.bookingStatus === OrderStatus.PENDING,
    ).length;
    const confirmedBookings = bookings.filter(
      (b) => b.bookingStatus === OrderStatus.CONFIRMED,
    ).length;
    const completedBookings = bookings.filter(
      (b) => b.bookingStatus === OrderStatus.COMPLETED,
    ).length;
    const cancelledBookings = bookings.filter(
      (b) => b.bookingStatus === OrderStatus.CANCELLED,
    ).length;

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
    };
  }
}
