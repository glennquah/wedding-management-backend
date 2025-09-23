import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Order } from '@prisma/client';
import { OrderStatus } from '../common/order-status.enum';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    // Verify wedding exists
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: dto.weddingId },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${dto.weddingId} not found`);
    }

    // Verify all listings exist and validate availability
    const listingIds = dto.listings.map(l => l.listingId);
    const listings = await this.prisma.listing.findMany({
      where: { id: { in: listingIds } },
    });

    if (listings.length !== listingIds.length) {
      throw new BadRequestException('One or more listings not found');
    }

    // Validate that all requested dates are available
    for (const orderListing of dto.listings) {
      const listing = listings.find(l => l.id === orderListing.listingId);
      if (!listing) continue;

      const requestedDates = orderListing.bookedDates.map(date => new Date(date));
      const availableDates = listing.availabilities;

      for (const requestedDate of requestedDates) {
        const isAvailable = availableDates.some(availableDate =>
          availableDate.getTime() === requestedDate.getTime()
        );
        if (!isAvailable) {
          throw new BadRequestException(
            `Date ${requestedDate.toISOString().split('T')[0]} is not available for listing ${listing.listingName}`
          );
        }
      }
    }

    const totalAmount = listings.reduce((sum, listing) => sum + listing.price, 0);

    // Set expiration time (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Create order with listings and booked dates
    const order = await this.prisma.order.create({
      data: {
        weddingId: dto.weddingId,
        totalAmount,
        expiresAt,
        remark: dto.remark,
        listings: {
          create: dto.listings.map((orderListing) => ({
            listingId: orderListing.listingId,
            bookedDates: orderListing.bookedDates.map(date => new Date(date)),
          })),
        },
      },
      include: {
        listings: {
          include: {
            listing: true,
          },
        },
      },
    });

    // Remove booked dates from listing availabilities
    for (const orderListing of dto.listings) {
      const listing = listings.find(l => l.id === orderListing.listingId);
      if (!listing) continue;

      const bookedDates = orderListing.bookedDates.map(date => new Date(date));
      const updatedAvailabilities = listing.availabilities.filter(availableDate =>
        !bookedDates.some(bookedDate => bookedDate.getTime() === availableDate.getTime())
      );

      await this.prisma.listing.update({
        where: { id: orderListing.listingId },
        data: { availabilities: updatedAvailabilities },
      });
    }

    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.prisma.order.findMany({
      include: {
        listings: {
          include: {
            listing: true,
          },
        },
        payments: true,
        wedding: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        listings: {
          include: {
            listing: true,
          },
        },
        payments: true,
        wedding: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByWedding(weddingId: number): Promise<Order[]> {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${weddingId} not found`);
    }

    return this.prisma.order.findMany({
      where: { weddingId },
      include: {
        listings: {
          include: {
            listing: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, dto: UpdateOrderDto): Promise<Order> {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.prisma.order.update({
      where: { id },
      data: dto,
      include: {
        listings: {
          include: {
            listing: true,
          },
        },
        payments: true,
      },
    });
  }

  async cancel(id: number): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        payments: true,
        listings: {
          include: {
            listing: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.orderStatus === OrderStatus.PAID) {
      throw new BadRequestException('Cannot cancel a paid order. Please refund instead.');
    }

    if (order.orderStatus === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    // Restore booked dates back to listing availabilities when cancelling
    for (const orderListing of order.listings) {
      const listing = orderListing.listing;
      const bookedDates = orderListing.bookedDates;

      // Add back the booked dates to the listing's availabilities
      const updatedAvailabilities = [...listing.availabilities, ...bookedDates];

      // Sort the dates and remove duplicates
      const sortedUniqueAvailabilities = Array.from(
        new Set(updatedAvailabilities.map(date => date.getTime()))
      ).map(time => new Date(time)).sort();

      await this.prisma.listing.update({
        where: { id: listing.id },
        data: { availabilities: sortedUniqueAvailabilities },
      });
    }

    return this.prisma.order.update({
      where: { id },
      data: { orderStatus: OrderStatus.CANCELLED },
      include: {
        listings: {
          include: {
            listing: true,
          },
        },
        payments: true,
      },
    });
  }

  async delete(id: number): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        listings: {
          include: {
            listing: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Restore booked dates back to listing availabilities
    for (const orderListing of order.listings) {
      const listing = orderListing.listing;
      const bookedDates = orderListing.bookedDates;

      // Add back the booked dates to the listing's availabilities
      const updatedAvailabilities = [...listing.availabilities, ...bookedDates];

      // Sort the dates and remove duplicates
      const sortedUniqueAvailabilities = Array.from(
        new Set(updatedAvailabilities.map(date => date.getTime()))
      ).map(time => new Date(time)).sort();

      await this.prisma.listing.update({
        where: { id: listing.id },
        data: { availabilities: sortedUniqueAvailabilities },
      });
    }

    await this.prisma.order.delete({
      where: { id },
    });
  }


  isOrderExpired(order: { expiresAt?: Date | null; orderStatus: string }): boolean {
    if (!order.expiresAt) return false;
    if (order.orderStatus !== OrderStatus.PENDING) return false;
    return new Date() > order.expiresAt;
  }

  toOrderResponseDto(order: any): OrderResponseDto {
    return {
      id: order.id,
      orderStatus: order.orderStatus,
      totalAmount: order.totalAmount,
      currency: order.currency,
      purchaseDate: order.purchaseDate,
      expiresAt: order.expiresAt,
      remark: order.remark,
      weddingId: order.weddingId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      listings: order.listings?.map((ol: any) => ({
        ...ol.listing,
        bookedDates: ol.bookedDates,
      })),
      payments: order.payments,
    };
  }
}