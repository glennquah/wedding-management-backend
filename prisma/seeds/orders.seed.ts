import { OrderStatus, PrismaClient } from '@prisma/client';

export async function seedOrders(prisma: PrismaClient) {
  console.log('✅ Seeding orders...');

  const weddings = await prisma.wedding.findMany();
  const listings = await prisma.listing.findMany();

  if (listings.length === 0) {
    console.log('⚠️  No listings found. Skipping order seeding.');
    return;
  }

  let totalOrders = 0;

  for (const wedding of weddings) {
    // Create 6-8 orders per wedding
    const orderCount = Math.floor(Math.random() * 3) + 6; // Random number between 6-8
    let totalSpendingForWedding = 0;

    for (let i = 0; i < orderCount; i++) {
      // Randomly select 1-3 listings for this order
      const listingsInOrder = Math.floor(Math.random() * 3) + 1;
      const selectedListings: typeof listings = [];
      const usedIndices = new Set<number>();

      // Select random unique listings
      while (selectedListings.length < listingsInOrder) {
        const randomIndex = Math.floor(Math.random() * listings.length);
        if (!usedIndices.has(randomIndex)) {
          selectedListings.push(listings[randomIndex]);
          usedIndices.add(randomIndex);
        }
      }

      // Calculate total amount for this order
      let orderTotal = 0;
      selectedListings.forEach((listing) => {
        // For per-person pricing (catering), use a random number of guests (50-150)
        if (listing.price < 200) {
          const guestCount = Math.floor(Math.random() * 101) + 50;
          orderTotal += listing.price * guestCount;
        } else {
          orderTotal += listing.price;
        }
      });

      // Determine order status (80% paid, 15% pending, 5% completed)
      const statusRandom = Math.random();
      let orderStatus: OrderStatus;
      if (statusRandom < 0.8) {
        orderStatus = OrderStatus.PAID;
      } else if (statusRandom < 0.95) {
        orderStatus = OrderStatus.PENDING;
      } else {
        orderStatus = OrderStatus.COMPLETED;
      }

      // Create the order
      const order = await prisma.order.create({
        data: {
          weddingId: wedding.id,
          totalAmount: orderTotal,
          currency: 'SGD',
          orderStatus,
          remark: `Order ${i + 1} for ${wedding.name}`,
          purchaseDate: new Date(
            Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
          ), // Random date within last 30 days
        },
      });

      // Create OrderListing entries
      for (const listing of selectedListings) {
        const availabilities = listing.availabilities as any[];
        const randomAvailability =
          availabilities[Math.floor(Math.random() * availabilities.length)];

        await prisma.orderListing.create({
          data: {
            orderId: order.id,
            listingId: listing.id,
            bookedSlots: [randomAvailability],
          },
        });
      }

      totalSpendingForWedding += orderTotal;
      totalOrders++;
    }

    // Update wedding's currentSpending
    await prisma.wedding.update({
      where: { id: wedding.id },
      data: { currentSpending: totalSpendingForWedding },
    });

    console.log(
      `✅ Created ${orderCount} orders for ${wedding.name} (Total: $${totalSpendingForWedding.toFixed(2)})`,
    );
  }

  console.log(`✅ Created total of ${totalOrders} orders across all weddings`);
}
