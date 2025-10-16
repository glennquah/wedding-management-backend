import { PrismaClient, UserRole, Wedding } from '@prisma/client';

export async function seedCouples(
  prisma: PrismaClient,
  weddings: Wedding[],
  hashedPassword: string,
) {
  console.log('✅ Seeding couples...');

  // Now create the couple users and associate them with weddings
  const couples = [
    {
      name1: 'Ryan Chen',
      email1: 'couple@wedding.com',
      name2: 'Ranae Lim',
      email2: 'ranae.lim@email.com',
      weddingIndex: 0,
      weddings: [1, 2, 3],
    },
    {
      name1: 'Glenn Quah',
      email1: 'quah.glenn@gmail.com',
      name2: 'Sarah Wong',
      email2: 'sarah.wong@email.com',
      weddings: [1, 2, 3],
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

  // Create couples over a 9-month period to show growth over time
  const numberOfMonths = 9;
  const couplesPerMonth = Math.ceil(couples.length / numberOfMonths);

  const coupleUsers = [];
  for (let i = 0; i < couples.length; i++) {
    const couple = couples[i];
    const mainWeddingId =
      couple.weddingIndex !== undefined
        ? weddings[couple.weddingIndex].id
        : null;

    // Calculate which month this couple should be created in (older to newer)
    const monthIndex = Math.floor(i / couplesPerMonth);
    const monthsAgo = numberOfMonths - 1 - monthIndex;

    // Generate a date within that month
    const createdDate = new Date();
    createdDate.setMonth(createdDate.getMonth() - monthsAgo);
    createdDate.setDate(Math.floor(Math.random() * 28) + 1); // Random day in month
    createdDate.setHours(Math.floor(Math.random() * 24));
    createdDate.setMinutes(Math.floor(Math.random() * 60));

    const [user1, user2] = await Promise.all([
      prisma.user.create({
        data: {
          name: couple.name1,
          email: couple.email1,
          password: hashedPassword,
          role: UserRole.ADMIN,
          createdAt: createdDate,
          admin: {
            create: {
              isSuspended: couple.isSuspended || false,
              mainWeddingId: mainWeddingId,
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
          createdAt: createdDate,
          admin: {
            create: {
              isSuspended: couple.isSuspended || false,
              mainWeddingId: mainWeddingId,
            },
          },
        },
      }),
    ]);

    if (couple.weddingIndex !== undefined) {
      const wedding = weddings[couple.weddingIndex];
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

    if (couple.weddings && couple.weddings.length > 0) {
      for (const additionalWeddingIndex of couple.weddings) {
        if (
          additionalWeddingIndex !== couple.weddingIndex &&
          weddings[additionalWeddingIndex]
        ) {
          await prisma.wedding.update({
            where: { id: weddings[additionalWeddingIndex].id },
            data: {
              admins: {
                connect: [{ userId: user1.id }, { userId: user2.id }],
              },
            },
          });
        }
      }
    }
  }
  console.log(`✅ Created ${couples.length} couples distributed over ${numberOfMonths} months and associated with weddings`);
}
