import { PrismaClient, UserRole, Wedding } from '@prisma/client';

export async function seedCouples(
  prisma: PrismaClient,
  weddings: Wedding[],
  hashedPassword: string,
) {
  console.log('✅ Seeding couples...');

  const couples = [
    {
      name1: 'Ryan Chen',
      email1: 'couple@wedding.com',
      name2: 'Ranae Lim',
      email2: 'ranae.lim@email.com',
      weddingIndex: 0,
    },
    {
      name1: 'Glenn Quah',
      email1: 'quah.glenn@gmail.com',
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

  for (const couple of couples) {
    const wedding = weddings[couple.weddingIndex];
    const [user1, user2] = await Promise.all([
      prisma.user.create({
        data: {
          name: couple.name1,
          email: couple.email1,
          password: hashedPassword,
          role: UserRole.ADMIN,
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
          role: UserRole.ADMIN,
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
  }

  console.log('✅ Created couples and associated with weddings');
}
