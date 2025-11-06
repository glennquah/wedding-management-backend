import { PrismaClient } from '@prisma/client';

export async function seedCashGifts(prisma: PrismaClient) {
  console.log('✅ Seeding cash gifts...');

  // Get wedding ID 2 (Glenn & Jes Chan's wedding)
  const wedding = await prisma.wedding.findUnique({
    where: { id: 2 },
  });

  if (!wedding) {
    console.log('⚠️ Wedding ID 2 not found, skipping cash gifts seed');
    return;
  }

  // Get all guests for this wedding
  const guests = await prisma.guest.findMany({
    where: { weddingId: wedding.id },
    orderBy: { id: 'asc' },
  });

  if (guests.length === 0) {
    console.log(
      '⚠️ No guests found for wedding ID 2, skipping cash gifts seed',
    );
    return;
  }

  // Ryan Tang should be the first guest and give the most ($10,000+)
  const ryanTang = guests[0];

  await prisma.cashGift.create({
    data: {
      guestId: ryanTang.id,
      weddingId: wedding.id,
      amount: 10888.88, // Lucky number in Chinese culture
    },
  });

  let totalGiftValue = 10888.88;

  // Distribute gifts among other attended guests (25 guests attended)
  // We want total to be around $20,000-30,000
  const attendedGuests = guests.slice(1, 25); // First 25 guests attended, skip Ryan Tang

  for (const guest of attendedGuests) {
    // Random amounts between $100 and $1500
    const amount = Math.floor(Math.random() * 1400) + 100;

    await prisma.cashGift.create({
      data: {
        guestId: guest.id,
        weddingId: wedding.id,
        amount: amount,
      },
    });

    totalGiftValue += amount;
  }

  console.log(`✅ Created cash gifts for ${attendedGuests.length + 1} guests`);
  console.log(`✅ Total gift value: $${totalGiftValue.toFixed(2)}`);
  console.log(`✅ Ryan Tang gifted the most: $10,888.88`);
}
