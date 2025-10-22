import {
  PrismaClient,
  UserRole,
  VendorOnboardingStatus,
  WeddingService,
  WeddingStyle,
  WeddingType,
} from '@prisma/client';

export async function seedVendors(
  prisma: PrismaClient,
  hashedPassword: string,
) {
  console.log('✅ Seeding vendors...');

  const vendorData = [
    {
      name: 'Marina Bay Grand Ballroom',
      email: 'vendor@wedding.com',
      service: WeddingService.VENUE,
      style: WeddingStyle.LUXURY,
      capacity: 300,
      bio: 'Luxurious waterfront venue',
      rating: 4.8,
      types: [WeddingType.WESTERN],
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
    },
    {
      name: 'Garden Paradise Resort',
      email: 'garden@venue.com',
      service: WeddingService.VENUE,
      style: WeddingStyle.RUSTIC,
      capacity: 200,
      bio: 'Beautiful outdoor venue',
      rating: 4.6,
      types: [WeddingType.WESTERN],
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
    },
    {
      name: 'Heritage Temple Hall',
      email: 'heritage@venue.com',
      service: WeddingService.VENUE,
      style: WeddingStyle.TRADITIONAL,
      capacity: 250,
      bio: 'Traditional cultural venue',
      rating: 4.7,
      types: [WeddingType.CHINESE],
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
    },
    {
      name: 'Gourmet Delights Catering',
      email: 'gourmet@catering.com',
      service: WeddingService.CATERING,
      style: WeddingStyle.LUXURY,
      capacity: 0,
      bio: 'Fine dining catering',
      rating: 4.9,
      types: [WeddingType.WESTERN],
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
    },
    {
      name: 'Traditional Feast Co.',
      email: 'traditional@catering.com',
      service: WeddingService.CATERING,
      style: WeddingStyle.TRADITIONAL,
      capacity: 0,
      bio: 'Authentic cuisine',
      rating: 4.5,
      types: [WeddingType.CHINESE],
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
    },
    {
      name: 'Modern Bistro Catering',
      email: 'modern@catering.com',
      service: WeddingService.CATERING,
      style: WeddingStyle.MODERN,
      capacity: 0,
      bio: 'Contemporary fusion',
      rating: 4.7,
      types: [WeddingType.WESTERN],
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
      isSuspended: true,
    },
    {
      name: 'Spice Route Catering',
      email: 'spice@catering.com',
      service: WeddingService.CATERING,
      style: WeddingStyle.TRADITIONAL,
      capacity: 0,
      bio: 'Asian spices specialist',
      rating: 4.6,
      types: [WeddingType.INDIAN],
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
      isSuspended: true,
    },
    {
      name: 'Eternal Moments Photography',
      email: 'eternal@photo.com',
      service: WeddingService.PHOTOGRAPHY,
      style: WeddingStyle.LUXURY,
      capacity: 0,
      bio: 'Award-winning photographers',
      rating: 4.9,
      types: [WeddingType.WESTERN],
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
      isSuspended: true,
    },
    {
      name: 'Candid Stories Studio',
      email: 'candid@photo.com',
      service: WeddingService.PHOTOGRAPHY,
      style: WeddingStyle.MODERN,
      capacity: 0,
      bio: 'Creative storytelling',
      rating: 4.8,
      types: [WeddingType.WESTERN],
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
      isSuspended: true,
    },
    {
      name: 'Heritage Lens Photography',
      email: 'heritage@photo.com',
      service: WeddingService.PHOTOGRAPHY,
      style: WeddingStyle.TRADITIONAL,
      capacity: 0,
      bio: 'Traditional photography',
      rating: 4.7,
      types: [WeddingType.CHINESE],
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
      isSuspended: true,
    },
    {
      name: 'Floral Elegance Designs',
      email: 'floral@decor.com',
      service: WeddingService.DECORATION,
      style: WeddingStyle.LUXURY,
      capacity: 0,
      bio: 'Luxury floral arrangements',
      rating: 4.8,
      types: [WeddingType.WESTERN],
    },
    {
      name: 'Rustic Charm Decorators',
      email: 'rustic@decor.com',
      service: WeddingService.DECORATION,
      style: WeddingStyle.RUSTIC,
      capacity: 0,
      bio: 'Natural decorations',
      rating: 4.6,
      types: [WeddingType.WESTERN],
    },
    {
      name: 'Cultural Decor Masters',
      email: 'cultural@decor.com',
      service: WeddingService.DECORATION,
      style: WeddingStyle.TRADITIONAL,
      capacity: 0,
      bio: 'Traditional cultural decor',
      rating: 4.7,
      types: [WeddingType.CHINESE],
    },
    {
      name: 'Symphony Wedding Orchestra',
      email: 'symphony@music.com',
      service: WeddingService.MUSIC,
      style: WeddingStyle.LUXURY,
      capacity: 0,
      bio: 'Professional orchestra',
      rating: 4.9,
      types: [WeddingType.WESTERN],
    },
    {
      name: 'Cultural Music Ensemble',
      email: 'cultural@music.com',
      service: WeddingService.MUSIC,
      style: WeddingStyle.TRADITIONAL,
      capacity: 0,
      bio: 'Traditional music',
      rating: 4.6,
      types: [WeddingType.CHINESE],
    },
    {
      name: 'Bridal Couture House',
      email: 'couture@attire.com',
      service: WeddingService.ATTIRE,
      style: WeddingStyle.LUXURY,
      capacity: 0,
      bio: 'Custom luxury gowns',
      rating: 4.8,
      types: [WeddingType.WESTERN],
    },
    {
      name: 'Traditional Attire Boutique',
      email: 'traditional@attire.com',
      service: WeddingService.ATTIRE,
      style: WeddingStyle.TRADITIONAL,
      capacity: 0,
      bio: 'Traditional wedding attire',
      rating: 4.7,
      types: [WeddingType.CHINESE],
    },
    {
      name: 'Glamour Beauty Studio',
      email: 'glamour@makeup.com',
      service: WeddingService.MAKEUP,
      style: WeddingStyle.LUXURY,
      capacity: 0,
      bio: 'Professional bridal makeup',
      rating: 4.9,
      types: [WeddingType.WESTERN],
    },
    {
      name: 'Elegant Touch Makeup',
      email: 'elegant@makeup.com',
      service: WeddingService.MAKEUP,
      style: WeddingStyle.MODERN,
      capacity: 0,
      bio: 'Modern bridal makeup',
      rating: 4.7,
      types: [WeddingType.WESTERN],
    },
    {
      name: 'Luxury Wedding Transport',
      email: 'luxury@transport.com',
      service: WeddingService.TRANSPORTATION,
      style: WeddingStyle.LUXURY,
      capacity: 0,
      bio: 'Premium transportation',
      rating: 4.8,
      types: [WeddingType.WESTERN],
    },
  ];

  // Create vendors over a 9-month period to show growth over time
  const numberOfMonths = 9;
  const vendorsPerMonth = Math.ceil(vendorData.length / numberOfMonths);

  for (let i = 0; i < vendorData.length; i++) {
    const vendor = vendorData[i];

    // Calculate which month this vendor should be created in (older to newer)
    const monthIndex = Math.floor(i / vendorsPerMonth);
    const monthsAgo = numberOfMonths - 1 - monthIndex;

    // Generate a date within that month
    const createdDate = new Date();
    createdDate.setMonth(createdDate.getMonth() - monthsAgo);
    createdDate.setDate(Math.floor(Math.random() * 28) + 1); // Random day in month
    createdDate.setHours(Math.floor(Math.random() * 24));
    createdDate.setMinutes(Math.floor(Math.random() * 60));

    await prisma.user.create({
      data: {
        name: vendor.name,
        email: vendor.email,
        password: hashedPassword,
        role: UserRole.VENDOR,
        createdAt: createdDate,
        vendor: {
          create: {
            vendorWebsite: `https://${vendor.name.toLowerCase().replace(/\s+/g, '-')}.com`,
            uenNumber: `UEN${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            bio: vendor.bio,
            rating: vendor.rating,
            serviceOffered: vendor.service,
            styleOffered: vendor.style,
            weddingTypes: vendor.types,
            capacity: vendor.capacity,
            onboardingStatus: vendor.onboardingStatus,
            isSuspended: vendor.isSuspended,
            stripeAccountOnboardingComplete: true,
            stripeChargesEnabled: true,
            stripePayoutsEnabled: true,
            stripeDetailsSubmitted: true,
            notificationDetails: {
              create: {},
            },
          },
        },
      },
    });
  }

  console.log(
    `✅ Created ${vendorData.length} vendors distributed over ${numberOfMonths} months`,
  );
}
