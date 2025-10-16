import { faker } from '@faker-js/faker';
import {
  PrismaClient,
  UserRole,
  VendorOnboardingStatus,
  WeddingService,
  WeddingStyle,
  WeddingType,
} from '@prisma/client';

export async function seedRecommendationVendors(
  prisma: PrismaClient,
  hashedPassword: string,
) {
  // Set deterministic seed for consistent data generation across runs
  faker.seed(99999);

  console.log('✅ Seeding 200 recommendation vendors with realistic distribution...');

  const weddingTypes = Object.values(WeddingType);

  // Weighted distributions for realistic vendor data
  // Services: Venue, Catering, Photography most in demand
  const serviceWeights = [
    { value: WeddingService.VENUE, weight: 20 },        // 20% - High demand, limited supply
    { value: WeddingService.CATERING, weight: 18 },     // 18% - Essential service
    { value: WeddingService.PHOTOGRAPHY, weight: 16 },  // 16% - Very popular
    { value: WeddingService.DECORATION, weight: 14 },   // 14% - Common
    { value: WeddingService.MAKEUP, weight: 12 },       // 12% - Common
    { value: WeddingService.MUSIC, weight: 10 },        // 10% - Less common
    { value: WeddingService.ATTIRE, weight: 6 },        // 6% - Specialized
    { value: WeddingService.TRANSPORTATION, weight: 4 }, // 4% - Niche service
  ];

  // Styles: Modern most common, matching wedding preferences
  const styleWeights = [
    { value: WeddingStyle.MODERN, weight: 45 },
    { value: WeddingStyle.TRADITIONAL, weight: 30 },
    { value: WeddingStyle.LUXURY, weight: 15 },
    { value: WeddingStyle.RUSTIC, weight: 10 },
  ];

  const vendors = [];
  const batchSize = 50;
  const numberOfMonths = 12; // Spread over 12 months for better distribution

  // Service-specific name prefixes for realistic vendor names
  const serviceNamePrefixes = {
    [WeddingService.VENUE]: ['Grand', 'Elegant', 'Royal', 'Paradise', 'Heritage', 'Skyline', 'Marina', 'Garden'],
    [WeddingService.CATERING]: ['Gourmet', 'Delicious', 'Feast', 'Culinary', 'Savory', 'Tasty', 'Premium'],
    [WeddingService.PHOTOGRAPHY]: ['Eternal', 'Candid', 'Moments', 'Memories', 'Lens', 'Frame', 'Capture'],
    [WeddingService.DECORATION]: ['Floral', 'Elegant', 'Artistic', 'Creative', 'Blooming', 'Charm', 'Beauty'],
    [WeddingService.MUSIC]: ['Symphony', 'Harmony', 'Melody', 'Rhythm', 'Jazz', 'Classical', 'Orchestra'],
    [WeddingService.ATTIRE]: ['Couture', 'Bridal', 'Elegant', 'Luxe', 'Fashion', 'Style', 'Boutique'],
    [WeddingService.MAKEUP]: ['Glamour', 'Beauty', 'Radiance', 'Elegance', 'Glow', 'Studio', 'Artistry'],
    [WeddingService.TRANSPORTATION]: ['Luxury', 'Premium', 'Elite', 'Royal', 'Classic', 'Prestige', 'Grand'],
  };

  const serviceSuffixes = {
    [WeddingService.VENUE]: ['Hall', 'Ballroom', 'Resort', 'Estate', 'Gardens', 'Pavilion', 'Center'],
    [WeddingService.CATERING]: ['Catering', 'Kitchen', 'Services', 'Co.', 'Delights', 'Feast'],
    [WeddingService.PHOTOGRAPHY]: ['Photography', 'Studio', 'Lens', 'Visuals', 'Images', 'Photos'],
    [WeddingService.DECORATION]: ['Designs', 'Decorators', 'Florals', 'Decor', 'Creations'],
    [WeddingService.MUSIC]: ['Band', 'Orchestra', 'Ensemble', 'Musicians', 'Entertainment'],
    [WeddingService.ATTIRE]: ['Boutique', 'House', 'Atelier', 'Couture', 'Fashion'],
    [WeddingService.MAKEUP]: ['Studio', 'Makeup', 'Beauty', 'Artistry', 'Salon'],
    [WeddingService.TRANSPORTATION]: ['Transport', 'Cars', 'Limousines', 'Rides', 'Services'],
  };

  for (let i = 0; i < 200; i++) {
    // Use weighted random selection for realistic distribution
    const service = faker.helpers.weightedArrayElement(serviceWeights);
    const style = faker.helpers.weightedArrayElement(styleWeights);

    // Vary wedding types - vendors support 1-3 types
    // Most vendors specialize (1-2 types), fewer are generalists (3+ types)
    const numTypes = faker.helpers.weightedArrayElement([
      { value: 1, weight: 40 },  // 40% specialize in 1 type
      { value: 2, weight: 35 },  // 35% handle 2 types
      { value: 3, weight: 20 },  // 20% handle 3 types
      { value: 4, weight: 4 },   // 4% handle 4 types
      { value: 5, weight: 1 },   // 1% handle all types
    ]);
    const supportedTypes = faker.helpers.shuffle([...weddingTypes]).slice(0, numTypes);

    // Generate vendor name based on service
    const prefix = faker.helpers.arrayElement(serviceNamePrefixes[service]);
    const suffix = faker.helpers.arrayElement(serviceSuffixes[service]);
    const vendorName = `${prefix} ${suffix}`;

    // Capacity: only VENUE needs capacity, others 0
    // Weighted capacity distribution (most venues are medium-sized)
    const capacity = service === WeddingService.VENUE
      ? faker.helpers.weightedArrayElement([
          { value: faker.number.int({ min: 30, max: 80 }), weight: 20 },    // Small venues
          { value: faker.number.int({ min: 80, max: 200 }), weight: 50 },   // Medium venues
          { value: faker.number.int({ min: 200, max: 400 }), weight: 25 },  // Large venues
          { value: faker.number.int({ min: 400, max: 600 }), weight: 5 },   // Extra large venues
        ])
      : 0;

    // Rating: weighted towards higher ratings (most vendors are good)
    const rating = faker.helpers.weightedArrayElement([
      { value: parseFloat(faker.number.float({ min: 3.0, max: 3.5, fractionDigits: 1 }).toFixed(1)), weight: 5 },   // Below average
      { value: parseFloat(faker.number.float({ min: 3.5, max: 4.0, fractionDigits: 1 }).toFixed(1)), weight: 15 },  // Average
      { value: parseFloat(faker.number.float({ min: 4.0, max: 4.5, fractionDigits: 1 }).toFixed(1)), weight: 50 },  // Good
      { value: parseFloat(faker.number.float({ min: 4.5, max: 5.0, fractionDigits: 1 }).toFixed(1)), weight: 30 },  // Excellent
    ]);

    // All vendors onboarded and active for recommendation training
    const onboardingStatus = VendorOnboardingStatus.ONBOARDED;
    const isSuspended = false;

    const email = `vendor${i}@recommendation.com`;

    // Calculate signup date (spread over 12 months, older to newer)
    const monthIndex = Math.floor(i / (200 / numberOfMonths));
    const monthsAgo = numberOfMonths - 1 - monthIndex;
    const createdDate = new Date();
    createdDate.setMonth(createdDate.getMonth() - monthsAgo);
    createdDate.setDate(Math.floor(Math.random() * 28) + 1);
    createdDate.setHours(Math.floor(Math.random() * 24));
    createdDate.setMinutes(Math.floor(Math.random() * 60));

    const vendor = await prisma.user.create({
      data: {
        name: vendorName,
        email,
        password: hashedPassword,
        role: UserRole.VENDOR,
        createdAt: createdDate,
        vendor: {
          create: {
            vendorWebsite: faker.internet.url(),
            uenNumber: faker.string.alphanumeric(10).toUpperCase(),
            bio: faker.company.catchPhrase(),
            rating,
            serviceOffered: service,
            styleOffered: style,
            weddingTypes: supportedTypes,
            capacity,
            onboardingStatus,
            isSuspended,
            onboardedDate: createdDate,
            notificationDetails: {
              create: {},
            },
          },
        },
      },
      include: {
        vendor: true,
      },
    });

    vendors.push(vendor);

    // Progress logging every batch
    if ((i + 1) % batchSize === 0) {
      console.log(`   Created ${i + 1}/200 vendors...`);
    }
  }

  // Calculate actual distribution for logging
  const serviceDistribution = vendors.reduce((acc, v) => {
    const service = v.vendor!.serviceOffered!;
    acc[service] = (acc[service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const styleDistribution = vendors.reduce((acc, v) => {
    const style = v.vendor!.styleOffered!;
    acc[style] = (acc[style] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const avgRating = vendors.reduce((sum, v) => sum + (v.vendor!.rating || 0), 0) / vendors.length;

  console.log('✅ Created 200 vendors distributed over 12 months with realistic weighted distribution');
  console.log('   - Services:', serviceDistribution);
  console.log('   - Styles:', styleDistribution);
  console.log(`   - Average rating: ${avgRating.toFixed(2)} stars`);
  console.log('   - All vendors onboarded and active');

  return vendors;
}
