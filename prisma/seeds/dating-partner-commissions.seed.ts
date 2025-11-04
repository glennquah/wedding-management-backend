import { PrismaClient } from '@prisma/client';

export async function seedDatingPartnerCommissions(prisma: PrismaClient) {
  console.log('✅ Seeding dating partner commissions...');

  // Get all admins (potential dating partners)
  const admins = await prisma.admin.findMany({
    where: {
      isDatingPartnerRegistered: true,
    },
    include: {
      user: true,
    },
  });

  // Get all paid orders with their listings
  const paidOrders = await prisma.order.findMany({
    where: {
      listings: {
        some: {
          bookingStatus: 'PAID',
        },
      },
    },
    include: {
      listings: {
        where: {
          bookingStatus: 'PAID',
        },
        include: {
          listing: true,
        },
      },
    },
  });

  if (admins.length === 0) {
    console.log('⚠️  No dating partner admins found. Skipping commission seeding.');
    return;
  }

  if (paidOrders.length === 0) {
    console.log('⚠️  No paid orders found. Skipping commission seeding.');
    return;
  }

  let totalCommissions = 0;
  const targetCommissions = 20; // Target ~20 commissions

  // Commission statuses with realistic distribution
  const commissionStatuses = {
    succeeded: 0.8, // 80% successfully paid
    pending: 0.15, // 15% pending
    failed: 0.05, // 5% failed
  };

  // Determine commission status based on weighted distribution
  const getCommissionStatus = (): string => {
    const random = Math.random();
    if (random < commissionStatuses.succeeded) return 'succeeded';
    if (random < commissionStatuses.succeeded + commissionStatuses.pending)
      return 'pending';
    return 'failed';
  };

  // Commission rate (typically 5-15%)
  const getCommissionRate = (): number => {
    return (5 + Math.random() * 10) / 100; // 5-15%
  };

  // Create commissions by randomly assigning admins to paid orders
  // Try more attempts to reach target due to potential duplicates
  const maxAttempts = targetCommissions * 3;
  let attempts = 0;

  while (totalCommissions < targetCommissions && attempts < maxAttempts) {
    attempts++;

    // Pick a random admin (dating partner)
    const randomAdmin = admins[Math.floor(Math.random() * admins.length)];

    // Pick a random paid order
    const randomOrder =
      paidOrders[Math.floor(Math.random() * paidOrders.length)];

    // Pick a random listing from the order
    const randomOrderListing =
      randomOrder.listings[
        Math.floor(Math.random() * randomOrder.listings.length)
      ];

    const grossAmount = randomOrderListing.listing.price;
    const commissionRate = getCommissionRate();
    const commissionAmount =
      Math.round(grossAmount * commissionRate * 100) / 100;

    const status = getCommissionStatus();

    // Generate unique Stripe transfer ID for succeeded commissions
    const stripeTransferId =
      status === 'succeeded'
        ? `tr_dp_${Date.now()}_${randomAdmin.userId}_${totalCommissions}`
        : null;

    // For failed commissions, add failure reason
    const failureReasons = [
      'Partner account not verified',
      'Invalid partner Stripe account',
      'Commission threshold not met',
      'Transfer rejected by bank',
      'Account temporarily suspended',
    ];
    const failureReason =
      status === 'failed'
        ? failureReasons[Math.floor(Math.random() * failureReasons.length)]
        : null;

    // Create the dating partner commission
    try {
      await prisma.datingPartnerCommission.create({
        data: {
          adminId: randomAdmin.userId,
          orderId: randomOrder.id,
          listingId: randomOrderListing.listingId,
          grossAmount,
          commissionRate,
          commissionAmount,
          currency: 'SGD',
          status,
          stripeTransferId,
          failureReason,
        },
      });

      totalCommissions++;
    } catch (error) {
      // Skip if duplicate (orderId, listingId) combination - will retry
      if (attempts % 10 === 0) {
        console.log(
          `⚠️  Attempt ${attempts}: ${totalCommissions}/${targetCommissions} commissions created so far`,
        );
      }
    }
  }

  // Calculate and display summary statistics
  const commissionStats = await prisma.datingPartnerCommission.groupBy({
    by: ['status'],
    _count: { status: true },
    _sum: { commissionAmount: true },
  });

  console.log('\n💰 Dating Partner Commission Summary:');
  for (const stat of commissionStats) {
    console.log(
      `  ${stat.status.toUpperCase()}: ${stat._count.status} commissions, Total: $${(stat._sum.commissionAmount || 0).toFixed(2)}`,
    );
  }

  console.log(
    `\n✅ Created total of ${totalCommissions} dating partner commissions`,
  );
  console.log(
    `   - Status distribution: 80% succeeded, 15% pending, 5% failed`,
  );
}
