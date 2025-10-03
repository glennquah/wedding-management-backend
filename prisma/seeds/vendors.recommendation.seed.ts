import {
  PrismaClient,
  UserRole,
  VendorOnboardingStatus,
  WeddingService,
  WeddingStyle,
  WeddingType,
} from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedRecommendationVendors(
  prisma: PrismaClient,
  hashedPassword: string,
) {
  // Set deterministic seed for consistent data generation across runs
  faker.seed(99999);

  console.log('✅ Seeding 200 recommendation vendors with even distribution...');

  // Get all enum values
  const services = Object.values(WeddingService);
  const styles = Object.values(WeddingStyle);
  const weddingTypes = Object.values(WeddingType);

  const vendors = [];
  const batchSize = 50;

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
    // Evenly distribute across services
    const service = services[i % services.length];
    const style = styles[i % styles.length];

    // Vary wedding types - some vendors support multiple types
    const numTypes = 1 + (i % 3); // 1, 2, or 3 types
    const supportedTypes = faker.helpers.shuffle([...weddingTypes]).slice(0, numTypes);

    // Generate vendor name based on service
    const prefix = faker.helpers.arrayElement(serviceNamePrefixes[service]);
    const suffix = faker.helpers.arrayElement(serviceSuffixes[service]);
    const vendorName = `${prefix} ${suffix}`;

    // Capacity: only VENUE needs capacity, others 0
    const capacity = service === WeddingService.VENUE
      ? faker.number.int({ min: 50, max: 500 })
      : 0;

    // Rating: slightly skewed towards higher ratings (realistic)
    const rating = faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 });

    // All vendors onboarded and active for recommendation training
    const onboardingStatus = VendorOnboardingStatus.ONBOARDED;
    const isSuspended = false;

    const vendor = await prisma.user.create({
      data: {
        name: vendorName,
        email: `vendor${i}@recommendation.com`,
        password: hashedPassword,
        role: UserRole.VENDOR,
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

  console.log('✅ Created 200 vendors with even distribution');
  console.log(`   - Services: ${services.length} types, ~${Math.floor(200 / services.length)} vendors each`);
  console.log(`   - Styles: ${styles.length} types, ~${Math.floor(200 / styles.length)} vendors each`);
  console.log(`   - Average rating: ~4.2-4.5 stars`);
  console.log(`   - All vendors onboarded and active`);

  return vendors;
}
