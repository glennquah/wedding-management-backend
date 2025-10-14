import { faker } from '@faker-js/faker';
import {
  BudgetBucket,
  GuestCountBucket,
  PrismaClient,
  WeddingService
} from '@prisma/client';

export async function seedRecommendationOrders(prisma: PrismaClient) {
  // Set deterministic seed for consistent data generation across runs
  faker.seed(6767);

  console.log('✅ Seeding recommendation orders with intelligent booking rules...');

  // Budget bucket mapping (±1 bucket)
  const budgetToPriceRanges: Record<BudgetBucket, BudgetBucket[]> = {
    [BudgetBucket.LOW]: [BudgetBucket.LOW],
    [BudgetBucket.MEDIUM]: [BudgetBucket.LOW, BudgetBucket.MEDIUM, BudgetBucket.HIGH],
    [BudgetBucket.HIGH]: [BudgetBucket.MEDIUM, BudgetBucket.HIGH, BudgetBucket.LUXURY],
    [BudgetBucket.LUXURY]: [BudgetBucket.HIGH, BudgetBucket.LUXURY],
  };

  // Guest count to capacity mapping
  const guestCountToCapacity: Record<GuestCountBucket, { min: number; max: number }> = {
    [GuestCountBucket.SMALL]: { min: 1, max: 50 },
    [GuestCountBucket.MEDIUM]: { min: 50, max: 150 },
    [GuestCountBucket.LARGE]: { min: 150, max: 1000 },
  };

  // Fetch all weddings with their preferences
  const weddings = await prisma.wedding.findMany({
    select: {
      id: true,
      date: true,
      weddingType: true,
      budgetBucket: true,
      guestCountBucket: true,
      preferredStyle: true,
      preferredServices: true,
    },
  });

  // Fetch all listings with vendor info
  const listings = await prisma.listing.findMany({
    include: {
      vendor: {
        select: {
          serviceOffered: true,
          styleOffered: true,
          weddingTypes: true,
          capacity: true,
          rating: true,
        },
      },
    },
  });

  let totalOrders = 0;
  let totalOrderListings = 0;
  const batchSize = 100;

  // Process each wedding
  for (const wedding of weddings) {
    const bookedServices = new Set<WeddingService>();
    const selectedListings: typeof listings = [];

    // Helper function: Check if listing is eligible for this wedding
    const isEligible = (listing: typeof listings[0]): boolean => {
      const vendor = listing.vendor;

      // Rule 1: Wedding type must match
      if (!vendor.weddingTypes.includes(wedding.weddingType)) {
        return false;
      }

      // Rule 2: Capacity check for VENUE
      if (vendor.serviceOffered === WeddingService.VENUE) {
        const { max } = guestCountToCapacity[wedding.guestCountBucket];
        if (vendor.capacity && vendor.capacity < max) {
          return false;
        }
      }

      // Rule 3: Budget alignment (calculate budget bucket from price)
      const listingBudgetBucket = getPriceBucket(listing.price, vendor.serviceOffered!);
      const allowedBuckets = budgetToPriceRanges[wedding.budgetBucket];
      if (!allowedBuckets.includes(listingBudgetBucket)) {
        return false;
      }

      return true;
    };

    // Helper function: Check if style matches (80% chance requirement)
    const matchesStyle = (listing: typeof listings[0]): boolean => {
      if (listing.vendor.styleOffered === wedding.preferredStyle) {
        return true;
      }
      // 20% chance to book different style
      return faker.number.float({ min: 0, max: 1 }) < 0.2;
    };

    // Get all eligible listings
    const eligibleListings = listings.filter(isEligible);

    // Separate preferred vs other service listings
    const preferredListings = eligibleListings.filter(
      (l) => wedding.preferredServices.includes(l.vendor.serviceOffered!)
    );
    const otherListings = eligibleListings.filter(
      (l) => !wedding.preferredServices.includes(l.vendor.serviceOffered!)
    );

    // Book preferred services first (1 listing per service)
    const shuffledPreferred = faker.helpers.shuffle([...preferredListings]);
    for (const listing of shuffledPreferred) {
      const service = listing.vendor.serviceOffered!;

      if (!bookedServices.has(service) && matchesStyle(listing)) {
        selectedListings.push(listing);
        bookedServices.add(service);
      }

      // Limit to 6 vendors max
      if (selectedListings.length >= 6) break;
    }

    // Book other services with 30% probability (1 listing per service)
    if (selectedListings.length < 6) {
      const shuffledOthers = faker.helpers.shuffle([...otherListings]);
      for (const listing of shuffledOthers) {
        const service = listing.vendor.serviceOffered!;

        if (!bookedServices.has(service) && faker.number.float({ min: 0, max: 1 }) < 0.3) {
          selectedListings.push(listing);
          bookedServices.add(service);
        }

        if (selectedListings.length >= 6) break;
      }
    }

    // Fallback: If no listings selected, pick a random eligible one
    if (selectedListings.length === 0 && eligibleListings.length > 0) {
      selectedListings.push(faker.helpers.arrayElement(eligibleListings));
    }

    // Skip if no listings selected
    if (selectedListings.length === 0) continue;

    // Create 1 order per wedding with all selected listings
    const totalAmount = selectedListings.reduce((sum, l) => sum + l.price, 0);

    await prisma.order.create({
      data: {
        weddingId: wedding.id,
        totalAmount,
        remark: `Wedding ${wedding.id} order`,
        listings: {
          createMany: {
            data: selectedListings.map((listing) => ({
              listingId: listing.id,
              bookedSlots: {
                date: wedding.date?.toISOString().split('T')[0] || '2022-01-01',
                startTime: '09:00:00',
                endTime: '18:00:00',
              },
              bookingStatus: 'PAID'
            })),
          },
        },
      },
    });

    totalOrders++;
    totalOrderListings += selectedListings.length;

    // Progress logging
    if (totalOrders % batchSize === 0) {
      console.log(`   Created ${totalOrders} orders...`);
    }
  }

  console.log(`✅ Created ${totalOrders} orders with ${totalOrderListings} order-listing relationships`);
  console.log(`   - 1 order per wedding (total: ${totalOrders} orders)`);
  console.log(`   - Average ${(totalOrderListings / totalOrders).toFixed(1)} listings per order`);
  console.log(`   - Booking rules applied: budget ±1, capacity check, wedding type match, 80% style match`);
}

// Helper function to categorize listing price into budget bucket
function getPriceBucket(price: number, service: WeddingService): BudgetBucket {
  // Price thresholds vary by service type
  const thresholds: Record<WeddingService, { low: number; medium: number; high: number }> = {
    [WeddingService.VENUE]: { low: 8000, medium: 12000, high: 16000 },
    [WeddingService.CATERING]: { low: 90, medium: 110, high: 130 },
    [WeddingService.PHOTOGRAPHY]: { low: 2500, medium: 3500, high: 4500 },
    [WeddingService.DECORATION]: { low: 2000, medium: 3500, high: 5000 },
    [WeddingService.MUSIC]: { low: 2000, medium: 2800, high: 3500 },
    [WeddingService.ATTIRE]: { low: 1200, medium: 2000, high: 2700 },
    [WeddingService.MAKEUP]: { low: 600, medium: 1000, high: 1300 },
    [WeddingService.TRANSPORTATION]: { low: 1000, medium: 1400, high: 1700 },
  };

  const t = thresholds[service];
  if (price < t.low) return BudgetBucket.LOW;
  if (price < t.medium) return BudgetBucket.MEDIUM;
  if (price < t.high) return BudgetBucket.HIGH;
  return BudgetBucket.LUXURY;
}
