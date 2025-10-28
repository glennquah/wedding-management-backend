import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConfirmationStatus } from '../common/confirmation-status.enum';
import { OrderStatus } from '../common/order-status.enum';
import { RevenuePeriod } from '../common/revenue-period.enum';
import { PrismaService } from '../prisma/prisma.service';
import { AdminBasicStatsResponseDto } from './dto/admin-basic-stats-response.dto';
import {
  AdminBookingsOverTimeResponseDto,
  BookingDataPoint,
} from './dto/admin-bookings-over-time-response.dto';
import {
  AdminRevenueByCategoryResponseDto,
  CategoryRevenueData,
} from './dto/admin-revenue-by-category-response.dto';
import { AdminRevenueResponseDto } from './dto/admin-revenue-response.dto';
import {
  AdminTopListingsResponseDto,
  TopListingData,
} from './dto/admin-top-listings-response.dto';
import {
  AdminTopVendorsResponseDto,
  TopVendorData,
} from './dto/admin-top-vendors-response.dto';
import {
  AdminUserGrowthResponseDto,
  UserGrowthDataPoint,
} from './dto/admin-user-growth-response.dto';
import {
  AdminWeddingDatesHeatmapResponseDto,
  WeddingDateData,
} from './dto/admin-wedding-dates-heatmap-response.dto';
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
import {
  WeddingWrappedResponseDto,
  GuestInsights,
  GiftSupportInsights,
  PlanningJourneyInsights,
  EmotionalTouchInsights,
  SquadBreakdownItem,
} from './dto/wedding-wrapped-response.dto';

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

    // Calculate total spending from orders (only PAID and COMPLETED orders count towards spending)
    const totalSpending = orders
      .filter(
        (order) =>
          order.orderStatus === OrderStatus.PAID ||
          order.orderStatus === OrderStatus.COMPLETED,
      )
      .reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate remaining budget
    const allocatedBudget = wedding.allocatedBudget;
    const currentSpending = wedding.currentSpending;
    const remainingBudget = allocatedBudget - currentSpending;

    // Calculate budget used percentage
    const budgetUsedPercentage =
      allocatedBudget > 0 ? (currentSpending / allocatedBudget) * 100 : 0;

    // Count only paid and completed orders
    const paidOrCompletedOrders = orders.filter(
      (order) =>
        order.orderStatus === OrderStatus.PAID ||
        order.orderStatus === OrderStatus.COMPLETED,
    );

    return {
      totalSpending,
      allocatedBudget,
      currentSpending,
      remainingBudget,
      budgetUsedPercentage: Math.round(budgetUsedPercentage * 100) / 100, // Round to 2 decimal places
      orderCount: paidOrCompletedOrders.length,
      currency:
        paidOrCompletedOrders.length > 0
          ? paidOrCompletedOrders[0].currency
          : 'SGD',
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

    // Use last 6 months for trend analysis (more responsive to recent changes)
    const recentData = historicalData.slice(-6);

    // Calculate averages
    const avgRevenue =
      recentData.reduce((sum, point) => sum + point.revenue, 0) /
      recentData.length;

    const avgOrderCount =
      recentData.reduce((sum, point) => sum + point.orderCount, 0) /
      recentData.length;

    if (avgRevenue === 0) {
      return [];
    }

    // Calculate linear regression for revenue trend
    let revenueTrend = 0;
    let orderTrend = 0;

    if (recentData.length >= 2) {
      const n = recentData.length;
      let sumX = 0;
      let sumYRevenue = 0;
      let sumYOrders = 0;
      let sumXYRevenue = 0;
      let sumXYOrders = 0;
      let sumX2 = 0;

      recentData.forEach((point, index) => {
        sumX += index;
        sumYRevenue += point.revenue;
        sumYOrders += point.orderCount;
        sumXYRevenue += index * point.revenue;
        sumXYOrders += index * point.orderCount;
        sumX2 += index * index;
      });

      const denominator = n * sumX2 - sumX * sumX;
      if (denominator !== 0) {
        revenueTrend = (n * sumXYRevenue - sumX * sumYRevenue) / denominator;
        orderTrend = (n * sumXYOrders - sumX * sumYOrders) / denominator;
      }
    }

    const predictions: RevenueDataPoint[] = [];
    const lastPeriod = historicalData[historicalData.length - 1].period;
    const lastDate = new Date(lastPeriod);

    for (let i = 1; i <= periodsToPredict; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setMonth(nextDate.getMonth() + i);

      const periodStr = nextDate.toISOString().substring(0, 7);

      // Simple approach: use average + trend projection
      // If trend is negative and would make prediction negative, just use average
      const trendComponent = revenueTrend * i;
      const basePrediction = avgRevenue + trendComponent;

      // If prediction would be too low (< 50% of average), use average instead
      const predictedRevenue =
        basePrediction < avgRevenue * 0.5 ? avgRevenue : basePrediction;

      const orderTrendComponent = orderTrend * i;
      const baseOrderPrediction = avgOrderCount + orderTrendComponent;
      const predictedOrderCount =
        baseOrderPrediction < avgOrderCount * 0.5
          ? avgOrderCount
          : baseOrderPrediction;

      // Ensure predicted values are non-negative
      const finalRevenue = Math.max(0, predictedRevenue);
      const finalOrderCount = Math.max(0, Math.round(predictedOrderCount));

      predictions.push({
        period: periodStr,
        revenue: Math.round(finalRevenue * 100) / 100,
        orderCount: finalOrderCount,
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

  // ========== SUPER ADMIN ANALYTICS ==========

  async getAdminBasicStats(): Promise<AdminBasicStatsResponseDto> {
    // Get total vendors
    const totalVendors = await this.prisma.vendor.count();

    // Get total couples (admins)
    const totalCouples = await this.prisma.admin.count();

    // Get total weddings
    const totalWeddings = await this.prisma.wedding.count();

    // Get total microsites
    const totalMicrosites = await this.prisma.microsite.count();

    // Get total guests served
    const totalGuestsServed = await this.prisma.guest.count();

    return {
      totalVendors,
      totalCouples,
      totalWeddings,
      totalMicrosites,
      totalGuestsServed,
    };
  }

  async getAdminRevenue(): Promise<AdminRevenueResponseDto> {
    // Get all orders with PAID or COMPLETED status (not cancelled)
    const orders = await this.prisma.order.findMany({
      where: {
        orderStatus: {
          in: [OrderStatus.PAID, OrderStatus.COMPLETED],
        },
      },
      include: {
        wedding: true,
      },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let mtd = 0;
    let ytd = 0;
    let allTime = 0;

    orders.forEach((order) => {
      const revenue = order.totalAmount;

      allTime += revenue;

      if (order.purchaseDate >= startOfYear) {
        ytd += revenue;
      }

      if (order.purchaseDate >= startOfMonth) {
        mtd += revenue;
      }
    });

    // Calculate average order value
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? allTime / totalOrders : 0;

    // Calculate commission earned (10% of total revenue)
    const commissionEarned = allTime * 0.1;

    return {
      mtd: Math.round(mtd * 100) / 100,
      ytd: Math.round(ytd * 100) / 100,
      allTime: Math.round(allTime * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      commissionEarned: Math.round(commissionEarned * 100) / 100,
      currency: 'SGD',
    };
  }

  async getAdminRevenueOverTime(
    period: RevenuePeriod = RevenuePeriod.MONTHLY,
  ): Promise<RevenueOverTimeResponseDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const whereClause: Prisma.OrderWhereInput = {
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

      const revenue = order.totalAmount;

      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, { revenue: 0, count: 0 });
      }

      const periodData = periodMap.get(periodKey)!;
      periodData.revenue += revenue;
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

  async getAdminRevenueByCategory(): Promise<AdminRevenueByCategoryResponseDto> {
    // Get all listings with their orders and vendor info
    const listings = await this.prisma.listing.findMany({
      include: {
        vendor: {
          include: {
            user: true,
          },
        },
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

    // Group by service category
    const categoryMap = new Map<
      string,
      { revenue: number; bookingCount: number }
    >();
    let totalRevenue = 0;

    listings.forEach((listing) => {
      const category = listing.vendor.serviceOffered || 'UNCATEGORIZED';
      const bookingCount = listing.orders.length;
      const revenue = listing.orders.reduce(
        (_sum, _ol) => _sum + listing.price,
        0,
      );

      if (!categoryMap.has(category)) {
        categoryMap.set(category, { revenue: 0, bookingCount: 0 });
      }

      const categoryData = categoryMap.get(category)!;
      categoryData.revenue += revenue;
      categoryData.bookingCount += bookingCount;
      totalRevenue += revenue;
    });

    // Convert to array and calculate percentages
    const categories: CategoryRevenueData[] = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        revenue: Math.round(data.revenue * 100) / 100,
        bookingCount: data.bookingCount,
        percentageOfTotal:
          totalRevenue > 0
            ? Math.round((data.revenue / totalRevenue) * 10000) / 100
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      categories,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      currency: 'SGD',
    };
  }

  async getAdminTopVendors(
    limit: number = 10,
  ): Promise<AdminTopVendorsResponseDto> {
    // Get all vendors with their listings and orders
    const vendors = await this.prisma.vendor.findMany({
      include: {
        user: true,
        listings: {
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
        },
      },
    });

    // Calculate revenue and booking count for each vendor
    const vendorData: TopVendorData[] = vendors
      .map((vendor) => {
        let totalRevenue = 0;
        let totalBookings = 0;

        vendor.listings.forEach((listing) => {
          totalBookings += listing.orders.length;
          totalRevenue += listing.orders.reduce(
            (_sum, _ol) => _sum + listing.price,
            0,
          );
        });

        return {
          vendorId: vendor.userId,
          vendorName: vendor.user.name,
          serviceOffered: vendor.serviceOffered || undefined,
          revenue: Math.round(totalRevenue * 100) / 100,
          bookingCount: totalBookings,
          rating: vendor.rating || undefined,
        };
      })
      .filter((vendor) => vendor.bookingCount > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    return {
      topVendors: vendorData,
      currency: 'SGD',
    };
  }

  async getAdminTopListings(
    limit: number = 10,
  ): Promise<AdminTopListingsResponseDto> {
    // Get all listings with their orders and vendor info
    const listings = await this.prisma.listing.findMany({
      include: {
        vendor: {
          include: {
            user: true,
          },
        },
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
    const listingData: TopListingData[] = listings
      .map((listing) => {
        const bookingCount = listing.orders.length;
        const revenue = listing.orders.reduce(
          (_sum, _ol) => _sum + listing.price,
          0,
        );

        return {
          listingId: listing.id,
          listingName: listing.listingName,
          vendorId: listing.vendorId,
          vendorName: listing.vendor.user.name,
          serviceOffered: listing.vendor.serviceOffered || undefined,
          revenue: Math.round(revenue * 100) / 100,
          bookingCount,
          price: listing.price,
        };
      })
      .filter((listing) => listing.bookingCount > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    return {
      topListings: listingData,
      currency: 'SGD',
    };
  }

  async getAdminBookingsOverTime(
    period: RevenuePeriod = RevenuePeriod.MONTHLY,
  ): Promise<AdminBookingsOverTimeResponseDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const whereClause: Prisma.OrderWhereInput = {
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
      orderBy: {
        purchaseDate: 'asc',
      },
    });

    // Group by the specified period
    const periodMap = new Map<
      string,
      { bookingCount: number; revenue: number }
    >();

    orders.forEach((order) => {
      let periodKey: string;

      if (period === RevenuePeriod.MONTHLY) {
        periodKey = order.purchaseDate.toISOString().substring(0, 10);
      } else if (period === RevenuePeriod.YEARLY) {
        periodKey = order.purchaseDate.toISOString().substring(0, 7);
      } else {
        periodKey = order.purchaseDate.toISOString().substring(0, 7);
      }

      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, { bookingCount: 0, revenue: 0 });
      }

      const periodData = periodMap.get(periodKey)!;
      periodData.bookingCount += 1;
      periodData.revenue += order.totalAmount;
    });

    // Convert map to array and sort chronologically
    const data: BookingDataPoint[] = Array.from(periodMap.entries())
      .map(([periodKey, periodData]) => ({
        period: periodKey,
        bookingCount: periodData.bookingCount,
        revenue: Math.round(periodData.revenue * 100) / 100,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    return {
      data,
      periodType: period,
      currency: 'SGD',
    };
  }

  async getAdminWeddingDatesHeatmap(): Promise<AdminWeddingDatesHeatmapResponseDto> {
    // Get all weddings with dates
    const weddings = await this.prisma.wedding.findMany({
      where: {
        date: {
          not: null,
        },
      },
      select: {
        date: true,
      },
    });

    // Group by date
    const dateMap = new Map<string, number>();

    weddings.forEach((wedding) => {
      if (wedding.date) {
        const dateKey = wedding.date.toISOString().substring(0, 10);
        dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
      }
    });

    // Convert to array and sort by date
    const data: WeddingDateData[] = Array.from(dateMap.entries())
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      data,
      totalWeddings: weddings.length,
    };
  }

  async getAdminUserGrowth(
    period: RevenuePeriod = RevenuePeriod.MONTHLY,
  ): Promise<AdminUserGrowthResponseDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get all vendors and admins with their creation dates
    const vendors = await this.prisma.vendor.findMany({
      select: {
        onboardedDate: true,
      },
      orderBy: {
        onboardedDate: 'asc',
      },
    });

    const admins = await this.prisma.admin.findMany({
      select: {
        onboardedDate: true,
      },
      orderBy: {
        onboardedDate: 'asc',
      },
    });

    // Combine and group by period
    const periodMap = new Map<
      string,
      { vendorSignups: number; coupleSignups: number }
    >();

    // Process vendors
    vendors.forEach((vendor) => {
      let periodKey: string;
      const date = vendor.onboardedDate;

      // Apply date filter based on period
      if (period === RevenuePeriod.MONTHLY && date < startOfMonth) return;
      if (period === RevenuePeriod.YEARLY && date < startOfYear) return;

      if (period === RevenuePeriod.MONTHLY) {
        periodKey = date.toISOString().substring(0, 10);
      } else {
        periodKey = date.toISOString().substring(0, 7);
      }

      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, { vendorSignups: 0, coupleSignups: 0 });
      }

      periodMap.get(periodKey)!.vendorSignups += 1;
    });

    // Process admins
    admins.forEach((admin) => {
      let periodKey: string;
      const date = admin.onboardedDate;

      // Apply date filter based on period
      if (period === RevenuePeriod.MONTHLY && date < startOfMonth) return;
      if (period === RevenuePeriod.YEARLY && date < startOfYear) return;

      if (period === RevenuePeriod.MONTHLY) {
        periodKey = date.toISOString().substring(0, 10);
      } else {
        periodKey = date.toISOString().substring(0, 7);
      }

      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, { vendorSignups: 0, coupleSignups: 0 });
      }

      periodMap.get(periodKey)!.coupleSignups += 1;
    });

    // Convert to array and calculate cumulative totals
    const sortedEntries = Array.from(periodMap.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );

    let cumulativeTotal = 0;
    const data: UserGrowthDataPoint[] = sortedEntries.map(
      ([periodKey, periodData]) => {
        const totalSignups =
          periodData.vendorSignups + periodData.coupleSignups;
        cumulativeTotal += totalSignups;

        return {
          period: periodKey,
          vendorSignups: periodData.vendorSignups,
          coupleSignups: periodData.coupleSignups,
          totalSignups,
          cumulativeTotal,
        };
      },
    );

    return {
      data,
      periodType: period,
      totalVendors: vendors.length,
      totalCouples: admins.length,
    };
  }

  /**
   * Generate and save Wedding Wrapped analytics for a wedding
   */
  async generateWeddingWrapped(
    weddingId: number,
  ): Promise<WeddingWrappedResponseDto> {
    // Verify wedding exists
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      include: {
        guests: {
          include: {
            cashGifts: true,
          },
        },
        orders: {
          where: {
            orderStatus: {
              in: [OrderStatus.PAID, OrderStatus.COMPLETED],
            },
          },
          include: {
            listings: {
              include: {
                listing: {
                  include: {
                    vendor: true,
                  },
                },
              },
            },
          },
        },
        wishlistItems: true,
        album: {
          include: {
            photoEntities: {
              include: {
                faces: true,
              },
            },
            personClusters: true,
          },
        },
        guestbook: true,
      },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${weddingId} not found`);
    }

    // === GUEST INSIGHTS ===
    const allGuests = wedding.guests;
    const totalInvited = allGuests.length;
    const totalConfirmed = allGuests.filter(
      (g) => g.confirmationStatus === ConfirmationStatus.CONFIRMED,
    ).length;
    const totalAttended = allGuests.filter((g) => g.attendance).length;

    // First guest to arrive
    const guestsWithCheckIn = allGuests
      .filter((g) => g.checkInTime)
      .sort(
        (a, b) => a.checkInTime!.getTime() - b.checkInTime!.getTime(),
      );
    const firstGuest = guestsWithCheckIn[0];

    // Fastest RSVP (confirmed guests with creation time)
    const confirmedGuests = allGuests.filter(
      (g) => g.confirmationStatus === ConfirmationStatus.CONFIRMED,
    );
    let fastestRsvpGuest = null;
    let fastestRsvpDuration = null;
    if (confirmedGuests.length > 0) {
      const guestsWithDuration = confirmedGuests
        .map((g) => ({
          guest: g,
          duration: Math.abs(g.updatedAt.getTime() - g.createdAt.getTime()) / (1000 * 60 * 60), // hours
        }))
        .sort((a, b) => a.duration - b.duration);

      fastestRsvpGuest = guestsWithDuration[0].guest;
      fastestRsvpDuration = Math.round(guestsWithDuration[0].duration);
    }

    // Peak attendance time (simplified - using check-in times)
    let peakTime = null;
    let peakGuestCount = null;
    if (guestsWithCheckIn.length > 0) {
      // Group by hour
      const hourlyCheckIns = new Map<string, number>();
      guestsWithCheckIn.forEach((g) => {
        const hour = g.checkInTime!.toISOString().substring(0, 13); // YYYY-MM-DDTHH
        hourlyCheckIns.set(hour, (hourlyCheckIns.get(hour) || 0) + 1);
      });

      let maxCount = 0;
      let maxHour = '';
      hourlyCheckIns.forEach((count, hour) => {
        if (count > maxCount) {
          maxCount = count;
          maxHour = hour;
        }
      });

      if (maxHour) {
        peakTime = new Date(maxHour + ':00:00Z');
        peakGuestCount = maxCount;
      }
    }

    // Squad breakdown by group
    const groupMap = new Map<string, number>();
    allGuests.forEach((g) => {
      const group = g.group || 'Ungrouped';
      groupMap.set(group, (groupMap.get(group) || 0) + 1);
    });
    const squadBreakdown: SquadBreakdownItem[] = Array.from(groupMap.entries())
      .map(([group, count]) => ({ group, count }))
      .sort((a, b) => b.count - a.count);

    const guestInsights: GuestInsights = {
      totalInvited,
      totalConfirmed,
      totalAttended,
      firstGuestName: firstGuest?.name,
      firstGuestTime: firstGuest?.checkInTime,
      fastestRsvpName: fastestRsvpGuest?.name,
      fastestRsvpDuration,
      peakTime,
      peakGuestCount,
      squadBreakdown,
    };

    // === GIFT & SUPPORT INSIGHTS ===
    const wishlistItems = wedding.wishlistItems;

    // Most wanted wishlist item (by title frequency - simplified)
    const itemTitleMap = new Map<string, number>();
    wishlistItems.forEach((item) => {
      if (item.isReserved) {
        itemTitleMap.set(item.title, (itemTitleMap.get(item.title) || 0) + 1);
      }
    });
    let mostWantedItem = null;
    let mostWantedItemCount = null;
    if (itemTitleMap.size > 0) {
      const sorted = Array.from(itemTitleMap.entries()).sort((a, b) => b[1] - a[1]);
      mostWantedItem = sorted[0][0];
      mostWantedItemCount = sorted[0][1];
    }

    // Top cash gift contributor
    const allCashGifts = allGuests.flatMap((g) =>
      g.cashGifts.map((cg) => ({ ...cg, guestName: g.name }))
    );
    const sortedCashGifts = allCashGifts.sort((a, b) => b.amount - a.amount);
    const topContributor = sortedCashGifts[0];
    const totalGiftValue = allCashGifts.reduce((sum, cg) => sum + cg.amount, 0);

    // Wishlist completion
    const totalWishlistItems = wishlistItems.length;
    const reservedItems = wishlistItems.filter((item) => item.isReserved).length;
    const wishlistCompletion = totalWishlistItems > 0
      ? (reservedItems / totalWishlistItems) * 100
      : 0;

    const giftSupportInsights: GiftSupportInsights = {
      mostWantedItem,
      mostWantedItemCount,
      topContributorName: topContributor?.guestName,
      topContribution: topContributor?.amount,
      wishlistCompletion: Math.round(wishlistCompletion * 100) / 100,
      totalGiftValue,
    };

    // === PLANNING JOURNEY INSIGHTS ===
    const planningDays = wedding.date
      ? Math.floor((wedding.date.getTime() - wedding.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : Math.floor((Date.now() - wedding.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // Top vendor category by spending
    const categorySpending = new Map<string, number>();
    wedding.orders.forEach((order) => {
      order.listings.forEach((ol) => {
        const vendor = ol.listing.vendor;
        if (vendor.serviceOffered) {
          const current = categorySpending.get(vendor.serviceOffered) || 0;
          // Split order amount evenly across listings (simplified)
          categorySpending.set(
            vendor.serviceOffered,
            current + order.totalAmount / order.listings.length,
          );
        }
      });
    });

    let topVendorCategory = null;
    let topVendorAmount = null;
    if (categorySpending.size > 0) {
      const sorted = Array.from(categorySpending.entries()).sort((a, b) => b[1] - a[1]);
      topVendorCategory = sorted[0][0] as any;
      topVendorAmount = sorted[0][1];
    }

    const totalSpent = wedding.currentSpending;
    const allocatedBudget = wedding.allocatedBudget;
    const budgetUtilization = allocatedBudget > 0
      ? (totalSpent / allocatedBudget) * 100
      : 0;

    const planningJourneyInsights: PlanningJourneyInsights = {
      planningDays,
      topVendorCategory,
      topVendorAmount,
      budgetUtilization: Math.round(budgetUtilization * 100) / 100,
      totalSpent,
      allocatedBudget,
    };

    // === EMOTIONAL TOUCH INSIGHTS ===
    const guestbookNotes = wedding.guestbook?.guestNotes || [];
    const totalWellWishes = guestbookNotes.length;

    const totalPhotos = wedding.album?.photoEntities.length || 0;
    const totalFacesDetected = wedding.album?.photoEntities.reduce(
      (sum, photo) => sum + photo.faces.length,
      0,
    ) || 0;
    const totalPeopleClusters = wedding.album?.personClusters.length || 0;

    const emotionalTouchInsights: EmotionalTouchInsights = {
      totalWellWishes,
      totalPhotos,
      totalFacesDetected,
      totalPeopleClusters,
    };

    // === SAVE TO DATABASE ===
    const weddingWrapped = await this.prisma.weddingWrapped.upsert({
      where: { weddingId },
      update: {
        totalInvited,
        totalConfirmed,
        totalAttended,
        firstGuestName: firstGuest?.name,
        firstGuestTime: firstGuest?.checkInTime,
        fastestRsvpName: fastestRsvpGuest?.name,
        fastestRsvpDuration,
        peakTime,
        peakGuestCount,
        squadBreakdown: squadBreakdown as any,
        mostWantedItem,
        mostWantedItemCount,
        topContributorName: topContributor?.guestName,
        topContribution: topContributor?.amount,
        wishlistCompletion: Math.round(wishlistCompletion * 100) / 100,
        totalGiftValue,
        planningDays,
        topVendorCategory,
        topVendorAmount,
        budgetUtilization: Math.round(budgetUtilization * 100) / 100,
        totalSpent,
        allocatedBudget,
        totalWellWishes,
        totalPhotos,
        totalFacesDetected,
        totalPeopleClusters,
        generatedAt: new Date(),
      },
      create: {
        weddingId,
        totalInvited,
        totalConfirmed,
        totalAttended,
        firstGuestName: firstGuest?.name,
        firstGuestTime: firstGuest?.checkInTime,
        fastestRsvpName: fastestRsvpGuest?.name,
        fastestRsvpDuration,
        peakTime,
        peakGuestCount,
        squadBreakdown: squadBreakdown as any,
        mostWantedItem,
        mostWantedItemCount,
        topContributorName: topContributor?.guestName,
        topContribution: topContributor?.amount,
        wishlistCompletion: Math.round(wishlistCompletion * 100) / 100,
        totalGiftValue,
        planningDays,
        topVendorCategory,
        topVendorAmount,
        budgetUtilization: Math.round(budgetUtilization * 100) / 100,
        totalSpent,
        allocatedBudget,
        totalWellWishes,
        totalPhotos,
        totalFacesDetected,
        totalPeopleClusters,
      },
    });

    return this.toWeddingWrappedDto(
      weddingWrapped,
      guestInsights,
      giftSupportInsights,
      planningJourneyInsights,
      emotionalTouchInsights,
    );
  }

  /**
   * Get saved Wedding Wrapped analytics for a wedding
   */
  async getWeddingWrapped(
    weddingId: number,
  ): Promise<WeddingWrappedResponseDto> {
    const weddingWrapped = await this.prisma.weddingWrapped.findUnique({
      where: { weddingId },
    });

    if (!weddingWrapped) {
      throw new NotFoundException(
        `Wedding Wrapped not found for wedding ID ${weddingId}. Please generate it first.`,
      );
    }

    // Parse squad breakdown from JSON
    const squadBreakdown = (weddingWrapped.squadBreakdown as any) || [];

    const guestInsights: GuestInsights = {
      totalInvited: weddingWrapped.totalInvited,
      totalConfirmed: weddingWrapped.totalConfirmed,
      totalAttended: weddingWrapped.totalAttended,
      firstGuestName: weddingWrapped.firstGuestName,
      firstGuestTime: weddingWrapped.firstGuestTime,
      fastestRsvpName: weddingWrapped.fastestRsvpName,
      fastestRsvpDuration: weddingWrapped.fastestRsvpDuration,
      peakTime: weddingWrapped.peakTime,
      peakGuestCount: weddingWrapped.peakGuestCount,
      squadBreakdown,
    };

    const giftSupportInsights: GiftSupportInsights = {
      mostWantedItem: weddingWrapped.mostWantedItem,
      mostWantedItemCount: weddingWrapped.mostWantedItemCount,
      topContributorName: weddingWrapped.topContributorName,
      topContribution: weddingWrapped.topContribution,
      wishlistCompletion: weddingWrapped.wishlistCompletion,
      totalGiftValue: weddingWrapped.totalGiftValue,
    };

    const planningJourneyInsights: PlanningJourneyInsights = {
      planningDays: weddingWrapped.planningDays,
      topVendorCategory: weddingWrapped.topVendorCategory,
      topVendorAmount: weddingWrapped.topVendorAmount,
      budgetUtilization: weddingWrapped.budgetUtilization,
      totalSpent: weddingWrapped.totalSpent,
      allocatedBudget: weddingWrapped.allocatedBudget,
    };

    const emotionalTouchInsights: EmotionalTouchInsights = {
      totalWellWishes: weddingWrapped.totalWellWishes,
      totalPhotos: weddingWrapped.totalPhotos,
      totalFacesDetected: weddingWrapped.totalFacesDetected,
      totalPeopleClusters: weddingWrapped.totalPeopleClusters,
    };

    return this.toWeddingWrappedDto(
      weddingWrapped,
      guestInsights,
      giftSupportInsights,
      planningJourneyInsights,
      emotionalTouchInsights,
    );
  }

  /**
   * Helper method to transform WeddingWrapped entity to DTO
   */
  private toWeddingWrappedDto(
    weddingWrapped: any,
    guestInsights: GuestInsights,
    giftSupportInsights: GiftSupportInsights,
    planningJourneyInsights: PlanningJourneyInsights,
    emotionalTouchInsights: EmotionalTouchInsights,
  ): WeddingWrappedResponseDto {
    return {
      id: weddingWrapped.id,
      weddingId: weddingWrapped.weddingId,
      guestInsights,
      giftSupportInsights,
      planningJourneyInsights,
      emotionalTouchInsights,
      generatedAt: weddingWrapped.generatedAt,
      createdAt: weddingWrapped.createdAt,
      updatedAt: weddingWrapped.updatedAt,
    };
  }
}
