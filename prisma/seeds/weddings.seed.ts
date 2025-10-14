import {
  BudgetBucket,
  GuestCountBucket,
  PrismaClient,
  WeddingService,
  WeddingStyle,
  WeddingType,
} from '@prisma/client';

export async function seedWeddings(prisma: PrismaClient) {
  console.log('✅ Seeding weddings...');

  const weddingThemes = [
    {
      name: "Ryan & Ranae's Enchanted Garden Wedding",
      date: new Date('2024-12-15T14:00:00.000Z'),
      location: 'Marina Bay Grand Ballroom',
      weddingType: WeddingType.WESTERN,
      budgetBucket: BudgetBucket.LUXURY,
      guestCountBucket: GuestCountBucket.LARGE,
      preferredStyle: WeddingStyle.LUXURY,
      preferredServices: [
        WeddingService.VENUE,
        WeddingService.PHOTOGRAPHY,
        WeddingService.CATERING,
        WeddingService.DECORATION,
      ],
      allocatedBudget: 100000,
    },
    {
      name: "Marcus & Sarah's Traditional Chinese Tea Ceremony",
      date: new Date('2024-11-08T10:00:00.000Z'),
      location: 'Heritage Temple Hall',
      weddingType: WeddingType.CHINESE,
      budgetBucket: BudgetBucket.MEDIUM,
      guestCountBucket: GuestCountBucket.LARGE,
      preferredStyle: WeddingStyle.TRADITIONAL,
      preferredServices: [
        WeddingService.VENUE,
        WeddingService.PHOTOGRAPHY,
        WeddingService.CATERING,
      ],
      allocatedBudget: 50000,
    },
    {
      name: "Amir & Siti's Malay Cultural Celebration",
      date: new Date('2024-10-20T16:00:00.000Z'),
      location: 'Garden Paradise Resort',
      weddingType: WeddingType.MALAY,
      budgetBucket: BudgetBucket.MEDIUM,
      guestCountBucket: GuestCountBucket.LARGE,
      preferredStyle: WeddingStyle.TRADITIONAL,
      preferredServices: [
        WeddingService.VENUE,
        WeddingService.PHOTOGRAPHY,
        WeddingService.CATERING,
      ],
      allocatedBudget: 45000,
    },
    {
      name: "Raj & Priya's Grand Indian Wedding",
      date: new Date('2025-01-25T12:00:00.000Z'),
      location: 'Heritage Temple Hall',
      weddingType: WeddingType.INDIAN,
      budgetBucket: BudgetBucket.MEDIUM,
      guestCountBucket: GuestCountBucket.LARGE,
      preferredStyle: WeddingStyle.TRADITIONAL,
      preferredServices: [
        WeddingService.VENUE,
        WeddingService.PHOTOGRAPHY,
        WeddingService.CATERING,
      ],
      allocatedBudget: 60000,
    },
    {
      name: "David & Emma's Modern Beach Wedding",
      date: new Date('2024-09-30T17:00:00.000Z'),
      location: 'Garden Paradise Resort',
      weddingType: WeddingType.WESTERN,
      budgetBucket: BudgetBucket.MEDIUM,
      guestCountBucket: GuestCountBucket.LARGE,
      preferredStyle: WeddingStyle.MODERN,
      preferredServices: [
        WeddingService.VENUE,
        WeddingService.PHOTOGRAPHY,
        WeddingService.CATERING,
      ],
      allocatedBudget: 55000,
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
        allocatedBudget: theme.allocatedBudget,
        notificationDetails: {
          create: {},
        },
      },
    });
    weddings.push(wedding);
  }

  console.log('✅ Created 5 weddings');
  return weddings;
}
