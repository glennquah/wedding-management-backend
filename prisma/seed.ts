import {
  BudgetBucket,
  ConfirmationStatus,
  GuestCountBucket,
  PrismaClient,
  UserRole,
  VendorOnboardingStatus,
  WeddingService,
  WeddingStyle,
  WeddingType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('✅ Seeding database...');

  // Clear existing data first (if tables exist)
  console.log('✅ Clearing existing data...');
  try {
    await prisma.guest.deleteMany();
    await prisma.wedding.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.superAdmin.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Existing data cleared');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.log('✅ Database is fresh, no data to clear');
  }

  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'superadmin@wedding.com',
      password: hashedPassword,
      role: UserRole.superAdmin,
      superAdmin: {
        create: {},
      },
    },
  });

  // First, create all weddings without couples
  const weddingThemes = [
    {
      name: "Ryan & Ranae's Enchanted Garden Wedding",
      date: new Date('2024-12-15T14:00:00.000Z'),
      location: 'Marina Bay Grand Ballroom',
      weddingType: WeddingType.western,
      budgetBucket: BudgetBucket.luxury,
      guestCountBucket: GuestCountBucket.large,
      preferredStyle: WeddingStyle.luxury,
      preferredServices: [
        WeddingService.venue,
        WeddingService.photography,
        WeddingService.catering,
        WeddingService.decoration,
      ],
    },
    {
      name: "Marcus & Sarah's Traditional Chinese Tea Ceremony",
      date: new Date('2024-11-08T10:00:00.000Z'),
      location: 'Heritage Temple Hall',
      weddingType: WeddingType.chinese,
      budgetBucket: BudgetBucket.medium,
      guestCountBucket: GuestCountBucket.large,
      preferredStyle: WeddingStyle.traditional,
      preferredServices: [
        WeddingService.venue,
        WeddingService.photography,
        WeddingService.catering,
      ],
    },
    {
      name: "Amir & Siti's Malay Cultural Celebration",
      date: new Date('2024-10-20T16:00:00.000Z'),
      location: 'Garden Paradise Resort',
      weddingType: WeddingType.malay,
      budgetBucket: BudgetBucket.medium,
      guestCountBucket: GuestCountBucket.large,
      preferredStyle: WeddingStyle.traditional,
      preferredServices: [
        WeddingService.venue,
        WeddingService.photography,
        WeddingService.catering,
      ],
    },
    {
      name: "Raj & Priya's Grand Indian Wedding",
      date: new Date('2025-01-25T12:00:00.000Z'),
      location: 'Heritage Temple Hall',
      weddingType: WeddingType.indian,
      budgetBucket: BudgetBucket.medium,
      guestCountBucket: GuestCountBucket.large,
      preferredStyle: WeddingStyle.traditional,
      preferredServices: [
        WeddingService.venue,
        WeddingService.photography,
        WeddingService.catering,
      ],
    },
    {
      name: "David & Emma's Modern Beach Wedding",
      date: new Date('2024-09-30T17:00:00.000Z'),
      location: 'Garden Paradise Resort',
      weddingType: WeddingType.western,
      budgetBucket: BudgetBucket.medium,
      guestCountBucket: GuestCountBucket.large,
      preferredStyle: WeddingStyle.modern,
      preferredServices: [
        WeddingService.venue,
        WeddingService.photography,
        WeddingService.catering,
      ],
    },
  ];

  const weddings = [];
  for (const theme of weddingThemes) {
    const wedding = await prisma.wedding.create({
      data: {
        name: theme.name,
        date: theme.date,
        location: theme.location,
        weddingType: theme.weddingType,
        budgetBucket: theme.budgetBucket,
        guestCountBucket: theme.guestCountBucket,
        preferredStyle: theme.preferredStyle,
        preferredServices: theme.preferredServices,
      },
    });
    weddings.push(wedding);
  }

  console.log('✅ Created 5 weddings');

  // Now create the couple users and associate them with weddings
  const couples = [
    {
      name1: 'Ryan Chen',
      email1: 'couple@wedding.com',
      name2: 'Ranae Lim',
      email2: 'ranae.lim@email.com',
      weddingIndex: 0,
    },
    {
      name1: 'Marcus Tan',
      email1: 'marcus.tan@email.com',
      name2: 'Sarah Wong',
      email2: 'sarah.wong@email.com',
      weddingIndex: 1,
    },
    {
      name1: 'Amir Rahman',
      email1: 'amir.rahman@email.com',
      name2: 'Siti Abdullah',
      email2: 'siti.abdullah@email.com',
      weddingIndex: 2,
    },
    {
      name1: 'Raj Kumar',
      email1: 'raj.kumar@email.com',
      name2: 'Priya Sharma',
      email2: 'priya.sharma@email.com',
      weddingIndex: 3,
    },
    {
      name1: 'David Lee',
      email1: 'david.lee@email.com',
      name2: 'Emma Johnson',
      email2: 'emma.johnson@email.com',
      weddingIndex: 4,
      isSuspended: true,
    },
  ];

  const coupleUsers = [];
  for (const couple of couples) {
    const wedding = weddings[couple.weddingIndex];
    const [user1, user2] = await Promise.all([
      prisma.user.create({
        data: {
          name: couple.name1,
          email: couple.email1,
          password: hashedPassword,
          role: UserRole.admin,
          admin: {
            create: {
              isSuspended: couple.isSuspended || false,
              mainWeddingId: wedding.id,
            },
          },
        },
      }),
      prisma.user.create({
        data: {
          name: couple.name2,
          email: couple.email2,
          password: hashedPassword,
          role: UserRole.admin,
          admin: {
            create: {
              isSuspended: couple.isSuspended || false,
              mainWeddingId: wedding.id,
            },
          },
        },
      }),
    ]);

    // Connect both admins to the wedding as admins and as main couple
    await prisma.wedding.update({
      where: { id: wedding.id },
      data: {
        admins: {
          connect: [{ userId: user1.id }, { userId: user2.id }],
        },
        mainCouple: {
          connect: [{ userId: user1.id }, { userId: user2.id }],
        },
      },
    });

    coupleUsers.push([user1, user2]);
  }

  console.log('✅ Created couples and associated with weddings');

  const vendorData = [
    {
      name: 'Marina Bay Grand Ballroom',
      email: 'vendor@wedding.com',
      service: WeddingService.venue,
      style: WeddingStyle.luxury,
      capacity: 300,
      bio: 'Luxurious waterfront venue',
      rating: 4.8,
      types: [WeddingType.western],
      onboardingStatus: VendorOnboardingStatus.onboarded,
    },
    {
      name: 'Garden Paradise Resort',
      email: 'garden@venue.com',
      service: WeddingService.venue,
      style: WeddingStyle.rustic,
      capacity: 200,
      bio: 'Beautiful outdoor venue',
      rating: 4.6,
      types: [WeddingType.western],
      onboardingStatus: VendorOnboardingStatus.onboarded,
    },
    {
      name: 'Heritage Temple Hall',
      email: 'heritage@venue.com',
      service: WeddingService.venue,
      style: WeddingStyle.traditional,
      capacity: 250,
      bio: 'Traditional cultural venue',
      rating: 4.7,
      types: [WeddingType.chinese],
      onboardingStatus: VendorOnboardingStatus.onboarded,
    },
    {
      name: 'Gourmet Delights Catering',
      email: 'gourmet@catering.com',
      service: WeddingService.catering,
      style: WeddingStyle.luxury,
      capacity: 0,
      bio: 'Fine dining catering',
      rating: 4.9,
      types: [WeddingType.western],
      onboardingStatus: VendorOnboardingStatus.onboarded,
    },
    {
      name: 'Traditional Feast Co.',
      email: 'traditional@catering.com',
      service: WeddingService.catering,
      style: WeddingStyle.traditional,
      capacity: 0,
      bio: 'Authentic cuisine',
      rating: 4.5,
      types: [WeddingType.chinese],
      onboardingStatus: VendorOnboardingStatus.onboarded,
    },
    {
      name: 'Modern Bistro Catering',
      email: 'modern@catering.com',
      service: WeddingService.catering,
      style: WeddingStyle.modern,
      capacity: 0,
      bio: 'Contemporary fusion',
      rating: 4.7,
      types: [WeddingType.western],
      onboardingStatus: VendorOnboardingStatus.onboarded,
      isSuspended: true,
    },
    {
      name: 'Spice Route Catering',
      email: 'spice@catering.com',
      service: WeddingService.catering,
      style: WeddingStyle.traditional,
      capacity: 0,
      bio: 'Asian spices specialist',
      rating: 4.6,
      types: [WeddingType.indian],
      onboardingStatus: VendorOnboardingStatus.onboarded,
      isSuspended: true,
    },
    {
      name: 'Eternal Moments Photography',
      email: 'eternal@photo.com',
      service: WeddingService.photography,
      style: WeddingStyle.luxury,
      capacity: 0,
      bio: 'Award-winning photographers',
      rating: 4.9,
      types: [WeddingType.western],
      onboardingStatus: VendorOnboardingStatus.onboarded,
      isSuspended: true,
    },
    {
      name: 'Candid Stories Studio',
      email: 'candid@photo.com',
      service: WeddingService.photography,
      style: WeddingStyle.modern,
      capacity: 0,
      bio: 'Creative storytelling',
      rating: 4.8,
      types: [WeddingType.western],
      onboardingStatus: VendorOnboardingStatus.onboarded,
      isSuspended: true,
    },
    {
      name: 'Heritage Lens Photography',
      email: 'heritage@photo.com',
      service: WeddingService.photography,
      style: WeddingStyle.traditional,
      capacity: 0,
      bio: 'Traditional photography',
      rating: 4.7,
      types: [WeddingType.chinese],
      onboardingStatus: VendorOnboardingStatus.onboarded,
      isSuspended: true,
    },
    {
      name: 'Floral Elegance Designs',
      email: 'floral@decor.com',
      service: WeddingService.decoration,
      style: WeddingStyle.luxury,
      capacity: 0,
      bio: 'Luxury floral arrangements',
      rating: 4.8,
      types: [WeddingType.western],
    },
    {
      name: 'Rustic Charm Decorators',
      email: 'rustic@decor.com',
      service: WeddingService.decoration,
      style: WeddingStyle.rustic,
      capacity: 0,
      bio: 'Natural decorations',
      rating: 4.6,
      types: [WeddingType.western],
    },
    {
      name: 'Cultural Decor Masters',
      email: 'cultural@decor.com',
      service: WeddingService.decoration,
      style: WeddingStyle.traditional,
      capacity: 0,
      bio: 'Traditional cultural decor',
      rating: 4.7,
      types: [WeddingType.chinese],
    },
    {
      name: 'Symphony Wedding Orchestra',
      email: 'symphony@music.com',
      service: WeddingService.music,
      style: WeddingStyle.luxury,
      capacity: 0,
      bio: 'Professional orchestra',
      rating: 4.9,
      types: [WeddingType.western],
    },
    {
      name: 'Cultural Music Ensemble',
      email: 'cultural@music.com',
      service: WeddingService.music,
      style: WeddingStyle.traditional,
      capacity: 0,
      bio: 'Traditional music',
      rating: 4.6,
      types: [WeddingType.chinese],
    },
    {
      name: 'Bridal Couture House',
      email: 'couture@attire.com',
      service: WeddingService.attire,
      style: WeddingStyle.luxury,
      capacity: 0,
      bio: 'Custom luxury gowns',
      rating: 4.8,
      types: [WeddingType.western],
    },
    {
      name: 'Traditional Attire Boutique',
      email: 'traditional@attire.com',
      service: WeddingService.attire,
      style: WeddingStyle.traditional,
      capacity: 0,
      bio: 'Traditional wedding attire',
      rating: 4.7,
      types: [WeddingType.chinese],
    },
    {
      name: 'Glamour Beauty Studio',
      email: 'glamour@makeup.com',
      service: WeddingService.makeup,
      style: WeddingStyle.luxury,
      capacity: 0,
      bio: 'Professional bridal makeup',
      rating: 4.9,
      types: [WeddingType.western],
    },
    {
      name: 'Elegant Touch Makeup',
      email: 'elegant@makeup.com',
      service: WeddingService.makeup,
      style: WeddingStyle.modern,
      capacity: 0,
      bio: 'Modern bridal makeup',
      rating: 4.7,
      types: [WeddingType.western],
    },
    {
      name: 'Luxury Wedding Transport',
      email: 'luxury@transport.com',
      service: WeddingService.transportation,
      style: WeddingStyle.luxury,
      capacity: 0,
      bio: 'Premium transportation',
      rating: 4.8,
      types: [WeddingType.western],
    },
  ];

  for (const vendor of vendorData) {
    await prisma.user.create({
      data: {
        name: vendor.name,
        email: vendor.email,
        password: hashedPassword,
        role: UserRole.vendor,
        vendor: {
          create: {
            vendorWebsite: `https://${vendor.name.toLowerCase().replace(/\s+/g, '-')}.com`,
            uenNumber: `UEN${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            bio: vendor.bio,
            rating: vendor.rating,
            serviceOffered: vendor.service,
            styleOffered: vendor.style,
            weddingTypes: vendor.types,
            capacity: vendor.capacity,
            onboardingStatus: vendor.onboardingStatus,
            isSuspended: vendor.isSuspended,
          },
        },
      },
    });
  }

  console.log('✅ Created 20 vendors');

  const guestNames = [
    'Michael Chen',
    'Linda Chen',
    'James Chen',
    'Grace Chen',
    'Robert Lim',
    'Susan Lim',
    'Daniel Lim',
    'Michelle Lim',
    'Alex Johnson',
    'Sophie Williams',
    'Matt Brown',
    'Jessica Davis',
    'Chris Wilson',
    'Emma Thompson',
    'Jake Miller',
    'Olivia Garcia',
    'Ryan Murphy',
    'Hannah White',
    'Luke Anderson',
    'Chloe Martin',
    'Noah Jackson',
    'Ava Taylor',
    'Ethan Moore',
    'Isabella Clark',
    'Wei Zhang',
    'Mei Li',
    'Jin Wang',
    'Ling Liu',
    'Ahmad Hassan',
    'Fatimah Ibrahim',
    'Arjun Patel',
    'Kavya Singh',
    'Carlos Rodriguez',
    'Maria Gonzalez',
    'Pierre Dubois',
    'Marie Lefebvre',
    'Giovanni Rossi',
    'Francesca Ferrari',
  ];

  const allergies = ['None', 'Peanuts', 'Shellfish', 'Dairy', 'Gluten'];
  const groups = ['Family', 'Friends', 'Colleagues', 'Relatives'];

  for (let i = 0; i < weddings.length; i++) {
    const wedding = weddings[i];
    const primaryGuestCount = 80; // Reduce primary guests to make room for accompanying guests

    for (let j = 0; j < primaryGuestCount; j++) {
      const name = `${guestNames[j % guestNames.length]} ${j > guestNames.length ? j : ''}`;

      // Create primary guest
      const primaryGuest = await prisma.guest.create({
        data: {
          name: name.trim(),
          email: `guest${i + 1}_${j + 1}@example.com`,
          allergies:
            Math.random() > 0.7
              ? allergies[Math.floor(Math.random() * allergies.length)]
              : null,
          group: groups[Math.floor(Math.random() * groups.length)],
          confirmationStatus:
            Math.random() > 0.2
              ? ConfirmationStatus.confirmed
              : ConfirmationStatus.pending,
          weddingId: wedding.id,
        },
      });

      // 30% chance to have accompanying guests
      if (Math.random() < 0.3) {
        const numAccompanying = Math.floor(Math.random() * 3) + 1; // 1-3 accompanying guests

        for (let k = 0; k < numAccompanying; k++) {
          const accompanyingName = `${guestNames[(j + k + 1) % guestNames.length]} ${Math.floor(Math.random() * 100)}`;

          await prisma.guest.create({
            data: {
              name: accompanyingName.trim(),
              email: '', // Accompanying guests often don't have individual emails
              allergies:
                Math.random() > 0.6
                  ? allergies[Math.floor(Math.random() * allergies.length)]
                  : null,
              group: primaryGuest.group, // Same group as primary guest
              confirmationStatus:
                Math.random() > 0.3
                  ? ConfirmationStatus.confirmed
                  : Math.random() > 0.5
                    ? ConfirmationStatus.pending
                    : ConfirmationStatus.rejected,
              weddingId: wedding.id,
              primaryGuestId: primaryGuest.id, // Link to primary guest
            },
          });
        }
      }
    }

    console.log(
      `✅ Created ~${primaryGuestCount} primary guests with accompanying guests for ${wedding.name}`,
    );
  }

  console.log('Database seeded successfully!');
  console.log(`Created:`);
  console.log(`- 1 Super Admin`);
  console.log(`- 10 Admin users (5 couples)`);
  console.log(`- 20 Vendor users`);
  console.log(`- 5 Weddings`);
  console.log(
    `- ~80 primary guests per wedding (some with accompanying guests)`,
  );
  console.log(`- ~30% of primary guests have 1-3 accompanying guests each`);
  console.log(
    `- Accompanying guests have individual confirmation status and dietary requirements`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
