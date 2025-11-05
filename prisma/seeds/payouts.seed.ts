import { PrismaClient } from '@prisma/client';

export async function seedPayouts(prisma: PrismaClient) {
  console.log('✅ Seeding vendor payouts...');

  // Get all vendors
  const vendors = await prisma.vendor.findMany({
    include: {
      user: true,
    },
  });

  if (vendors.length === 0) {
    console.log('⚠️  No vendors found. Skipping payout seeding.');
    return;
  }

  let totalPayouts = 0;

  // Configuration: Generate payouts for the past 9 months (matching order history)
  const numberOfMonths = 9;
  // Create ONE payout per month per vendor (monthly payout cycle)

  // Payout statuses with realistic distribution
  const payoutStatuses = {
    paid: 0.75, // 75% successfully paid
    pending: 0.15, // 15% pending
    failed: 0.1, // 10% failed
  };

  // Generate a date within a specific month (past)
  const generateDateInMonth = (monthsAgo: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    date.setDate(Math.floor(Math.random() * 28) + 1); // Random day 1-28
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    return date;
  };

  // Determine payout status based on weighted distribution
  const getPayoutStatus = (): string => {
    const random = Math.random();
    if (random < payoutStatuses.paid) return 'paid';
    if (random < payoutStatuses.paid + payoutStatuses.pending) return 'pending';
    return 'failed';
  };

  // Create payouts for each vendor
  for (const vendor of vendors) {
    let vendorPayoutCount = 0;

    // Generate payouts for each month (oldest to newest, skip current month)
    for (let monthIndex = numberOfMonths - 1; monthIndex >= 1; monthIndex--) {
      // Create ONE payout per month
      // Generate payout period covering the entire month
      const periodEnd = generateDateInMonth(monthIndex);
      periodEnd.setDate(28); // End of month (safe value)
      const periodStart = new Date(periodEnd);
      periodStart.setDate(1); // Start of month

      // Check for completed orders FIRST before creating payout
      // Get all listings owned by this vendor
      const vendorListings = await prisma.listing.findMany({
        where: { vendorId: vendor.userId },
        select: { id: true, price: true },
      });

      if (vendorListings.length > 0) {
        // Get paid or completed order listings for this vendor's listings within the period
        const completedOrderListings = await prisma.orderListing.findMany({
          where: {
            listingId: { in: vendorListings.map((l) => l.id) },
            bookingStatus: { in: ['PAID', 'COMPLETED'] },
            createdAt: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
          include: {
            order: true,
            listing: true,
          },
        });

        if (completedOrderListings.length === 0) {
          // Skip creating payout if no completed orders in this period
          continue;
        }

        // Now create the payout since we have orders
        // Determine status
        const status = getPayoutStatus();

        // Generate unique Stripe transfer ID
        const stripeTransferId = `po_${Date.now()}_${vendor.userId}_${vendorPayoutCount}`;

        // For paid payouts, also generate a Stripe payout ID
        const stripePayoutId =
          status === 'paid'
            ? `py_${Date.now()}_${vendor.userId}_${vendorPayoutCount}`
            : null;

        // For failed payouts, add failure reason
        const failureReasons = [
          'Insufficient funds in platform account',
          'Invalid bank account details',
          'Bank account closed',
          'Transfer rejected by bank',
          'Account verification required',
        ];
        const failureReason =
          status === 'failed'
            ? failureReasons[Math.floor(Math.random() * failureReasons.length)]
            : null;

        // Calculate earnings count from actual orders
        const earningsCount = completedOrderListings.length;

        // Create the payout
        const payout = await prisma.vendorPayout.create({
          data: {
            vendorId: vendor.userId,
            stripeTransferId,
            amount: 0, // Will be updated after calculating earnings
            currency: 'SGD',
            status,
            earningsCount,
            periodStart,
            periodEnd,
            stripePayoutId,
            failureReason,
            createdAt: periodEnd, // Payout created at end of period
          },
        });

        // Create earnings from completed order listings
        let totalEarnings = 0;
        const platformFeeRate = 0.1; // 10% platform fee

        for (const orderListing of completedOrderListings) {
          const grossAmount = orderListing.listing.price;
          const platformFee =
            Math.round(grossAmount * platformFeeRate * 100) / 100;
          const netAmount = Math.round((grossAmount - platformFee) * 100) / 100;

          try {
            // Create a unique orderListingId string from orderId and listingId
            const orderListingId = `${orderListing.orderId}-${orderListing.listingId}`;

            await prisma.vendorEarning.create({
              data: {
                vendorId: vendor.userId,
                orderListingId,
                orderId: orderListing.orderId,
                listingId: orderListing.listingId,
                grossAmount,
                platformFee,
                netAmount,
                currency: 'SGD',
                isPaidOut: status === 'paid',
                payoutId: payout.id,
                createdAt: orderListing.createdAt,
              },
            });
            totalEarnings += netAmount;
          } catch (error) {
            // Skip if duplicate (orderId, listingId) combination already exists
            console.log(
              `⚠️  Skipping duplicate earning for order ${orderListing.orderId}, listing ${orderListing.listingId}`,
            );
          }
        }

        // Update payout amount to match actual earnings
        await prisma.vendorPayout.update({
          where: { id: payout.id },
          data: { amount: totalEarnings },
        });

        vendorPayoutCount++;
        totalPayouts++;
      }
    }

    console.log(
      `✅ Created ${vendorPayoutCount} payouts for vendor ${vendor.user.name} (${vendor.userId}) over ${numberOfMonths} months`,
    );
  }

  // Calculate and display summary statistics
  const payoutStats = await prisma.vendorPayout.groupBy({
    by: ['status'],
    _count: { status: true },
    _sum: { amount: true },
  });

  console.log('\n💰 Vendor Payout Summary:');
  for (const stat of payoutStats) {
    console.log(
      `  ${stat.status.toUpperCase()}: ${stat._count.status} payouts, Total: $${(stat._sum.amount || 0).toFixed(2)}`,
    );
  }

  console.log(
    `\n✅ Created total of ${totalPayouts} payouts across ${vendors.length} vendors`,
  );
  console.log(
    `   - Average: ${Math.round(totalPayouts / vendors.length)} payouts per vendor`,
  );
  console.log(`   - Period: Last ${numberOfMonths} months`);
  console.log(`   - Status distribution: 75% paid, 15% pending, 10% failed`);
}
