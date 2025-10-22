import {
  BudgetBucket,
  GuestCountBucket,
  PrismaClient,
  UserRole,
  VendorOnboardingStatus,
  WeddingService,
  WeddingStyle,
  WeddingType,
} from '@prisma/client';

export async function seedFreshUsers(
  prisma: PrismaClient,
  hashedPassword: string,
) {
  console.log('✅ Seeding fresh test users...');

  // Create test admin with wedding
  const testAdminUser = await prisma.user.create({
    data: {
      name: 'Test Admin',
      email: 'testadmin@wedding.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      admin: {
        create: {},
      },
    },
  });

  // Create wedding for test admin
  const testWedding = await prisma.wedding.create({
    data: {
      name: 'Test Wedding',
      date: new Date('2026-06-15'),
      location: 'Test Venue, Singapore',
      allocatedBudget: 50000,
      currentSpending: 0,
      weddingType: WeddingType.WESTERN,
      budgetBucket: BudgetBucket.MEDIUM,
      guestCountBucket: GuestCountBucket.MEDIUM,
      preferredStyle: WeddingStyle.MODERN,
      preferredServices: [
        WeddingService.VENUE,
        WeddingService.CATERING,
        WeddingService.PHOTOGRAPHY,
      ],
      admins: {
        connect: { userId: testAdminUser.id },
      },
      mainCouple: {
        connect: { userId: testAdminUser.id },
      },
      notificationDetails: {
        create: {},
      },
    },
  });

  console.log(`✅ Created test admin: ${testAdminUser.email}`);
  console.log(
    `✅ Created test wedding: ${testWedding.name} (ID: ${testWedding.id})`,
  );

  // Create test vendor WITHOUT Stripe details
  const testVendorUser = await prisma.user.create({
    data: {
      name: 'Test Vendor',
      email: 'testvendor@wedding.com',
      password: hashedPassword,
      role: UserRole.VENDOR,
      vendor: {
        create: {
          vendorWebsite: 'https://test-vendor.com',
          uenNumber: 'TEST123456',
          bio: 'Test vendor for development and testing',
          rating: 4.5,
          serviceOffered: WeddingService.PHOTOGRAPHY,
          styleOffered: WeddingStyle.MODERN,
          weddingTypes: [WeddingType.WESTERN, WeddingType.CHINESE],
          capacity: 0,
          onboardingStatus: VendorOnboardingStatus.ONBOARDED,
          isSuspended: false,
          // Deliberately NOT setting Stripe fields to test onboarding flow
          stripeAccountOnboardingComplete: false,
          stripeChargesEnabled: false,
          stripePayoutsEnabled: false,
          stripeDetailsSubmitted: false,
          notificationDetails: {
            create: {},
          },
        },
      },
    },
  });

  console.log(
    `✅ Created test vendor: ${testVendorUser.email} (without Stripe)`,
  );

  console.log('\n✅ Fresh test users created successfully!');
  console.log('Test credentials:');
  console.log('  Admin: testadmin@wedding.com / password123');
  console.log('  Vendor: testvendor@wedding.com / password123');

  return {
    testAdminUser,
    testWedding,
    testVendorUser,
  };
}
