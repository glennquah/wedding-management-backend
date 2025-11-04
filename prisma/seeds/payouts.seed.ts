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

  // Configuration: Generate payouts for the past 6 months
  const numberOfMonths = 6;
  const payoutsPerVendorPerMonth = [2, 3]; // Each vendor gets 2-3 payouts per month

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

    // Generate payouts for each month (oldest to newest)
    for (let monthIndex = numberOfMonths - 1; monthIndex >= 0; monthIndex--) {
      // Random number of payouts this month (2-3)
      const payoutsThisMonth =
        payoutsPerVendorPerMonth[0] +
        Math.floor(
          Math.random() *
            (payoutsPerVendorPerMonth[1] - payoutsPerVendorPerMonth[0] + 1),
        );

      for (let payoutIndex = 0; payoutIndex < payoutsThisMonth; payoutIndex++) {
        // Generate payout period (typically 7-14 days)
        const periodDays = 7 + Math.floor(Math.random() * 8); // 7-14 days
        const periodEnd = generateDateInMonth(monthIndex);
        const periodStart = new Date(periodEnd);
        periodStart.setDate(periodStart.getDate() - periodDays);

        // Generate payout amount (realistic range: $500 - $5000)
        const amount = Math.round((500 + Math.random() * 4500) * 100) / 100;

        // Earnings count (number of orders included in this payout)
        const earningsCount = Math.floor(Math.random() * 8) + 3; // 3-10 orders

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

        // Create the payout
        await prisma.vendorPayout.create({
          data: {
            vendorId: vendor.userId,
            stripeTransferId,
            amount,
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
