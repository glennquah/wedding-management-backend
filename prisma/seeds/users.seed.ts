import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export async function seedUsers(prisma: PrismaClient) {
  console.log('✅ Seeding users...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create SuperAdmin
  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'superadmin@wedding.com',
      password: hashedPassword,
      role: UserRole.SUPERADMIN,
      superAdmin: {
        create: {},
      },
    },
  });

  console.log('✅ Created 1 Super Admin');
  return hashedPassword;
}
