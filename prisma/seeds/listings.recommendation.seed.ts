import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

export async function seedRecommendationListings(prisma: PrismaClient) {
  // Set deterministic seed for consistent data generation across runs
  faker.seed(4000);

  console.log('✅ Seeding recommendation listings (3 per vendor)...');

  // Fetch ONLY recommendation vendors (user IDs 10000+)
  const vendors = await prisma.vendor.findMany({
    where: {
      userId: {
        gte: 10000,
      },
    },
    include: { user: true },
  });

  // Package names based on service type
  const packageNames = {
    VENUE: ['Premium Package', 'Standard Package', 'Deluxe Package'],
    CATERING: ['5-Course Dinner', 'Buffet Package', 'Cocktail Reception'],
    PHOTOGRAPHY: [
      'Full Day Coverage',
      'Half Day Coverage',
      'Engagement Session',
    ],
    DECORATION: [
      'Complete Decor Package',
      'Floral Arrangements',
      'Centerpieces & Accents',
    ],
    MUSIC: ['Full Band', 'DJ Service', 'Live Musicians'],
    ATTIRE: ['Bridal Package', 'Groom Package', 'Complete Wedding Attire'],
    MAKEUP: [
      'Bridal Makeup & Hair',
      'Bridal Party Package',
      'Touch-up Service',
    ],
    TRANSPORTATION: [
      'Luxury Car Service',
      'Limousine Package',
      'Vintage Car Rental',
    ],
  };

  // Price ranges based on service type (in SGD)
  const priceRanges = {
    VENUE: { min: 5000, max: 20000 },
    CATERING: { min: 80, max: 150 }, // per person
    PHOTOGRAPHY: { min: 2000, max: 5000 },
    DECORATION: { min: 1000, max: 6000 },
    MUSIC: { min: 1500, max: 4000 },
    ATTIRE: { min: 800, max: 3000 },
    MAKEUP: { min: 300, max: 1500 },
    TRANSPORTATION: { min: 500, max: 2000 },
  };

  // Generate availabilities from 2024 onwards (after wedding dates which are 2022-2023)
  const generateAvailabilities = () => {
    const availabilities = [];
    // Generate 5-10 random available dates in 2024-2025
    const numDates = faker.number.int({ min: 5, max: 10 });

    for (let i = 0; i < numDates; i++) {
      const date = faker.date.between({
        from: new Date('2024-01-01'),
        to: new Date('2025-12-31'),
      });

      availabilities.push({
        startTime: new Date(date.setHours(8, 0, 0, 0)).toISOString(),
        endTime: new Date(date.setHours(20, 0, 0, 0)).toISOString(),
        date: date.toISOString().split('T')[0],
      });
    }

    return availabilities;
  };

  const createdListings = [];
  const batchSize = 100;
  let totalListings = 0;

  for (const vendor of vendors) {
    const serviceOffered = vendor.serviceOffered;
    if (!serviceOffered) continue;

    for (let i = 0; i < 3; i++) {
      const packageName =
        packageNames[serviceOffered][i % packageNames[serviceOffered].length];
      const priceRange = priceRanges[serviceOffered];
      const price = faker.number.float({
        min: priceRange.min,
        max: priceRange.max,
        fractionDigits: 2,
      });

      const listing = await prisma.listing.create({
        data: {
          listingName: `${vendor.user.name} - ${packageName}`,
          price,
          availabilities: generateAvailabilities(),
          remarks: faker.company.catchPhrase(),
          vendorId: vendor.userId,
          imageUrls: [],
        },
      });

      createdListings.push(listing);
      totalListings++;

      // Progress logging
      if (totalListings % batchSize === 0) {
        console.log(`   Created ${totalListings} listings...`);
      }
    }
  }

  console.log(`✅ Created ${createdListings.length} listings`);
  console.log(
    `   - Average ${(createdListings.length / vendors.length).toFixed(1)} listings per vendor`,
  );
  console.log(
    `   - Availabilities: 2024-2025 (after historical wedding dates)`,
  );

  return createdListings;
}
