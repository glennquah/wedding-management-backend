import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { OrderStatus } from '../common/order-status.enum';
import { PaymentStatus } from '../common/payment-status.enum';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutSessionResponseDto } from './dto/checkout-session-response.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-08-27.basil',
    });
  }

  async createCheckoutSession(
    dto: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionResponseDto> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: dto.orderId },
        include: { listings: { include: { listing: true } } },
      });

      if (!order) {
        throw new BadRequestException('Order not found');
      }

      // Create line items for Stripe Checkout
      const lineItems = order.listings.map((orderListing) => {
        const bookedSlots = orderListing.bookedSlots as any[];
        const quantity = bookedSlots ? bookedSlots.length : 1;

        return {
          price_data: {
            currency: order.currency.toLowerCase(),
            product_data: {
              name: orderListing.listing.listingName,
              description: orderListing.listing.remarks || 'Wedding service',
            },
            unit_amount: Math.round(orderListing.listing.price * 100), // Convert to cents
          },
          quantity: quantity,
        };
      });

      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const successUrl =
        dto.successUrl ||
        `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = dto.cancelUrl || `${baseUrl}/payment/cancel`;

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          orderId: dto.orderId.toString(),
        },
      });

      const payment = await this.prisma.payment.create({
        data: {
          stripeCheckoutSessionId: session.id,
          amount: order.totalAmount,
          currency: order.currency,
          paymentStatus: PaymentStatus.PENDING,
          orderId: dto.orderId,
        },
      });

      return {
        url: session.url!,
        sessionId: session.id,
        payment,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new InternalServerErrorException(
        'Failed to create checkout session',
      );
    }
  }

  async getPaymentHistory(orderId: number): Promise<PaymentResponseDto[]> {
    return this.prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async refundPayment(orderId: number): Promise<void> {
    // Find the succeeded payment for this order
    const payment = await this.prisma.payment.findFirst({
      where: {
        orderId,
        paymentStatus: PaymentStatus.SUCCEEDED,
      },
    });

    if (!payment) {
      throw new BadRequestException(
        'No successful payment found for this order',
      );
    }

    if (!payment.stripePaymentIntentId) {
      throw new BadRequestException(
        'Payment intent not found. Cannot process refund.',
      );
    }

    try {
      // Create a full refund in Stripe
      const refund = await this.stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
      });

      // Update payment status to REFUNDED
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { paymentStatus: PaymentStatus.REFUNDED },
      });

      console.log(
        `Successfully refunded payment ${payment.id} for order ${orderId}. Refund ID: ${refund.id}`,
      );
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new InternalServerErrorException('Failed to process refund');
    }
  }

  async refundPartialPayment(orderId: number, amount: number): Promise<void> {
    // Find the succeeded payment for this order
    const payment = await this.prisma.payment.findFirst({
      where: {
        orderId,
        paymentStatus: PaymentStatus.SUCCEEDED,
      },
    });

    if (!payment) {
      throw new BadRequestException(
        'No successful payment found for this order',
      );
    }

    if (!payment.stripePaymentIntentId) {
      throw new BadRequestException(
        'Payment intent not found. Cannot process refund.',
      );
    }

    try {
      // Create a partial refund in Stripe
      const refund = await this.stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: Math.round(amount * 100), // Convert to cents
      });

      // Check if payment is now partially or fully refunded
      const totalRefunded = payment.amount - amount;
      const newStatus =
        totalRefunded > 0
          ? PaymentStatus.PARTIALLY_REFUNDED
          : PaymentStatus.REFUNDED;

      // Update payment status
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { paymentStatus: newStatus },
      });

      console.log(
        `Successfully partially refunded payment ${payment.id} for order ${orderId}. Refund amount: ${amount}, Refund ID: ${refund.id}`,
      );
    } catch (error) {
      console.error('Error processing partial refund:', error);
      throw new InternalServerErrorException(
        'Failed to process partial refund',
      );
    }
  }

  async handleWebhook(
    signature: string,
    payload: Buffer,
  ): Promise<{ received: boolean }> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          break;
        case 'checkout.session.expired':
          await this.handleCheckoutExpired(
            event.data.object as Stripe.Checkout.Session,
          );
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Webhook error:', error);
      throw new BadRequestException('Webhook signature verification failed');
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const payment = await this.prisma.payment.findUnique({
      where: { stripeCheckoutSessionId: session.id },
      include: {
        order: {
          include: {
            listings: true,
          },
        },
      },
    });

    if (payment) {
      // Update payment status to SUCCEEDED
      await this.prisma.payment.update({
        where: { stripeCheckoutSessionId: session.id },
        data: {
          paymentStatus: PaymentStatus.SUCCEEDED,
          stripePaymentIntentId: session.payment_intent as string,
        },
      });

      // Update all OrderListing statuses to PAID
      for (const orderListing of payment.order.listings) {
        await this.prisma.orderListing.update({
          where: {
            orderId_listingId: {
              orderId: payment.orderId,
              listingId: orderListing.listingId,
            },
          },
          data: { bookingStatus: OrderStatus.PAID },
        });
      }
    }
  }

  private async handleCheckoutExpired(session: Stripe.Checkout.Session) {
    const payment = await this.prisma.payment.findUnique({
      where: { stripeCheckoutSessionId: session.id },
      include: {
        order: {
          include: {
            listings: {
              include: {
                listing: true,
              },
            },
          },
        },
      },
    });

    if (payment) {
      // Restore booked slots back to listing availabilities
      for (const orderListing of payment.order.listings) {
        const listing = orderListing.listing;
        const bookedSlots = orderListing.bookedSlots as any;
        const existingSlots = (listing.availabilities as any) || [];
        const updatedAvailabilities = [...existingSlots, ...bookedSlots];

        await this.prisma.listing.update({
          where: { id: listing.id },
          data: { availabilities: updatedAvailabilities as any },
        });
      }

      // Delete the expired order (payment will be cascade deleted)
      await this.prisma.order.delete({
        where: { id: payment.orderId },
      });

      console.log(
        `Cleaned up expired order ${payment.orderId} and restored availability for ${payment.order.listings.length} listings`,
      );
    }
  }
}
