import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const listingIds = dto.listings.map((l) => l.listingId);
    const listings = await this.prisma.listing.findMany({
      where: { id: { in: listingIds } },
    });

    if (listings.length !== listingIds.length) {
      throw new BadRequestException('One or more listings not found');
    }

    // Validate that all requested slots are available
    for (const orderListing of dto.listings) {
      const listing = listings.find((l) => l.id === orderListing.listingId);
      if (!listing) continue;

      const availableSlots = (listing.availabilities as any) || [];

      for (const requestedSlot of orderListing.bookedSlots) {
        // Check if the exact slot exists in the listing's availabilities
        const slotExists = availableSlots.some((availableSlot) => {
          return (
            availableSlot.startTime === requestedSlot.startTime &&
            availableSlot.endTime === requestedSlot.endTime &&
            (availableSlot.date ||
              new Date(availableSlot.startTime).toISOString().split('T')[0]) ===
              (requestedSlot.date ||
                new Date(requestedSlot.startTime).toISOString().split('T')[0])
          );
        });

        if (!slotExists) {
          throw new BadRequestException(
            `Time slot ${requestedSlot.startTime} - ${requestedSlot.endTime} is not available for listing ${listing.listingName}`,
          );
        }
      }
    }

    // Calculate total amount based on price × number of booked slots for each listing
    const totalAmount = dto.listings.reduce((sum, orderListing) => {
      const listing = listings.find((l) => l.id === orderListing.listingId);
      if (!listing) return sum;
      const slotsCount = orderListing.bookedSlots.length;
      return sum + listing.price * slotsCount;
    }, 0);

    // Create order with listings and booked dates
    const order = await this.prisma.order.create({
      data: {
        weddingId: dto.weddingId,
        totalAmount,
        remark: dto.remark,
        listings: {
          createMany: {
            data: dto.listings.map((orderListing) => ({
              listingId: orderListing.listingId,
              bookedSlots: orderListing.bookedSlots as any,
            })),
          },
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

    // Remove booked slots from listing availabilities
    for (const orderListing of dto.listings) {
      const listing = listings.find((l) => l.id === orderListing.listingId);
      if (!listing) continue;

      const availableSlots = (listing.availabilities as any) || [];

      // Remove the exact booked slots from available slots
      const updatedSlots = availableSlots.filter((availableSlot) => {
        return !orderListing.bookedSlots.some((bookedSlot) => {
          return (
            availableSlot.startTime === bookedSlot.startTime &&
            availableSlot.endTime === bookedSlot.endTime &&
            (availableSlot.date ||
              new Date(availableSlot.startTime).toISOString().split('T')[0]) ===
              (bookedSlot.date ||
                new Date(bookedSlot.startTime).toISOString().split('T')[0])
          );
        });
      });

      await this.prisma.listing.update({
        where: { id: orderListing.listingId },
        data: { availabilities: updatedSlots as any },
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
      throw new BadRequestException(
        'Cannot cancel a paid order. Please refund instead.',
      );
    }

    if (order.orderStatus === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    // Restore booked slots back to listing availabilities when cancelling
    for (const orderListing of order.listings) {
      const listing = orderListing.listing;
      const bookedSlots = orderListing.bookedSlots as any[];

      const availableSlots = (listing.availabilities as any) || [];
      // Add the cancelled slots back to available slots
      const updatedSlots = [...availableSlots, ...bookedSlots];

      await this.prisma.listing.update({
        where: { id: listing.id },
        data: { availabilities: updatedSlots as any },
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

    // Restore booked slots back to listing availabilities
    for (const orderListing of order.listings) {
      const listing = orderListing.listing;
      const bookedSlots = orderListing.bookedSlots as any[];

      const availableSlots = (listing.availabilities as any) || [];
      // Add the deleted order's slots back to available slots
      const updatedSlots = [...availableSlots, ...bookedSlots];

      await this.prisma.listing.update({
        where: { id: listing.id },
        data: { availabilities: updatedSlots as any },
      });
    }

    await this.prisma.order.delete({
      where: { id },
    });
  }

  toOrderResponseDto(order: any): OrderResponseDto {
    return {
      id: order.id,
      orderStatus: order.orderStatus,
      totalAmount: order.totalAmount,
      currency: order.currency,
      purchaseDate: order.purchaseDate,
      remark: order.remark,
      weddingId: order.weddingId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      listings: order.listings?.map((ol: any) => ({
        ...ol.listing,
        bookedSlots: ol.bookedSlots,
      })),
      payments: order.payments,
    };
  }
}
