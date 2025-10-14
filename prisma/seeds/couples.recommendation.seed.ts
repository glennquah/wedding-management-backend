import { PrismaClient, UserRole, Wedding } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedRecommendationCouples(
  prisma: PrismaClient,
  weddings: Wedding[],
  hashedPassword: string,
) {
  // Set deterministic seed for consistent data generation across runs
  faker.seed(54321);

  console.log('✅ Seeding 1000 recommendation couples (2000 admins)...');

  const coupleUsers = [];
  const batchSize = 50; // Process in batches to avoid overwhelming DB

  for (let i = 0; i < 1000; i++) {
    // Each couple gets one wedding (1:1 mapping for simplicity)
    const wedding = weddings[i];

    // Generate couple names
    const firstName1 = faker.person.firstName();
    const lastName1 = faker.person.lastName();
    const firstName2 = faker.person.firstName();
    const lastName2 = faker.person.lastName();

    // Create both users in the couple
    const [user1, user2] = await Promise.all([
      prisma.user.create({
        data: {
          name: `${firstName1} ${lastName1}`,
          email: `couple${i}_person1@recommendation.com`,
          password: hashedPassword,
          role: UserRole.ADMIN,
          admin: {
            create: {
              isSuspended: false,
              mainWeddingId: wedding.id,
            },
          },
        },
      }),
      prisma.user.create({
        data: {
          name: `${firstName2} ${lastName2}`,
          email: `couple${i}_person2@recommendation.com`,
          password: hashedPassword,
          role: UserRole.ADMIN,
          admin: {
            create: {
              isSuspended: false,
              mainWeddingId: wedding.id,
            },
          },
        },
      }),
    ]);

    // Associate couple with their wedding as both admins and main couple
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

    coupleUsers.push({ user1, user2 });

    // Progress logging every batch
    if ((i + 1) % batchSize === 0) {
      console.log(`   Created ${i + 1}/1000 couples...`);
    }
  }

  console.log('✅ Created 1000 couples (2000 admins) and associated with weddings');
  return coupleUsers;
}
