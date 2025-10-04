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

  console.log('✅ Seeding 1000 recommendation weddings with realistic distribution...');

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

  // Weighted distributions for realistic data
  // Wedding types: Chinese and Western more common in Singapore
  const weddingTypeWeights = [
    { value: WeddingType.CHINESE, weight: 30 },
    { value: WeddingType.WESTERN, weight: 35 },
    { value: WeddingType.MALAY, weight: 15 },
    { value: WeddingType.INDIAN, weight: 12 },
    { value: WeddingType.OTHERS, weight: 8 },
  ];

  // Budget: Most people choose MEDIUM or HIGH, fewer choose LOW or LUXURY
  const budgetWeights = [
    { value: BudgetBucket.LOW, weight: 15 },
    { value: BudgetBucket.MEDIUM, weight: 40 },
    { value: BudgetBucket.HIGH, weight: 30 },
    { value: BudgetBucket.LUXURY, weight: 15 },
  ];

  // Guest count: MEDIUM most common, SMALL and LARGE less common
  const guestCountWeights = [
    { value: GuestCountBucket.SMALL, weight: 20 },
    { value: GuestCountBucket.MEDIUM, weight: 55 },
    { value: GuestCountBucket.LARGE, weight: 25 },
  ];

  // Styles: MODERN most popular, TRADITIONAL common, LUXURY and RUSTIC less common
  const styleWeights = [
    { value: WeddingStyle.MODERN, weight: 45 },
    { value: WeddingStyle.TRADITIONAL, weight: 30 },
    { value: WeddingStyle.LUXURY, weight: 15 },
    { value: WeddingStyle.RUSTIC, weight: 10 },
  ];

  const weddings = [];
  const batchSize = 50;

  for (let i = 0; i < 1000; i++) {
    // Use weighted random selection for realistic distribution
    const weddingType = faker.helpers.weightedArrayElement(weddingTypeWeights);
    const budgetBucket = faker.helpers.weightedArrayElement(budgetWeights);
    const guestCountBucket = faker.helpers.weightedArrayElement(guestCountWeights);
    const preferredStyle = faker.helpers.weightedArrayElement(styleWeights);

    // Select 2-4 preferred services randomly
    const numServices = faker.number.int({ min: 2, max: 4 });
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

  // Calculate actual distribution for logging
  const typeDistribution = weddings.reduce((acc, w) => {
    acc[w.weddingType] = (acc[w.weddingType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const budgetDistribution = weddings.reduce((acc, w) => {
    acc[w.budgetBucket] = (acc[w.budgetBucket] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('✅ Created 1000 weddings with realistic weighted distribution');
  console.log('   - Wedding Types:', typeDistribution);
  console.log('   - Budget Buckets:', budgetDistribution);

  return weddings;
}
