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
import {
  StripeConnectAccountResponseDto,
  StripeAccountStatusDto,
} from '../vendor/dto/stripe-connect.dto';
import {
  VendorEarningResponseDto,
  VendorEarningsSummaryDto,
} from './dto/vendor-earning-response.dto';
import {
  VendorPayoutResponseDto,
  CreatePayoutDto,
  BatchPayoutDto,
  BatchPayoutResultDto,
  PayoutResultDto,
} from './dto/vendor-payout-response.dto';

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

      // Filter listings if listingIds are provided
      let listingsToCharge = order.listings;
      if (dto.listingIds && dto.listingIds.length > 0) {
        // Convert string IDs to numbers for comparison
        const numericListingIds = dto.listingIds.map((id) => Number(id));
        listingsToCharge = order.listings.filter((orderListing) =>
          numericListingIds.includes(orderListing.listingId),
        );

        if (listingsToCharge.length === 0) {
          throw new BadRequestException(
            'No valid listings found with the provided listing IDs',
          );
        }
      }

      // Create line items for Stripe Checkout
      const lineItems = listingsToCharge.map((orderListing) => {
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

      // Calculate the total amount for the listings being charged
      const chargeAmount = listingsToCharge.reduce((sum, orderListing) => {
        const bookedSlots = orderListing.bookedSlots as any[];
        const quantity = bookedSlots ? bookedSlots.length : 1;
        return sum + orderListing.listing.price * quantity;
      }, 0);

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
          listingIds: dto.listingIds ? JSON.stringify(dto.listingIds) : '',
        },
      });

      const payment = await this.prisma.payment.create({
        data: {
          stripeCheckoutSessionId: session.id,
          amount: chargeAmount,
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
        case 'account.updated':
          await this.handleAccountUpdated(event.data.object as Stripe.Account);
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
      // Update payment status to SUCCEEDED
      await this.prisma.payment.update({
        where: { stripeCheckoutSessionId: session.id },
        data: {
          paymentStatus: PaymentStatus.SUCCEEDED,
          stripePaymentIntentId: session.payment_intent as string,
        },
      });

      // Get listing IDs from metadata (if specific listings were paid for)
      const listingIdsMetadata = session.metadata?.listingIds;
      let listingIdsToPay: number[] = [];

      console.log('Stripe session metadata:', session.metadata);
      console.log('listingIdsMetadata:', listingIdsMetadata);

      if (listingIdsMetadata && listingIdsMetadata.trim() !== '') {
        try {
          const parsed = JSON.parse(listingIdsMetadata);
          listingIdsToPay = Array.isArray(parsed)
            ? parsed.map((id) => Number(id))
            : [];
        } catch (error) {
          console.error('Error parsing listingIds from metadata:', error);
          // If parsing fails, pay for all listings
          listingIdsToPay = payment.order.listings.map((ol) => ol.listingId);
        }
      } else {
        listingIdsToPay = payment.order.listings.map((ol) => ol.listingId);
      }

      // Update OrderListing statuses to PAID only for the paid listings
      // AND create vendor earnings records
      for (const orderListing of payment.order.listings) {
        console.log(
          `Checking listing ${orderListing.listingId} against listingIdsToPay:`,
          listingIdsToPay,
        );
        if (listingIdsToPay.includes(orderListing.listingId)) {
          console.log(
            `Updating OrderListing ${orderListing.listingId} to PAID status`,
          );
          await this.prisma.orderListing.update({
            where: {
              orderId_listingId: {
                orderId: payment.orderId,
                listingId: orderListing.listingId,
              },
            },
            data: { bookingStatus: OrderStatus.PAID },
          });

          // Calculate vendor earnings with 5% platform fee
          const bookedSlots = orderListing.bookedSlots as any[];
          const quantity = bookedSlots ? bookedSlots.length : 1;
          const grossAmount = orderListing.listing.price * quantity;
          const platformFeePercentage = 0.05; // 5%
          const platformFee = grossAmount * platformFeePercentage;
          const netAmount = grossAmount - platformFee;

          // Get vendor ID from listing
          const listing = await this.prisma.listing.findUnique({
            where: { id: orderListing.listingId },
            select: { vendorId: true },
          });

          if (listing?.vendorId) {
            // Create vendor earning record
            await this.prisma.vendorEarning.create({
              data: {
                vendorId: listing.vendorId,
                orderListingId: `${payment.orderId}-${orderListing.listingId}`,
                orderId: payment.orderId,
                listingId: orderListing.listingId,
                grossAmount,
                platformFee,
                netAmount,
                currency: payment.currency,
                isPaidOut: false,
              },
            });

            console.log(
              `Created vendor earning for vendor ${listing.vendorId}: gross=${grossAmount}, platformFee=${platformFee}, net=${netAmount}`,
            );
          }
        } else {
          console.log(`Skipping listing ${orderListing.listingId}`);
        }
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

  async createConnectAccount(
    email: string,
    vendorId: number,
  ): Promise<StripeConnectAccountResponseDto> {
    try {
      // Create the Stripe Connect Express account
      const account = await this.stripe.accounts.create({
        type: 'express',
        email: email,
        country: 'SG', // Singapore
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual', // Can be 'individual' or 'company'
        metadata: {
          vendorId: vendorId.toString(),
        },
      });

      // Generate onboarding link
      const accountLink = await this.createAccountLink(account.id);

      // Update vendor with Stripe account ID
      await this.prisma.vendor.update({
        where: { userId: vendorId },
        data: {
          stripeConnectAccountId: account.id,
        },
      });

      console.log(
        `Created Stripe Connect account ${account.id} for vendor ${vendorId}`,
      );

      return {
        accountId: account.id,
        accountLinkUrl: accountLink.url,
        expiresAt: new Date(accountLink.expires_at * 1000).toISOString(),
      };
    } catch (error) {
      console.error('Error creating Stripe Connect account:', error);
      throw new InternalServerErrorException(
        'Failed to create Stripe Connect account',
      );
    }
  }

  async createAccountLink(accountId: string): Promise<Stripe.AccountLink> {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      const accountLink = await this.stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${baseUrl}/vendor/stripe-connect/refresh`,
        return_url: `${baseUrl}/vendor/stripe-connect/complete`,
        type: 'account_onboarding',
      });

      return accountLink;
    } catch (error) {
      console.error('Error creating account link:', error);
      throw new InternalServerErrorException('Failed to create account link');
    }
  }

  async getAccountStatus(accountId: string): Promise<StripeAccountStatusDto> {
    try {
      const account = await this.stripe.accounts.retrieve(accountId);

      return {
        accountId: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        onboardingComplete:
          account.charges_enabled &&
          account.payouts_enabled &&
          account.details_submitted,
        requirements: account.requirements
          ? {
              currently_due: account.requirements.currently_due || [],
              eventually_due: account.requirements.eventually_due || [],
              past_due: account.requirements.past_due || [],
            }
          : undefined,
      };
    } catch (error) {
      console.error('Error retrieving account status:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve account status',
      );
    }
  }

  async syncVendorStripeStatus(vendorId: number): Promise<void> {
    try {
      const vendor = await this.prisma.vendor.findUnique({
        where: { userId: vendorId },
      });

      if (!vendor?.stripeConnectAccountId) {
        throw new BadRequestException('Vendor does not have a Stripe account');
      }

      const accountStatus = await this.getAccountStatus(
        vendor.stripeConnectAccountId,
      );

      // Update vendor with latest Stripe status
      await this.prisma.vendor.update({
        where: { userId: vendorId },
        data: {
          stripeChargesEnabled: accountStatus.chargesEnabled,
          stripePayoutsEnabled: accountStatus.payoutsEnabled,
          stripeDetailsSubmitted: accountStatus.detailsSubmitted,
          stripeAccountOnboardingComplete: accountStatus.onboardingComplete,
        },
      });

      console.log(`Synced Stripe status for vendor ${vendorId}`);
    } catch (error) {
      console.error('Error syncing vendor Stripe status:', error);
      throw new InternalServerErrorException(
        'Failed to sync vendor Stripe status',
      );
    }
  }

  private async handleAccountUpdated(account: Stripe.Account) {
    try {
      const vendorId = account.metadata?.vendorId;
      if (!vendorId) {
        console.log(
          `Account ${account.id} has no vendorId metadata, skipping update`,
        );
        return;
      }

      // Update vendor with latest account status
      await this.prisma.vendor.update({
        where: { userId: parseInt(vendorId) },
        data: {
          stripeChargesEnabled: account.charges_enabled,
          stripePayoutsEnabled: account.payouts_enabled,
          stripeDetailsSubmitted: account.details_submitted,
          stripeAccountOnboardingComplete:
            account.charges_enabled &&
            account.payouts_enabled &&
            account.details_submitted,
        },
      });

      console.log(`Updated Stripe account status for vendor ${vendorId}`);
    } catch (error) {
      console.error('Error handling account update:', error);
    }
  }

  async getVendorEarnings(vendorId: number): Promise<VendorEarningResponseDto[]> {
    return this.prisma.vendorEarning.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getVendorEarningsSummary(vendorId: number): Promise<VendorEarningsSummaryDto> {
    const earnings = await this.prisma.vendorEarning.findMany({
      where: { vendorId },
    });

    const totalGrossAmount = earnings.reduce((sum, e) => sum + e.grossAmount, 0);
    const totalPlatformFee = earnings.reduce((sum, e) => sum + e.platformFee, 0);
    const totalNetAmount = earnings.reduce((sum, e) => sum + e.netAmount, 0);

    const paidOutEarnings = earnings.filter((e) => e.isPaidOut);
    const pendingEarnings = earnings.filter((e) => !e.isPaidOut);

    const paidOutAmount = paidOutEarnings.reduce((sum, e) => sum + e.netAmount, 0);
    const pendingAmount = pendingEarnings.reduce((sum, e) => sum + e.netAmount, 0);

    return {
      vendorId,
      totalGrossAmount,
      totalPlatformFee,
      totalNetAmount,
      paidOutAmount,
      pendingAmount,
      currency: earnings[0]?.currency || 'SGD',
      totalBookings: earnings.length,
      paidBookings: paidOutEarnings.length,
      pendingBookings: pendingEarnings.length,
    };
  }

  async getVendorPayouts(vendorId: number): Promise<VendorPayoutResponseDto[]> {
    return this.prisma.vendorPayout.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createVendorPayout(dto: CreatePayoutDto): Promise<VendorPayoutResponseDto> {
    const { vendorId, periodStart, periodEnd } = dto;

    // Get vendor with Stripe account info
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: vendorId },
    });

    if (!vendor) {
      throw new BadRequestException('Vendor not found');
    }

    if (!vendor.stripeConnectAccountId) {
      throw new BadRequestException('Vendor does not have a Stripe Connect account');
    }

    if (!vendor.stripePayoutsEnabled) {
      throw new BadRequestException(
        'Vendor Stripe account is not ready for payouts. Please ensure KYC is completed.',
      );
    }

    // Determine period
    const lastPayout = await this.prisma.vendorPayout.findFirst({
      where: { vendorId },
      orderBy: { periodEnd: 'desc' },
    });

    const start = periodStart || lastPayout?.periodEnd || new Date(0);
    const end = periodEnd || new Date();

    // Get unpaid earnings within the period
    const unpaidEarnings = await this.prisma.vendorEarning.findMany({
      where: {
        vendorId,
        isPaidOut: false,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    if (unpaidEarnings.length === 0) {
      throw new BadRequestException('No unpaid earnings found for this period');
    }

    // Calculate total payout amount
    const totalAmount = unpaidEarnings.reduce((sum, e) => sum + e.netAmount, 0);
    const currency = unpaidEarnings[0].currency;

    try {
      // Create Stripe Transfer to vendor's Connect account
      const transfer = await this.stripe.transfers.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        destination: vendor.stripeConnectAccountId,
        description: `Payout for period ${start.toISOString()} to ${end.toISOString()}`,
        metadata: {
          vendorId: vendorId.toString(),
          earningsCount: unpaidEarnings.length.toString(),
          periodStart: start.toISOString(),
          periodEnd: end.toISOString(),
        },
      });

      // Create payout record
      const payout = await this.prisma.vendorPayout.create({
        data: {
          vendorId,
          stripeTransferId: transfer.id,
          amount: totalAmount,
          currency,
          status: 'paid',
          earningsCount: unpaidEarnings.length,
          periodStart: start,
          periodEnd: end,
        },
      });

      // Mark earnings as paid out
      await this.prisma.vendorEarning.updateMany({
        where: {
          id: { in: unpaidEarnings.map((e) => e.id) },
        },
        data: {
          isPaidOut: true,
          payoutId: payout.id,
        },
      });

      console.log(
        `Created payout ${payout.id} for vendor ${vendorId}: ${totalAmount} ${currency}`,
      );

      return payout;
    } catch (error) {
      console.error('Error creating vendor payout:', error);
      throw new InternalServerErrorException(
        `Failed to create payout: ${error.message}`,
      );
    }
  }

  async createBatchPayouts(dto: BatchPayoutDto): Promise<BatchPayoutResultDto> {
    const {
      vendorIds,
      periodStart,
      periodEnd,
      minimumPayoutAmount = 10,
    } = dto;

    // Get vendors to pay out
    let vendorsQuery: any = {
      stripeConnectAccountId: { not: null },
      stripePayoutsEnabled: true,
    };

    if (vendorIds && vendorIds.length > 0) {
      vendorsQuery.userId = { in: vendorIds };
    }

    const vendors = await this.prisma.vendor.findMany({
      where: vendorsQuery,
    });

    const results: PayoutResultDto[] = [];
    let totalAmountPaidOut = 0;
    let successfulPayouts = 0;
    let failedPayouts = 0;

    for (const vendor of vendors) {
      try {
        // Check if vendor has enough unpaid earnings
        const unpaidEarnings = await this.prisma.vendorEarning.findMany({
          where: {
            vendorId: vendor.userId,
            isPaidOut: false,
            ...(periodStart && { createdAt: { gte: periodStart } }),
            ...(periodEnd && { createdAt: { lte: periodEnd } }),
          },
        });

        const totalUnpaid = unpaidEarnings.reduce(
          (sum, e) => sum + e.netAmount,
          0,
        );

        if (totalUnpaid < minimumPayoutAmount) {
          results.push({
            success: false,
            vendorId: vendor.userId,
            error: `Unpaid amount (${totalUnpaid}) is below minimum (${minimumPayoutAmount})`,
          });
          failedPayouts++;
          continue;
        }

        // Create payout
        const payout = await this.createVendorPayout({
          vendorId: vendor.userId,
          periodStart,
          periodEnd,
        });

        results.push({
          success: true,
          vendorId: vendor.userId,
          payout,
        });

        totalAmountPaidOut += payout.amount;
        successfulPayouts++;
      } catch (error) {
        results.push({
          success: false,
          vendorId: vendor.userId,
          error: error.message,
        });
        failedPayouts++;
      }
    }

    return {
      totalVendors: vendors.length,
      successfulPayouts,
      failedPayouts,
      results,
      totalAmountPaidOut,
      currency: 'SGD',
    };
  }
}
