import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfirmationStatus } from '../common/confirmation-status.enum';
import { OrderStatus } from '../common/order-status.enum';
import { WeddingService } from '../common/wedding-service.enum';
import { PrismaService } from '../prisma/prisma.service';
import { GuestCountResponseDto } from './dto/guest-count-response.dto';
import {
  CategoryRevenueData,
  RevenueByCategoryResponseDto,
} from './dto/revenue-by-category-response.dto';
import {
  MonthlyRevenueData,
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
  ): Promise<RevenueOverTimeResponseDto> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    // Get all orders for this vendor's listings
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
      orderBy: {
        purchaseDate: 'asc',
      },
    });

    // Group by month
    const monthlyMap = new Map<string, { revenue: number; count: number }>();

    orders.forEach((order) => {
      const monthKey = order.purchaseDate.toISOString().substring(0, 7); // YYYY-MM
      const vendorRevenue = order.listings.reduce(
        (sum, ol) => sum + ol.listing.price,
        0,
      );

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { revenue: 0, count: 0 });
      }

      const monthData = monthlyMap.get(monthKey)!;
      monthData.revenue += vendorRevenue;
      monthData.count += 1;
    });

    // Convert map to array and sort
    const monthlyData: MonthlyRevenueData[] = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        revenue: Math.round(data.revenue * 100) / 100,
        orderCount: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      monthlyData,
      currency: 'SGD',
    };
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

  async getVendorRevenueByCategory(
    vendorId: number,
  ): Promise<RevenueByCategoryResponseDto> {
    // Verify vendor exists
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: vendorId },
      include: {
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

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    // Calculate total revenue and booking count per listing
    let totalRevenue = 0;
    const listingStats = vendor.listings.map((listing) => {
      const bookingCount = listing.orders.length;
      const revenue = listing.orders.reduce(
        (sum, _ol) => sum + listing.price,
        0,
      );
      totalRevenue += revenue;

      return {
        revenue,
        bookingCount,
      };
    });

    // Since vendor only has one serviceOffered, create a single category
    const categories: CategoryRevenueData[] = [];

    if (vendor.serviceOffered && totalRevenue > 0) {
      const totalBookings = listingStats.reduce(
        (sum, stat) => sum + stat.bookingCount,
        0,
      );

      categories.push({
        category: vendor.serviceOffered as WeddingService,
        revenue: Math.round(totalRevenue * 100) / 100,
        percentage: 100,
        bookingCount: totalBookings,
      });
    }

    return {
      categories,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
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
