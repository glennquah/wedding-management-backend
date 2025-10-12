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

  // Generate dates across multiple months for better analytics
  const generateRandomDate = () => {
    const monthsAgo = Math.floor(Math.random() * 12); // 0-11 months ago
    const daysAgo = Math.floor(Math.random() * 30); // Random day within that month
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    date.setDate(date.getDate() - daysAgo);
    return date;
  };

  for (const wedding of weddings) {
    // Create 12-18 orders per wedding (increased from 6-8)
    const orderCount = Math.floor(Math.random() * 7) + 12; // Random number between 12-18
    let totalSpendingForWedding = 0;

    for (let i = 0; i < orderCount; i++) {
      // Randomly select 1-4 listings for this order (increased from 1-3)
      const listingsInOrder = Math.floor(Math.random() * 4) + 1;
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
        // For per-person pricing (catering, makeup), use a random number of guests (50-150)
        if (listing.price < 1000) {
          const guestCount = Math.floor(Math.random() * 101) + 50;
          orderTotal += listing.price * guestCount;
        } else {
          orderTotal += listing.price;
        }
      });

      // Determine order status with better distribution
      // 70% paid, 10% completed, 15% pending, 5% cancelled
      const statusRandom = Math.random();
      let orderStatus: OrderStatus;
      if (statusRandom < 0.7) {
        orderStatus = OrderStatus.PAID;
      } else if (statusRandom < 0.8) {
        orderStatus = OrderStatus.COMPLETED;
      } else if (statusRandom < 0.95) {
        orderStatus = OrderStatus.PENDING;
      } else {
        orderStatus = OrderStatus.CANCELLED;
      }

      // Create the order with date spread across months
      const order = await prisma.order.create({
        data: {
          weddingId: wedding.id,
          totalAmount: orderTotal,
          currency: 'SGD',
          orderStatus,
          remark: `Order ${i + 1} for ${wedding.name}`,
          purchaseDate: generateRandomDate(),
        },
      });

      // Create OrderListing entries with booking status matching order status
      for (const listing of selectedListings) {
        const availabilities = listing.availabilities as any[];
        const randomAvailability =
          availabilities[Math.floor(Math.random() * availabilities.length)];

        await prisma.orderListing.create({
          data: {
            orderId: order.id,
            listingId: listing.id,
            bookedSlots: [randomAvailability],
            bookingStatus: orderStatus, // Match the order status
          },
        });
      }

      // Only add to spending if order is paid or completed
      if (
        orderStatus === OrderStatus.PAID ||
        orderStatus === OrderStatus.COMPLETED
      ) {
        totalSpendingForWedding += orderTotal;
      }
      totalOrders++;
    }

    // Update wedding's currentSpending
    await prisma.wedding.update({
      where: { id: wedding.id },
      data: { currentSpending: totalSpendingForWedding },
    });

    console.log(
      `✅ Created ${orderCount} orders for ${wedding.name} (Total spending: $${totalSpendingForWedding.toFixed(2)})`,
    );
  }

  console.log(`✅ Created total of ${totalOrders} orders across all weddings`);
}
