import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { OrderStatus } from '../common/order-status.enum';
import { PaymentStatus } from '../common/payment-status.enum';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CheckoutSessionResponseDto } from './dto/checkout-session-response.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { addDatesToAvailabilities } from '../common/availability.helper';

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
      const lineItems = order.listings.map((orderListing) => ({
        price_data: {
          currency: order.currency.toLowerCase(),
          product_data: {
            name: orderListing.listing.listingName,
            description: orderListing.listing.remarks || 'Wedding service',
          },
          unit_amount: Math.round(orderListing.listing.price * 100), // Convert to cents
        },
        quantity: 1,
      }));

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
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { stripeCheckoutSessionId: session.id },
        data: {
          paymentStatus: PaymentStatus.SUCCEEDED,
          stripePaymentIntentId: session.payment_intent as string,
        },
      });

      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { orderStatus: OrderStatus.PAID },
      });
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
      // Restore booked dates back to listing availabilities
      for (const orderListing of payment.order.listings) {
        const listing = orderListing.listing;
        const bookedDates = orderListing.bookedDates;

        const updatedAvailabilities = addDatesToAvailabilities(
          listing.availabilities,
          bookedDates,
        );

        await this.prisma.listing.update({
          where: { id: listing.id },
          data: { availabilities: updatedAvailabilities },
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
