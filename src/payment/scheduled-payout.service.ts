import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScheduledPayoutService {
  private readonly logger = new Logger(ScheduledPayoutService.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService,
  ) {}

  // Runs every 3 minutes for testing purposes
  @Cron('*/3 * * * *', {
    name: 'vendor-payouts',
    timeZone: 'Asia/Singapore',
  })
  async handleScheduledPayouts() {
    this.logger.log('Starting scheduled vendor payouts...');

    try {
      // Get all vendors who are eligible for payouts
      const vendors = await this.prisma.vendor.findMany({
        where: {
          stripeConnectAccountId: { not: null },
          stripePayoutsEnabled: true,
        },
      });

      this.logger.log(`Found ${vendors.length} vendors eligible for payouts`);

      let successfulPayouts = 0;
      let failedPayouts = 0;
      let skippedPayouts = 0;

      for (const vendor of vendors) {
        try {
          // Get unpaid earnings for this vendor
          const unpaidEarnings = await this.prisma.vendorEarning.findMany({
            where: {
              vendorId: vendor.userId,
              isPaidOut: false,
            },
          });

          if (unpaidEarnings.length === 0) {
            this.logger.debug(
              `Vendor ${vendor.userId} has no unpaid earnings, skipping`,
            );
            skippedPayouts++;
            continue;
          }

          const totalUnpaid = unpaidEarnings.reduce(
            (sum, e) => sum + e.netAmount,
            0,
          );

          // Minimum payout threshold of $10
          if (totalUnpaid < 10) {
            this.logger.debug(
              `Vendor ${vendor.userId} has ${totalUnpaid} unpaid (below $10 minimum), skipping`,
            );
            skippedPayouts++;
            continue;
          }

          // Create payout
          const payout = await this.paymentService.createVendorPayout({
            vendorId: vendor.userId,
          });

          this.logger.log(
            `Successfully created payout for vendor ${vendor.userId}: ${payout.amount} ${payout.currency}`,
          );
          successfulPayouts++;
        } catch (error) {
          this.logger.error(
            `Failed to create payout for vendor ${vendor.userId}: ${error.message}`,
            error.stack,
          );
          failedPayouts++;
        }
      }

      this.logger.log(
        `Scheduled payout completed - Successful: ${successfulPayouts}, Failed: ${failedPayouts}, Skipped: ${skippedPayouts}`,
      );
    } catch (error) {
      this.logger.error(
        `Error during scheduled payout execution: ${error.message}`,
        error.stack,
      );
    }
  }

  // Manual trigger for testing
  async triggerManualPayout() {
    this.logger.log('Manual payout triggered');
    await this.handleScheduledPayouts();
  }
}
