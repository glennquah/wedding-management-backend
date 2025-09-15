import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { BudgetBucket } from '../src/common/budget-bucket.enum';
import { GuestCountBucket } from '../src/common/guest-count-bucket.enum';
import { UserRole } from '../src/common/user-role.enum';
import { WeddingService } from '../src/common/wedding-service.enum';
import { WeddingStyle } from '../src/common/wedding-style.enum';
import { WeddingType } from '../src/common/wedding-type.enum';
import { PrismaService } from '../src/prisma/prisma.service';

export async function setupTestApp(): Promise<{
  app: INestApplication;
  jwtTokenSuperAdmin: string;
  jwtTokenAdmin: string;
  jwtTokenVendor: string;
  superAdminId: string;
  adminId: string;
  vendorId: string;
  testWeddingId: number;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Add ValidationPipe to test app
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
      dismissDefaultMessages: false,
      validationError: {
        target: false,
      },
    }),
  );

  await app.init();

  // Connect to test db & clean database
  const prismaService = app.get(PrismaService);
  await cleanDatabase(prismaService);

  const {
    jwtTokenSuperAdmin,
    jwtTokenAdmin,
    jwtTokenVendor,
    superAdminId,
    adminId,
    vendorId,
    testWeddingId,
  } = await authenticateUsers(app);

  return {
    app,
    jwtTokenSuperAdmin,
    jwtTokenAdmin,
    jwtTokenVendor,
    superAdminId,
    adminId,
    vendorId,
    testWeddingId,
  };
}

export async function authenticateUsers(app: INestApplication): Promise<{
  jwtTokenSuperAdmin: string;
  jwtTokenAdmin: string;
  jwtTokenVendor: string;
  superAdminId: string;
  adminId: string;
  vendorId: string;
  testWeddingId: number;
}> {
  // Use unique email addresses for each test run with random suffix
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 15);

  // Create and authenticate super admin
  const superAdminData = {
    name: 'Test Super Admin',
    email: `superadmin-${timestamp}-${randomSuffix}@test.com`,
    password: 'password123',
    role: UserRole.SUPERADMIN,
  };

  const superAdminResponse = await request(app.getHttpServer())
    .post('/auth/register/super-admin')
    .send(superAdminData)
    .expect(201);

  const superAdminLoginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      username: superAdminData.email,
      password: superAdminData.password,
    })
    .expect(201);

  // First create a wedding
  const testWeddingData = {
    name: 'Test Wedding for Setup',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    location: 'Test Location',
    weddingType: WeddingType.CHINESE,
    budgetBucket: BudgetBucket.MEDIUM,
    guestCountBucket: GuestCountBucket.MEDIUM,
    preferredStyle: WeddingStyle.MODERN,
    preferredServices: [WeddingService.VENUE, WeddingService.CATERING],
  };

  const testWeddingResponse = await request(app.getHttpServer())
    .post('/weddings')
    .set(
      'Authorization',
      `Bearer ${superAdminLoginResponse.body.backendTokens.accessToken}`,
    )
    .send(testWeddingData)
    .expect(201);

  // Create and authenticate admin with wedding reference
  const adminData = {
    name: 'Test Admin',
    email: `admin-${timestamp}-${randomSuffix}@test.com`,
    password: 'password123',
    role: UserRole.ADMIN,
    isCouple: true,
    onboardedDate: new Date().toISOString(),
    weddingId: testWeddingResponse.body.id,
  };

  const adminResponse = await request(app.getHttpServer())
    .post('/auth/register/admin')
    .send(adminData)
    .expect(201);

  const adminLoginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      username: adminData.email,
      password: adminData.password,
    })
    .expect(201);

  // Create and authenticate vendor
  const vendorData = {
    name: 'Test Vendor',
    email: `vendor-${timestamp}-${randomSuffix}@test.com`,
    password: 'password123',
    role: UserRole.VENDOR,
    vendorWebsite: 'https://testvendor.com',
    uenNumber: 'TEST123456',
    onboardedDate: new Date().toISOString(),
    bio: 'Test vendor bio',
    rating: 4.5,
    serviceOffered: WeddingService.VENUE,
    styleOffered: WeddingStyle.MODERN,
    weddingTypes: [WeddingType.CHINESE, WeddingType.WESTERN],
    capacity: 200,
  };

  const vendorResponse = await request(app.getHttpServer())
    .post('/auth/register/vendor')
    .send(vendorData)
    .expect(201);

  const vendorLoginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      username: vendorData.email,
      password: vendorData.password,
    })
    .expect(201);

  return {
    jwtTokenSuperAdmin: superAdminLoginResponse.body.backendTokens.accessToken,
    jwtTokenAdmin: adminLoginResponse.body.backendTokens.accessToken,
    jwtTokenVendor: vendorLoginResponse.body.backendTokens.accessToken,
    superAdminId: superAdminResponse.body.id,
    adminId: adminResponse.body.id,
    vendorId: vendorResponse.body.id,
    testWeddingId: testWeddingResponse.body.id,
  };
}

