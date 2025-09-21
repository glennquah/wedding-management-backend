import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';
import { OrderStatus } from '../common/order-status.enum';
import { PaymentMethod } from '../common/payment-method.enum';
import { PaymentStatus } from '../common/payment-status.enum';
import { PrismaService } from '../prisma/prisma.service';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { PaymentIntentResponseDto } from './dto/payment-intent-response.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-08-27.basil',
    });
  }

  async createPaymentIntent(dto: CreatePaymentIntentDto): Promise<PaymentIntentResponseDto> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: dto.orderId },
        include: { listings: true },
      });

      if (!order) {
        throw new BadRequestException('Order not found');
      }

      const paymentMethods = this.getStripePaymentMethods(dto.paymentMethod);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(order.totalAmount * 100), // Convert to cents
        currency: order.currency.toLowerCase(),
        payment_method_types: paymentMethods,
        metadata: {
          orderId: dto.orderId.toString(),
        },
      });

      const payment = await this.prisma.payment.create({
        data: {
          stripePaymentIntentId: paymentIntent.id,
          amount: order.totalAmount,
          currency: order.currency,
          paymentMethod: dto.paymentMethod,
          paymentStatus: PaymentStatus.PENDING,
          orderId: dto.orderId,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        payment,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new InternalServerErrorException('Failed to create payment intent');
    }
  }

  async confirmPayment(dto: ConfirmPaymentDto): Promise<PaymentResponseDto> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(dto.paymentIntentId);

      const payment = await this.prisma.payment.findUnique({
        where: { stripePaymentIntentId: dto.paymentIntentId },
        include: { order: true },
      });

      if (!payment) {
        throw new BadRequestException('Payment not found');
      }

      let status: PaymentStatus;
      switch (paymentIntent.status) {
        case 'succeeded':
          status = PaymentStatus.SUCCEEDED;
          break;
        case 'processing':
          status = PaymentStatus.PROCESSING;
          break;
        case 'requires_payment_method':
        case 'requires_confirmation':
        case 'requires_action':
          status = PaymentStatus.PENDING;
          break;
        case 'canceled':
          status = PaymentStatus.CANCELLED;
          break;
        default:
          status = PaymentStatus.FAILED;
      }

      const updatedPayment = await this.prisma.payment.update({
        where: { stripePaymentIntentId: dto.paymentIntentId },
        data: {
          paymentStatus: status,
          stripeChargeId: paymentIntent.latest_charge as string || null,
        },
      });

      // Update order status if payment succeeded
      if (status === PaymentStatus.SUCCEEDED) {
        await this.prisma.order.update({
          where: { id: payment.orderId },
          data: { orderStatus: OrderStatus.PAID },
        });
      }

      return updatedPayment;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw new InternalServerErrorException('Failed to confirm payment');
    }
  }

  async refundPayment(dto: RefundPaymentDto): Promise<any> {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { stripePaymentIntentId: dto.paymentIntentId },
      });

      if (!payment || payment.paymentStatus !== PaymentStatus.SUCCEEDED) {
        throw new BadRequestException('Payment not found or not eligible for refund');
      }

      const refundAmount = dto.amount || payment.amount;

      const refund = await this.stripe.refunds.create({
        payment_intent: dto.paymentIntentId,
        amount: Math.round(refundAmount * 100), // Convert to cents
      });

      const isPartialRefund = refundAmount < payment.amount;
      const newRefundedAmount = (payment.refundedAmount || 0) + refundAmount;

      await this.prisma.payment.update({
        where: { stripePaymentIntentId: dto.paymentIntentId },
        data: {
          paymentStatus: isPartialRefund ? PaymentStatus.PARTIALLY_REFUNDED : PaymentStatus.REFUNDED,
          refundedAmount: newRefundedAmount,
        },
      });

      return refund;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new InternalServerErrorException('Failed to process refund');
    }
  }

  async getPaymentHistory(orderId: number): Promise<PaymentResponseDto[]> {
    return this.prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private getStripePaymentMethods(paymentMethod: PaymentMethod): string[] {
    switch (paymentMethod) {
      case PaymentMethod.CARD:
        return ['card'];
      case PaymentMethod.GOOGLE_PAY:
        return ['card']; // Google Pay uses card payment method type
      case PaymentMethod.APPLE_PAY:
        return ['card']; // Apple Pay uses card payment method type
      default:
        return ['card'];
    }
  }

  async handleWebhook(signature: string, payload: Buffer): Promise<{ received: boolean }> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
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

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    await this.prisma.payment.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        paymentStatus: PaymentStatus.SUCCEEDED,
        stripeChargeId: paymentIntent.latest_charge as string,
      },
    });

    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (payment) {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { orderStatus: 'paid' },
      });
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    await this.prisma.payment.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        paymentStatus: PaymentStatus.FAILED,
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
      },
    });
  }
}