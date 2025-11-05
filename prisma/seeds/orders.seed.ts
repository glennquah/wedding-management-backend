import { OrderStatus, PrismaClient } from '@prisma/client';

export async function seedOrders(prisma: PrismaClient) {
  console.log('✅ Seeding orders...');

  const weddings = await prisma.wedding.findMany();
  const vendors = await prisma.vendor.findMany();

  if (weddings.length === 0) {
    console.log('⚠️  No weddings found. Skipping order seeding.');
    return;
  }

  if (vendors.length === 0) {
    console.log('⚠️  No vendors found. Skipping order seeding.');
    return;
  }

  let totalOrders = 0;
  const weddingSpending = new Map<number, number>();
  const weddingBudgetLimits = new Map<number, number>();

  // Initialize wedding spending tracker and budget limits (80% of allocated budget)
  weddings.forEach((wedding) => {
    weddingSpending.set(wedding.id, 0);
    weddingBudgetLimits.set(wedding.id, wedding.allocatedBudget * 0.8);
  });

  // Configuration: Orders increase from 4/month to 14/month over 9 months (~90 orders per vendor)
  const numberOfMonths = 9;
  const minOrdersPerMonth = 4;
  const maxOrdersPerMonth = 14;

  // Calculate how many orders for a given month (increases over time)
  const getOrdersForMonth = (monthsAgo: number) => {
    // Most recent month (monthsAgo=0) gets maxOrdersPerMonth
    // Oldest month (monthsAgo=8) gets minOrdersPerMonth
    const progressRatio =
      (numberOfMonths - 1 - monthsAgo) / (numberOfMonths - 1);
    const ordersThisMonth = Math.round(
      minOrdersPerMonth +
        progressRatio * (maxOrdersPerMonth - minOrdersPerMonth),
    );
    return ordersThisMonth;
  };

  // Generate date within a specific month (past)
  const _generateDateInMonth = (monthsAgo: number) => {
    const daysAgo = Math.floor(Math.random() * 28) + 1; // 1-28 days
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    date.setDate(daysAgo);
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    return date;
  };

  // Generate date within a specific future month
  const generateFutureDateInMonth = (monthsAhead: number) => {
    const daysAhead = Math.floor(Math.random() * 28) + 1; // 1-28 days
    const date = new Date();
    date.setMonth(date.getMonth() + monthsAhead);
    date.setDate(daysAhead);
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    return date;
  };

  // Calculate revenue multiplier based on month (shows growth over time)
  const getRevenueMultiplier = (monthsAgo: number) => {
    // Older months have lower revenue per order, recent months have higher
    // 9 months ago: 0.7x, current month: 1.2x (linear growth)
    const maxMonths = numberOfMonths - 1;
    const growthFactor = (maxMonths - monthsAgo) / maxMonths;
    return 0.7 + growthFactor * 0.5; // Range: 0.7x to 1.2x
  };

  // Create orders for each vendor
  for (const vendor of vendors) {
    const vendorListings = await prisma.listing.findMany({
      where: { vendorId: vendor.userId },
    });

    if (vendorListings.length === 0) {
      console.log(`⚠️  No listings found for vendor ${vendor.userId}`);
      continue;
    }

    let vendorOrderCount = 0;

    // Create orders month by month (oldest to newest)
    for (let monthIndex = numberOfMonths - 1; monthIndex >= 0; monthIndex--) {
      const ordersThisMonth = getOrdersForMonth(monthIndex);
      const revenueMultiplier = getRevenueMultiplier(monthIndex);

      // Create orders for this month (number increases over time)
      for (
        let orderInMonth = 0;
        orderInMonth < ordersThisMonth;
        orderInMonth++
      ) {
        // Randomly select 1-3 listings from this vendor
        const listingsInOrder = Math.min(
          Math.floor(Math.random() * 3) + 1,
          vendorListings.length,
        );
        const selectedListings: typeof vendorListings = [];
        const usedIndices = new Set<number>();

        while (selectedListings.length < listingsInOrder) {
          const randomIndex = Math.floor(Math.random() * vendorListings.length);
          if (!usedIndices.has(randomIndex)) {
            selectedListings.push(vendorListings[randomIndex]);
            usedIndices.add(randomIndex);
          }
        }

        // Calculate base order total
        let baseOrderTotal = 0;
        selectedListings.forEach((listing) => {
          // For per-person pricing (catering, makeup), use a random number of guests (50-150)
          if (listing.price < 1000) {
            const guestCount = Math.floor(Math.random() * 101) + 50;
            baseOrderTotal += listing.price * guestCount;
          } else {
            baseOrderTotal += listing.price;
          }
        });

        // Apply growth multiplier to show increasing revenue over time
        const orderTotal = Math.round(baseOrderTotal * revenueMultiplier);

        // Determine order status with better distribution
        // 70% paid, 20% completed, 8% pending, 2% cancelled
        const statusRandom = Math.random();
        let orderStatus: OrderStatus;
        if (statusRandom < 0.7) {
          orderStatus = OrderStatus.PAID;
        } else if (statusRandom < 0.9) {
          orderStatus = OrderStatus.COMPLETED;
        } else if (statusRandom < 0.98) {
          orderStatus = OrderStatus.PENDING;
        } else {
          orderStatus = OrderStatus.CANCELLED;
        }

        // Find a wedding that has enough budget remaining
        // Shuffle weddings to get random distribution
        const shuffledWeddings = [...weddings].sort(() => Math.random() - 0.5);
        let selectedWedding = null;

        for (const wedding of shuffledWeddings) {
          const currentSpending = weddingSpending.get(wedding.id) || 0;
          const budgetLimit = weddingBudgetLimits.get(wedding.id) || 0;

          // For paid/completed orders, check if wedding has budget remaining
          if (
            orderStatus === OrderStatus.PAID ||
            orderStatus === OrderStatus.COMPLETED
          ) {
            if (currentSpending + orderTotal <= budgetLimit) {
              selectedWedding = wedding;
              break;
            }
          } else {
            // For pending/cancelled orders, always allow (they don't count towards spending)
            selectedWedding = wedding;
            break;
          }
        }

        // Skip this order if no wedding has budget remaining
        if (!selectedWedding) {
          continue;
        }

        // Select availability slot first to ensure purchase date is before the booked date
        const firstListing = selectedListings[0];
        const availabilities = firstListing.availabilities as any[];
        const randomAvailability =
          availabilities[Math.floor(Math.random() * availabilities.length)];

        // Parse the availability date
        const bookedDate = new Date(randomAvailability.date);

        // Generate purchase date: 1-60 days before the booked date
        const daysBeforeBooking = Math.floor(Math.random() * 60) + 1; // 1-60 days
        const purchaseDate = new Date(bookedDate);
        purchaseDate.setDate(purchaseDate.getDate() - daysBeforeBooking);
        purchaseDate.setHours(Math.floor(Math.random() * 24));
        purchaseDate.setMinutes(Math.floor(Math.random() * 60));

        // Create the order with purchase date before booked date
        const order = await prisma.order.create({
          data: {
            weddingId: selectedWedding.id,
            totalAmount: orderTotal,
            currency: 'SGD',
            orderStatus,
            remark: `Order for vendor ${vendor.userId} - Month ${numberOfMonths - monthIndex}`,
            purchaseDate: purchaseDate,
            createdAt: purchaseDate, // Set createdAt to match purchaseDate for realistic data
          },
        });

        // Create OrderListing entries with booking status matching order status
        for (const listing of selectedListings) {
          const listingAvailabilities = listing.availabilities as any[];
          const selectedAvailability =
            listingAvailabilities[
              Math.floor(Math.random() * listingAvailabilities.length)
            ];

          await prisma.orderListing.create({
            data: {
              orderId: order.id,
              listingId: listing.id,
              bookedSlots: [selectedAvailability],
              bookingStatus: orderStatus, // Match the order status
              createdAt: purchaseDate, // Set createdAt to match order purchaseDate
            },
          });
        }

        // Only add to spending if order is paid or completed
        if (
          orderStatus === OrderStatus.PAID ||
          orderStatus === OrderStatus.COMPLETED
        ) {
          const currentSpending = weddingSpending.get(selectedWedding.id) || 0;
          weddingSpending.set(selectedWedding.id, currentSpending + orderTotal);
        }

        vendorOrderCount++;
        totalOrders++;
      }
    }

    console.log(
      `✅ Created ${vendorOrderCount} orders for vendor ${vendor.userId} (${minOrdersPerMonth}-${maxOrdersPerMonth} orders/month, increasing over ${numberOfMonths} months)`,
    );
  }

  // Create future orders (3-6 months ahead) for upcoming events
  console.log('\n✅ Creating future orders...');
  const futureMonthsRange = [1, 2, 3, 4, 5, 6]; // 1-6 months in the future
  const futureOrdersPerMonth = 2; // 2 orders per month for future dates

  for (const vendor of vendors) {
    const vendorListings = await prisma.listing.findMany({
      where: { vendorId: vendor.userId },
    });

    if (vendorListings.length === 0) continue;

    let futureOrderCount = 0;

    for (const monthsAhead of futureMonthsRange) {
      for (let i = 0; i < futureOrdersPerMonth; i++) {
        // Randomly select 1-2 listings for future orders
        const listingsInOrder = Math.min(
          Math.floor(Math.random() * 2) + 1,
          vendorListings.length,
        );
        const selectedListings: typeof vendorListings = [];
        const usedIndices = new Set<number>();

        while (selectedListings.length < listingsInOrder) {
          const randomIndex = Math.floor(Math.random() * vendorListings.length);
          if (!usedIndices.has(randomIndex)) {
            selectedListings.push(vendorListings[randomIndex]);
            usedIndices.add(randomIndex);
          }
        }

        // Calculate order total
        let baseOrderTotal = 0;
        selectedListings.forEach((listing) => {
          if (listing.price < 1000) {
            const guestCount = Math.floor(Math.random() * 101) + 50;
            baseOrderTotal += listing.price * guestCount;
          } else {
            baseOrderTotal += listing.price;
          }
        });

        const orderTotal = Math.round(baseOrderTotal * 1.1); // Slight premium for future

        // Future orders are mostly PENDING or PAID (not COMPLETED)
        const statusRandom = Math.random();
        let orderStatus: OrderStatus;
        if (statusRandom < 0.6) {
          orderStatus = OrderStatus.PAID;
        } else if (statusRandom < 0.95) {
          orderStatus = OrderStatus.PENDING;
        } else {
          orderStatus = OrderStatus.CANCELLED;
        }

        // Select random wedding
        const shuffledWeddings = [...weddings].sort(() => Math.random() - 0.5);
        let selectedWedding = null;

        for (const wedding of shuffledWeddings) {
          const currentSpending = weddingSpending.get(wedding.id) || 0;
          const budgetLimit = weddingBudgetLimits.get(wedding.id) || 0;

          // For paid orders, check budget
          if (orderStatus === OrderStatus.PAID) {
            if (currentSpending + orderTotal <= budgetLimit) {
              selectedWedding = wedding;
              break;
            }
          } else {
            // For pending/cancelled, always allow
            selectedWedding = wedding;
            break;
          }
        }

        if (!selectedWedding) continue;

        // Select a future date for the booking
        const futureBookingDate = generateFutureDateInMonth(monthsAhead);

        // Generate purchase date: 1-30 days before the future booking date (but not in the past)
        const daysBeforeBooking = Math.floor(Math.random() * 30) + 1; // 1-30 days
        const purchaseDate = new Date(futureBookingDate);
        purchaseDate.setDate(purchaseDate.getDate() - daysBeforeBooking);
        purchaseDate.setHours(Math.floor(Math.random() * 24));
        purchaseDate.setMinutes(Math.floor(Math.random() * 60));

        // Ensure purchase date is not in the past
        const now = new Date();
        const finalPurchaseDate = purchaseDate < now ? now : purchaseDate;

        // Create future order
        const order = await prisma.order.create({
          data: {
            weddingId: selectedWedding.id,
            totalAmount: orderTotal,
            currency: 'SGD',
            orderStatus,
            remark: `Upcoming order for vendor ${vendor.userId} - ${monthsAhead} months ahead`,
            purchaseDate: finalPurchaseDate,
            createdAt: finalPurchaseDate, // Set createdAt to match purchaseDate
          },
        });

        // Create OrderListing entries with future dates
        for (const listing of selectedListings) {
          const availabilities = listing.availabilities as any[];
          const randomAvailability =
            availabilities[Math.floor(Math.random() * availabilities.length)];

          // Create a future date slot based on the availability
          const futureSlot = {
            ...randomAvailability,
            date: futureBookingDate.toISOString().split('T')[0],
          };

          await prisma.orderListing.create({
            data: {
              orderId: order.id,
              listingId: listing.id,
              bookedSlots: [futureSlot],
              bookingStatus: orderStatus,
              createdAt: finalPurchaseDate, // Set createdAt to match order purchaseDate
            },
          });
        }

        // Only add to spending if paid
        if (orderStatus === OrderStatus.PAID) {
          const currentSpending = weddingSpending.get(selectedWedding.id) || 0;
          weddingSpending.set(selectedWedding.id, currentSpending + orderTotal);
        }

        futureOrderCount++;
        totalOrders++;
      }
    }

    if (futureOrderCount > 0) {
      console.log(
        `✅ Created ${futureOrderCount} future orders for vendor ${vendor.userId}`,
      );
    }
  }

  // Update all weddings' currentSpending and log budget usage
  console.log('\n💰 Wedding Budget Summary:');
  for (const [weddingId, spending] of weddingSpending.entries()) {
    const wedding = weddings.find((w) => w.id === weddingId);
    const budgetLimit = weddingBudgetLimits.get(weddingId) || 0;
    const percentageUsed = ((spending / budgetLimit) * 100).toFixed(1);

    await prisma.wedding.update({
      where: { id: weddingId },
      data: { currentSpending: spending },
    });

    console.log(
      `  ${wedding?.name}: $${spending.toFixed(2)} / $${budgetLimit.toFixed(2)} (${percentageUsed}%)`,
    );
  }

  console.log(
    `\n✅ Created total of ${totalOrders} orders (avg ${Math.floor(totalOrders / vendors.length)} per vendor)`,
  );
  console.log('   - Past orders: Historical data from last 9 months');
  console.log('   - Future orders: Upcoming events 1-6 months ahead');
}