export async function seedWeddings(
  app: INestApplication,
  adminId: string,
  count: number = 3,
  authToken?: string,
) {
  const weddings = [];
  for (let i = 1; i <= count; i++) {
    const weddingData = {
      name: `Test Wedding ${i}`,
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(), // i days from now
      location: `Test Location ${i}`,
      weddingType: WeddingType.WESTERN,
      budgetBucket: BudgetBucket.MEDIUM,
      guestCountBucket: GuestCountBucket.MEDIUM,
      preferredStyle: WeddingStyle.MODERN,
      preferredServices: [WeddingService.VENUE, WeddingService.CATERING],
    };

    const requestBuilder = request(app.getHttpServer()).post('/weddings');

    if (authToken) {
      requestBuilder.set('Authorization', `Bearer ${authToken}`);
    }

    const response = await requestBuilder.send(weddingData);

    weddings.push(response.body);
  }
  return weddings;
}

export async function seedVendors(
  app: INestApplication,
  count: number = 3,
): Promise<any[]> {
  const vendors = [];
  const timestamp = Date.now();
  const services = [
    WeddingService.VENUE,
    WeddingService.CATERING,
    WeddingService.PHOTOGRAPHY,
  ];
  const styles = [
    WeddingStyle.MODERN,
    WeddingStyle.TRADITIONAL,
    WeddingStyle.LUXURY,
  ];

  for (let i = 1; i <= count; i++) {
    const vendorData = {
      name: `Test Vendor ${i}`,
      email: `vendor${i}-${timestamp}@test.com`,
      password: 'password123',
      role: UserRole.VENDOR,
      vendorWebsite: `https://testvendor${i}.com`,
      uenNumber: `TEST12345${i}`,
      onboardedDate: new Date().toISOString(),
      bio: `Test vendor ${i} bio`,
      rating: 4.0 + i * 0.1,
      serviceOffered: services[i - 1] || WeddingService.VENUE,
      styleOffered: styles[i - 1] || WeddingStyle.MODERN,
      weddingTypes: [WeddingType.CHINESE, WeddingType.WESTERN],
      capacity: 100 + i * 50,
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register/vendor')
      .send(vendorData)
      .expect(201);

    vendors.push(response.body);
  }
  return vendors;
}

export async function seedAdmins(
  app: INestApplication,
  count: number = 2,
): Promise<any[]> {
  const admins = [];
  const timestamp = Date.now();
  const weddingTypes = [WeddingType.CHINESE, WeddingType.WESTERN];
  const budgets = [BudgetBucket.LOW, BudgetBucket.MEDIUM];

  for (let i = 1; i <= count; i++) {
    const adminData = {
      name: `Test Admin ${i}`,
      email: `admin${i}-${timestamp}@test.com`,
      password: 'password123',
      role: UserRole.ADMIN,
      isCouple: i % 2 === 1, // Alternate between couple and single
      onboardedDate: new Date().toISOString(),
      weddingType: weddingTypes[i - 1] || WeddingType.CHINESE,
      budgetBucket: budgets[i - 1] || BudgetBucket.MEDIUM,
      guestCountBucket: GuestCountBucket.MEDIUM,
      preferredStyle: WeddingStyle.MODERN,
      preferredServices: [WeddingService.VENUE, WeddingService.CATERING],
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register/admin')
      .send(adminData)
      .expect(201);

    admins.push(response.body);
  }
  return admins;
}

export async function seedSuperAdmins(
  app: INestApplication,
  count: number = 1,
): Promise<any[]> {
  const superAdmins = [];
  const timestamp = Date.now();

  for (let i = 1; i <= count; i++) {
    const superAdminData = {
      name: `Test Super Admin ${i}`,
      email: `superadmin${i}-${timestamp}@test.com`,
      password: 'password123',
      role: UserRole.SUPERADMIN,
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register/super-admin')
      .send(superAdminData)
      .expect(201);

    superAdmins.push(response.body);
  }
  return superAdmins;
}

export async function seedGuests(
  app: INestApplication,
  weddingId: string,
  count: number = 5,
  authToken?: string,
): Promise<any[]> {
  const guests = [];

  for (let i = 1; i <= count; i++) {
    const guestData = {
      name: `Test Guest ${i}`,
      allergies: i % 3 === 0 ? 'Nuts' : null, // Every 3rd guest has allergies
      group: i <= 2 ? 'Family' : 'Friends', // First 2 are family
      weddingId: parseInt(weddingId),
    };

    const request_builder = request(app.getHttpServer()).post('/guests');

    if (authToken) {
      request_builder.set('Authorization', `Bearer ${authToken}`);
    }

    const response = await request_builder.send(guestData).expect(201);

    guests.push(response.body);
  }
  return guests;
}

export async function cleanDatabase(prismaService: PrismaService) {
  // Use raw SQL to truncate tables in proper order
  const tableNames = [
    'Guest',
    'Wedding',
    'Admin',
    'Vendor',
    'SuperAdmin',
    'User',
  ];

  for (const tableName of tableNames) {
    await prismaService.$executeRawUnsafe(
      `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`,
    );
  }
}

export async function teardownTestApp(app: INestApplication) {
  if (app) {
    const prismaService = app.get(PrismaService);
    await cleanDatabase(prismaService);
    await app.close();
  }
}
