import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Order } from '@prisma/client';
import { OrderStatus } from '../common/order-status.enum';
import { PaymentStatus } from '../common/payment-status.enum';
import { EmailNotificationService } from '../email-notification/email-notification.service';
import { PaymentService } from '../payment/payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderListingDetailResponseDto } from './dto/order-listing-detail-response.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private paymentService: PaymentService,
    private emailService: EmailNotificationService,
  ) {}

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

  async findSuccessfulOrdersByWedding(weddingId: number): Promise<Order[]> {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${weddingId} not found`);
    }

    return this.prisma.order.findMany({
      where: {
        weddingId,
        orderStatus: {
          in: [OrderStatus.PAID, OrderStatus.COMPLETED],
        },
      },
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

  async getOrderListingDetailsByWedding(
    weddingId: number,
  ): Promise<OrderListingDetailResponseDto[]> {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${weddingId} not found`);
    }

    // Get all orders for this wedding with their listings
    const orders = await this.prisma.order.findMany({
      where: { weddingId },
      include: {
        listings: {
          include: {
            listing: {
              include: {
                vendor: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { purchaseDate: 'desc' },
    });

    // Flatten the order listings into a single array
    const listingDetails: OrderListingDetailResponseDto[] = [];

    for (const order of orders) {
      for (const orderListing of order.listings) {
        // Skip cancelled orders
        if (orderListing.bookingStatus === OrderStatus.CANCELLED) {
          continue;
        }

        const listing = orderListing.listing;
        const bookedSlots = orderListing.bookedSlots as any[];
        const slotsCount = bookedSlots ? bookedSlots.length : 1;
        const amount = listing.price * slotsCount;

        // Extract date from the first booked slot
        let date = order.purchaseDate.toISOString().split('T')[0]; // Default to purchase date
        if (bookedSlots && bookedSlots.length > 0) {
          const firstSlot = bookedSlots[0];
          // Try to get date from the date field, or extract from startTime
          if (firstSlot.date) {
            date = firstSlot.date;
          } else if (firstSlot.startTime) {
            date = new Date(firstSlot.startTime).toISOString().split('T')[0];
          }
        }

        listingDetails.push({
          orderId: order.id,
          listingId: listing.id,
          listingName: listing.listingName,
          date: date,
          status: orderListing.bookingStatus as OrderStatus,
          amount: amount,
          currency: order.currency,
          vendorName: listing.vendor.user.name,
        });
      }
    }

    return listingDetails;
  }

  async findByVendor(vendorId: number): Promise<Order[]> {
    // Verify vendor exists
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    // Find all orders that contain listings belonging to this vendor
    const orders = await this.prisma.order.findMany({
      where: {
        listings: {
          some: {
            listing: {
              vendorId: vendorId,
            },
          },
        },
      },
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

    return orders;
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

    // Check if any listing is already paid
    const hasAnyPaidListing = order.listings.some(
      (ol) => ol.bookingStatus === OrderStatus.PAID,
    );

    if (hasAnyPaidListing) {
      throw new BadRequestException(
        'Cannot cancel an order with paid listings. Please refund instead.',
      );
    }

    // Check if all listings are already cancelled
    const allCancelled = order.listings.every(
      (ol) => ol.bookingStatus === OrderStatus.CANCELLED,
    );

    if (allCancelled) {
      throw new BadRequestException('All listings are already cancelled');
    }

    // Restore booked slots back to listing availabilities and cancel each listing
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

      // Update each OrderListing status to CANCELLED
      await this.prisma.orderListing.update({
        where: { orderId_listingId: { orderId: id, listingId: listing.id } },
        data: { bookingStatus: OrderStatus.CANCELLED },
      });
    }

    // Return the updated order
    return this.findOne(id);
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

  async deleteListing(
    orderId: number,
    listingId: number,
  ): Promise<Order | void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listings: { include: { listing: true } },
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const orderListing = order.listings.find((l) => l.listingId === listingId);
    if (!orderListing) {
      throw new NotFoundException(
        `Listing with ID ${listingId} not found in order ${orderId}`,
      );
    }

    // Don't allow removing a listing that's already been paid
    if (
      orderListing.bookingStatus === OrderStatus.PAID ||
      orderListing.bookingStatus === OrderStatus.CONFIRMED ||
      orderListing.bookingStatus === OrderStatus.COMPLETED
    ) {
      throw new BadRequestException(
        `Cannot remove listing that has status: ${orderListing.bookingStatus}. Only PENDING or CANCELLED listings can be removed.`,
      );
    }

    // Restore booked slots for this listing
    const listing = orderListing.listing;
    const bookedSlots = orderListing.bookedSlots as any[];
    const availableSlots = (listing.availabilities as any) || [];
    const updatedSlots = [...availableSlots, ...bookedSlots];

    await this.prisma.listing.update({
      where: { id: listing.id },
      data: { availabilities: updatedSlots as any },
    });

    // Compute amount to subtract from order and pending payments
    const slotsCount = bookedSlots ? bookedSlots.length : 1;
    const amountToSubtract = listing.price * slotsCount;

    // Delete the OrderListing (composite primary key)
    await this.prisma.orderListing.delete({
      where: { orderId_listingId: { orderId, listingId } },
    });

    // Recompute remaining listings
    const remainingListings = order.listings.filter(
      (l) => l.listingId !== listingId,
    );

    // If no more listings, delete the order (payments will cascade)
    if (remainingListings.length === 0) {
      await this.prisma.order.delete({ where: { id: orderId } });
      return;
    }

    // Otherwise update order total and any pending payments
    const newTotal = Math.max(0, order.totalAmount - amountToSubtract);
    await this.prisma.order.update({
      where: { id: orderId },
      data: { totalAmount: newTotal },
    });

    // Adjust pending payments' amounts (if any)
    for (const payment of order.payments) {
      if (payment.paymentStatus === PaymentStatus.PENDING) {
        const newPaymentAmount = Math.max(0, payment.amount - amountToSubtract);
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { amount: newPaymentAmount },
        });
      }
    }

    // Return updated order
    return this.findOne(orderId);
  }

  async vendorConfirmListing(
    orderId: number,
    listingId: number,
    vendorId: number,
  ): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listings: {
          include: {
            listing: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Find the specific OrderListing
    const orderListing = order.listings.find(
      (ol) => ol.listingId === listingId,
    );
    if (!orderListing) {
      throw new NotFoundException(
        `Listing with ID ${listingId} not found in order ${orderId}`,
      );
    }

    // Verify the vendor owns this listing
    if (orderListing.listing.vendorId !== vendorId) {
      throw new BadRequestException('You can only confirm your own listings');
    }

    // Validate listing status - can only confirm PAID bookings
    if (orderListing.bookingStatus !== OrderStatus.PAID) {
      throw new BadRequestException(
        `Listing must be in PAID status to be confirmed. Current status: ${orderListing.bookingStatus}`,
      );
    }

    // Update OrderListing status to CONFIRMED
    await this.prisma.orderListing.update({
      where: { orderId_listingId: { orderId, listingId } },
      data: { bookingStatus: OrderStatus.CONFIRMED },
    });

    // Send confirmation email to couple
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: vendorId },
      include: { user: true },
    });

    if (vendor) {
      const wedding = await this.prisma.wedding.findUnique({
        where: { id: order.weddingId },
        include: { mainCouple: { include: { user: true } } },
      });

      if (wedding && wedding.mainCouple.length > 0) {
        const coupleName = wedding.mainCouple
          .map((couple) => couple.user.name)
          .join(' & ');
        const bookedSlots = Array.isArray(orderListing.bookedSlots)
          ? orderListing.bookedSlots
          : [];
        const slotsCount = bookedSlots.length > 0 ? bookedSlots.length : 1;
        const listingPrice = orderListing.listing?.price || 0;
        const totalAmount = listingPrice * slotsCount;

        const amount = `${order.currency} ${totalAmount.toFixed(2)}`;
        const weddingDate = wedding.date
          ? wedding.date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'TBD';

        for (const _couple of wedding.mainCouple) {
          await this.emailService.sendVendorBookingConfirmationEmail(
            _couple.user.email,
            coupleName,
            vendor.user.name,
            orderListing.listing.listingName,
            weddingDate,
            amount,
            orderId,
            order.weddingId,
          );
        }
      }
    }

    // Return updated order
    return this.findOne(orderId);
  }

  async vendorRejectListing(
    orderId: number,
    listingId: number,
    vendorId: number,
  ): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listings: {
          include: {
            listing: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Find the specific OrderListing
    const orderListing = order.listings.find(
      (ol) => ol.listingId === listingId,
    );
    if (!orderListing) {
      throw new NotFoundException(
        `Listing with ID ${listingId} not found in order ${orderId}`,
      );
    }

    // Verify the vendor owns this listing
    if (orderListing.listing.vendorId !== vendorId) {
      throw new BadRequestException('You can only reject your own listings');
    }

    // Validate listing status - can only reject PAID bookings
    if (orderListing.bookingStatus !== OrderStatus.PAID) {
      throw new BadRequestException(
        `Listing must be in PAID status to be rejected. Current status: ${orderListing.bookingStatus}`,
      );
    }

    // Check if payment exists and needs refund
    const hasSuccessfulPayment = order.payments.some(
      (p) => p.paymentStatus === PaymentStatus.SUCCEEDED,
    );

    // Restore booked slots back to listing availabilities
    const listing = orderListing.listing;
    const bookedSlots = Array.isArray(orderListing.bookedSlots)
      ? orderListing.bookedSlots
      : [];

    if (hasSuccessfulPayment) {
      // Process partial refund through payment service
      const slotsCount = bookedSlots.length > 0 ? bookedSlots.length : 1;
      const refundAmount = orderListing.listing.price * slotsCount;

      await this.paymentService.refundPartialPayment(orderId, refundAmount);
    }

    const availableSlots = (listing.availabilities as any) || [];
    // Add the rejected order's slots back to available slots
    const updatedSlots = [...availableSlots, ...bookedSlots];

    await this.prisma.listing.update({
      where: { id: listing.id },
      data: { availabilities: updatedSlots as any },
    });

    // Update OrderListing status to CANCELLED
    await this.prisma.orderListing.update({
      where: { orderId_listingId: { orderId, listingId } },
      data: { bookingStatus: OrderStatus.CANCELLED },
    });

    // Send rejection email to couple
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: vendorId },
      include: { user: true },
    });

    if (vendor) {
      const wedding = await this.prisma.wedding.findUnique({
        where: { id: order.weddingId },
        include: { mainCouple: { include: { user: true } } },
      });

      if (wedding && wedding.mainCouple.length > 0) {
        const coupleName = wedding.mainCouple
          .map((couple) => couple.user.name)
          .join(' & ');
        const bookedSlots = Array.isArray(orderListing.bookedSlots)
          ? orderListing.bookedSlots
          : [];
        const slotsCount = bookedSlots.length > 0 ? bookedSlots.length : 1;
        const listingPrice = orderListing.listing?.price || 0;
        const totalAmount = listingPrice * slotsCount;
        const amount = `${order.currency} ${totalAmount.toFixed(2)}`;
        const weddingDate = wedding.date
          ? wedding.date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'TBD';

        for (const _couple of wedding.mainCouple) {
          await this.emailService.sendVendorBookingRejectionEmail(
            _couple.user.email,
            coupleName,
            vendor.user.name,
            orderListing.listing.listingName,
            weddingDate,
            amount,
            orderId,
            order.weddingId,
          );
        }
      }
    }

    // Return updated order
    return this.findOne(orderId);
  }

  async vendorCompleteListing(
    orderId: number,
    listingId: number,
    vendorId: number,
  ): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listings: {
          include: {
            listing: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Find the specific OrderListing
    const orderListing = order.listings.find(
      (ol) => ol.listingId === listingId,
    );
    if (!orderListing) {
      throw new NotFoundException(
        `Listing with ID ${listingId} not found in order ${orderId}`,
      );
    }

    // Verify the vendor owns this listing
    if (orderListing.listing.vendorId !== vendorId) {
      throw new BadRequestException('You can only complete your own listings');
    }

    // Validate listing status - can only complete CONFIRMED bookings
    if (orderListing.bookingStatus !== OrderStatus.CONFIRMED) {
      throw new BadRequestException(
        `Listing must be in CONFIRMED status to be completed. Current status: ${orderListing.bookingStatus}`,
      );
    }

    // Validate that ALL booking dates have passed
    const bookedSlots = orderListing.bookedSlots as any[];
    if (bookedSlots && bookedSlots.length > 0) {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today

      for (const slot of bookedSlots) {
        let slotDate: Date | null = null;

        if (slot.date) {
          slotDate = new Date(slot.date);
        } else if (slot.endTime) {
          slotDate = new Date(slot.endTime);
        } else if (slot.startTime) {
          slotDate = new Date(slot.startTime);
        }

        if (slotDate) {
          slotDate.setHours(0, 0, 0, 0);
          if (slotDate >= now) {
            throw new BadRequestException(
              `Cannot complete listing before all booking dates have passed. A booking is scheduled for: ${slotDate.toISOString().split('T')[0]}`,
            );
          }
        }
      }
    }

    // Update OrderListing status to COMPLETED
    await this.prisma.orderListing.update({
      where: { orderId_listingId: { orderId, listingId } },
      data: { bookingStatus: OrderStatus.COMPLETED },
    });

    // Create vendor earning record now that service is completed
    const quantity = bookedSlots ? bookedSlots.length : 1;
    const grossAmount = orderListing.listing.price * quantity;
    const platformFeePercentage = 0.1; // 10% commission on full listed price
    const platformFee = grossAmount * platformFeePercentage;
    const netAmount = grossAmount - platformFee;

    // Check if vendor earning already exists (to avoid duplicates)
    const existingEarning = await this.prisma.vendorEarning.findUnique({
      where: {
        orderId_listingId: {
          orderId: orderId,
          listingId: listingId,
        },
      },
    });

    if (!existingEarning) {
      await this.prisma.vendorEarning.create({
        data: {
          vendorId: orderListing.listing.vendorId,
          orderListingId: `${orderId}-${listingId}`,
          orderId: orderId,
          listingId: listingId,
          grossAmount,
          platformFee,
          netAmount,
          currency: order.currency,
          isPaidOut: false,
        },
      });

      console.log(
        `Created vendor earning for vendor ${orderListing.listing.vendorId}: gross=${grossAmount}, platformFee=${platformFee}, net=${netAmount}`,
      );
    } else {
      console.log(
        `Vendor earning already exists for order ${orderId} listing ${listingId}, skipping creation`,
      );
    }

    // Return updated order
    return this.findOne(orderId);
  }

  async superadminCompleteListing(
    orderId: number,
    listingId: number,
  ): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listings: {
          include: {
            listing: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Find the specific OrderListing
    const orderListing = order.listings.find(
      (ol) => ol.listingId === listingId,
    );
    if (!orderListing) {
      throw new NotFoundException(
        `Listing with ID ${listingId} not found in order ${orderId}`,
      );
    }

    // Validate listing status - can only complete CONFIRMED bookings
    if (orderListing.bookingStatus !== OrderStatus.CONFIRMED) {
      throw new BadRequestException(
        `Listing must be in CONFIRMED status to be completed. Current status: ${orderListing.bookingStatus}`,
      );
    }

    // Validate that ALL booking dates have passed
    const bookedSlots = orderListing.bookedSlots as any[];
    if (bookedSlots && bookedSlots.length > 0) {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today

      for (const slot of bookedSlots) {
        let slotDate: Date | null = null;

        if (slot.date) {
          slotDate = new Date(slot.date);
        } else if (slot.endTime) {
          slotDate = new Date(slot.endTime);
        } else if (slot.startTime) {
          slotDate = new Date(slot.startTime);
        }

        if (slotDate) {
          slotDate.setHours(0, 0, 0, 0);
          if (slotDate >= now) {
            throw new BadRequestException(
              `Cannot complete listing before all booking dates have passed. A booking is scheduled for: ${slotDate.toISOString().split('T')[0]}`,
            );
          }
        }
      }
    }

    // Update OrderListing status to COMPLETED
    await this.prisma.orderListing.update({
      where: { orderId_listingId: { orderId, listingId } },
      data: { bookingStatus: OrderStatus.COMPLETED },
    });

    // Create vendor earning record now that service is completed
    const quantity = bookedSlots ? bookedSlots.length : 1;
    const grossAmount = orderListing.listing.price * quantity;
    const platformFeePercentage = 0.1; // 10% commission on full listed price
    const platformFee = grossAmount * platformFeePercentage;
    const netAmount = grossAmount - platformFee;

    // Check if vendor earning already exists (to avoid duplicates)
    const existingEarning = await this.prisma.vendorEarning.findUnique({
      where: {
        orderId_listingId: {
          orderId: orderId,
          listingId: listingId,
        },
      },
    });

    if (!existingEarning) {
      await this.prisma.vendorEarning.create({
        data: {
          vendorId: orderListing.listing.vendorId,
          orderListingId: `${orderId}-${listingId}`,
          orderId: orderId,
          listingId: listingId,
          grossAmount,
          platformFee,
          netAmount,
          currency: order.currency,
          isPaidOut: false,
        },
      });

      console.log(
        `Created vendor earning for vendor ${orderListing.listing.vendorId}: gross=${grossAmount}, platformFee=${platformFee}, net=${netAmount}`,
      );
    } else {
      console.log(
        `Vendor earning already exists for order ${orderId} listing ${listingId}, skipping creation`,
      );
    }

    // Return updated order
    return this.findOne(orderId);
  }

  toOrderResponseDto(order: any): OrderResponseDto {
    return {
      id: order.id,
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
        bookingStatus: ol.bookingStatus,
      })),
      payments: order.payments,
      status: order.orderStatus,
    };
  }
}
