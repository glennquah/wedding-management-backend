import {
  BudgetBucket,
  GuestCountBucket,
  PrismaClient,
  WeddingService,
  WeddingStyle,
  WeddingType,
} from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedRecommendationWeddings(prisma: PrismaClient) {
  // Set deterministic seed for consistent data generation across runs
  faker.seed(12345);

  console.log('✅ Seeding 1000 recommendation weddings with evenly distributed attributes...');

  // Get all enum values
  const weddingTypes = Object.values(WeddingType);
  const budgetBuckets = Object.values(BudgetBucket);
  const guestCountBuckets = Object.values(GuestCountBucket);
  const weddingStyles = Object.values(WeddingStyle);
  const allServices = Object.values(WeddingService);

  const locations = [
    'Marina Bay Grand Ballroom',
    'Heritage Temple Hall',
    'Garden Paradise Resort',
    'Sentosa Beach Pavilion',
    'Botanical Gardens Event Space',
    'Downtown Convention Center',
    'Riverside Hotel Ballroom',
    'Hilltop Garden Venue',
    'Historic Mansion Estate',
    'Skyline Rooftop Terrace',
  ];

  const weddings = [];
  const batchSize = 50;

  for (let i = 0; i < 1000; i++) {
    // Evenly distribute enums using modulo for perfect distribution
    const weddingType = weddingTypes[i % weddingTypes.length];
    const budgetBucket = budgetBuckets[i % budgetBuckets.length];
    const guestCountBucket = guestCountBuckets[i % guestCountBuckets.length];
    const preferredStyle = weddingStyles[i % weddingStyles.length];

    // Select 2-4 preferred services randomly but ensure variety
    const numServices = 2 + (i % 3); // Cycles through 2, 3, 4
    const preferredServices = faker.helpers.shuffle([...allServices]).slice(0, numServices);

    // Generate wedding date between 2022-2023 (past dates to avoid overlap with listing availabilities)
    const weddingDate = faker.date.between({
      from: new Date('2022-01-01'), // Start of 2022
      to: new Date('2023-12-31'),   // End of 2023
    });

    const wedding = await prisma.wedding.create({
      data: {
        name: `Wedding ${i + 1}`,
        date: weddingDate,
        location: locations[i % locations.length],
        weddingType,
        budgetBucket,
        guestCountBucket,
        preferredStyle,
        preferredServices,
        notificationDetails: {
          create: {},
        },
      },
    });

    weddings.push(wedding);

    // Progress logging every batch
    if ((i + 1) % batchSize === 0) {
      console.log(`   Created ${i + 1}/1000 weddings...`);
    }
  }

  console.log('✅ Created 1000 weddings with evenly distributed attributes');
  console.log(`   - WeddingTypes: ${weddingTypes.length} types, ${Math.floor(1000 / weddingTypes.length)} each`);
  console.log(`   - BudgetBuckets: ${budgetBuckets.length} buckets, ${Math.floor(1000 / budgetBuckets.length)} each`);
  console.log(`   - GuestCountBuckets: ${guestCountBuckets.length} buckets, ${Math.floor(1000 / guestCountBuckets.length)} each`);
  console.log(`   - PreferredStyles: ${weddingStyles.length} styles, ${Math.floor(1000 / weddingStyles.length)} each`);

  return weddings;
}
