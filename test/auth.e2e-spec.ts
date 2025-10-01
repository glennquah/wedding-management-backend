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
import { EmailNotificationService } from '../src/email-notification/email-notification.service';
import { MockEmailNotificationService } from './mocks/email-notification.service.mock';
import { cleanDatabase, teardownTestApp } from './test-utils';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let testWeddingId: number;
  let mockEmailService: MockEmailNotificationService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailNotificationService)
      .useClass(MockEmailNotificationService)
      .compile();

    app = moduleFixture.createNestApplication();

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

    const prismaService = app.get(PrismaService);
    await cleanDatabase(prismaService);

    // Get the mock email service and clear any previous emails
    mockEmailService = app.get(EmailNotificationService) as MockEmailNotificationService;
    mockEmailService.clearSentEmails();

    // Create a test wedding for admin registration
    const testWeddingData = {
      name: 'Test Wedding for Auth',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      location: 'Test Location',
      weddingType: WeddingType.WESTERN,
      budgetBucket: BudgetBucket.MEDIUM,
      guestCountBucket: GuestCountBucket.MEDIUM,
      preferredStyle: WeddingStyle.MODERN,
      preferredServices: [WeddingService.VENUE, WeddingService.CATERING],
    };

    // Create super admin first to create wedding
    await request(app.getHttpServer())
      .post('/auth/register/super-admin')
      .send({
        name: 'Setup Super Admin',
        email: 'setup-superadmin@test.com',
        password: 'password123',
        role: UserRole.SUPERADMIN,
      })
      .expect(201);

    const superAdminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'setup-superadmin@test.com',
        password: 'password123',
      })
      .expect(201);

    const testWeddingResponse = await request(app.getHttpServer())
      .post('/weddings')
      .set(
        'Authorization',
        `Bearer ${superAdminLoginResponse.body.backendTokens.accessToken}`,
      )
      .send(testWeddingData)
      .expect(201);

    testWeddingId = testWeddingResponse.body.id;
  });

  afterEach(async () => {
    await teardownTestApp(app);
  });

  describe('POST /auth/register/admin', () => {
    it('should create a new admin successfully', async () => {
      const adminData = {
        name: 'New Test Admin',
        email: 'newadmin@test.com',
        password: 'password123',
        role: UserRole.ADMIN,
        isCouple: true,
        weddingId: testWeddingId,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register/admin')
        .send(adminData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(adminData.name);
      expect(response.body.email).toBe(adminData.email);
      expect(response.body.role).toBe(UserRole.ADMIN);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail with duplicate email', async () => {
      // First create an admin
      await request(app.getHttpServer())
        .post('/auth/register/admin')
        .send({
          name: 'First Admin',
          email: 'duplicate@test.com',
          password: 'password123',
          role: UserRole.ADMIN,
          isCouple: true,
          weddingId: testWeddingId,
        })
        .expect(201);

      // Try to create another with same email
      const adminData = {
        name: 'Second Admin',
        email: 'duplicate@test.com',
        password: 'password123',
        role: UserRole.ADMIN,
        isCouple: true,
        weddingId: testWeddingId,
      };

      await request(app.getHttpServer())
        .post('/auth/register/admin')
        .send(adminData)
        .expect(409);
    });

    it('should fail with invalid data', async () => {
      const invalidData = {
        name: 'Test Admin',
        email: 'invalid-email',
        password: '',
      };

      await request(app.getHttpServer())
        .post('/auth/register/admin')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('POST /auth/register/vendor', () => {
    it('should create a new vendor successfully', async () => {
      const vendorData = {
        name: 'New Test Vendor',
        email: 'newvendor@test.com',
        password: 'password123',
        role: UserRole.VENDOR,
        vendorWebsite: 'https://newvendor.com',
        uenNumber: 'NEWVEN123',
        onboardedDate: new Date().toISOString(),
        bio: 'New vendor bio',
        rating: 4.2,
        serviceOffered: WeddingService.PHOTOGRAPHY,
        styleOffered: WeddingStyle.LUXURY,
        weddingTypes: [WeddingType.WESTERN],
        capacity: 150,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register/vendor')
        .send(vendorData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(vendorData.name);
      expect(response.body.email).toBe(vendorData.email);
      expect(response.body.role).toBe(UserRole.VENDOR);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail with duplicate email', async () => {
      // First create a vendor
      await request(app.getHttpServer())
        .post('/auth/register/vendor')
        .send({
          name: 'First Vendor',
          email: 'duplicate-vendor@test.com',
          password: 'password123',
          role: UserRole.VENDOR,
          serviceOffered: WeddingService.VENUE,
          styleOffered: WeddingStyle.MODERN,
          weddingTypes: [WeddingType.CHINESE],
        })
        .expect(201);

      // Try to create another with same email
      const vendorData = {
        name: 'Second Vendor',
        email: 'duplicate-vendor@test.com',
        password: 'password123',
        role: UserRole.VENDOR,
        serviceOffered: WeddingService.CATERING,
        styleOffered: WeddingStyle.LUXURY,
        weddingTypes: [WeddingType.WESTERN],
      };

      await request(app.getHttpServer())
        .post('/auth/register/vendor')
        .send(vendorData)
        .expect(409);
    });
  });

  describe('POST /auth/register/super-admin', () => {
    it('should create a new super admin successfully', async () => {
      const superAdminData = {
        name: 'New Super Admin',
        email: 'newsuperadmin@test.com',
        password: 'password123',
        role: UserRole.SUPERADMIN,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register/super-admin')
        .send(superAdminData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(superAdminData.name);
      expect(response.body.email).toBe(superAdminData.email);
      expect(response.body.role).toBe(UserRole.SUPERADMIN);
      expect(response.body).not.toHaveProperty('password');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create test users for login tests
      await request(app.getHttpServer())
        .post('/auth/register/admin')
        .send({
          name: 'Test Admin',
          email: 'admin@test.com',
          password: 'password123',
          role: UserRole.ADMIN,
          isCouple: true,
          weddingId: testWeddingId,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register/vendor')
        .send({
          name: 'Test Vendor',
          email: 'vendor@test.com',
          password: 'password123',
          role: UserRole.VENDOR,
          serviceOffered: WeddingService.VENUE,
          styleOffered: WeddingStyle.MODERN,
          weddingTypes: [WeddingType.CHINESE],
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register/super-admin')
        .send({
          name: 'Test Super Admin',
          email: 'superadmin@test.com',
          password: 'password123',
          role: UserRole.SUPERADMIN,
        })
        .expect(201);
    });

    it('should login admin successfully', async () => {
      const loginData = {
        username: 'admin@test.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('backendTokens');
      expect(response.body.backendTokens).toHaveProperty('accessToken');
      expect(response.body.backendTokens).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(loginData.username);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should login vendor successfully', async () => {
      const loginData = {
        username: 'vendor@test.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('backendTokens');
      expect(response.body.backendTokens).toHaveProperty('accessToken');
      expect(response.body.backendTokens).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(loginData.username);
    });

    it('should login super admin successfully', async () => {
      const loginData = {
        username: 'superadmin@test.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('backendTokens');
      expect(response.body.user.email).toBe(loginData.username);
    });

    it('should fail with wrong password', async () => {
      const loginData = {
        username: 'admin@test.com',
        password: 'wrongpassword',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    beforeEach(async () => {
      // Create test user for refresh token tests
      await request(app.getHttpServer())
        .post('/auth/register/admin')
        .send({
          name: 'Test Admin',
          email: 'admin@test.com',
          password: 'password123',
          role: UserRole.ADMIN,
          isCouple: true,
          weddingId: testWeddingId,
        })
        .expect(201);
    });

    it('should refresh token successfully', async () => {
      // First login to get refresh token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'admin@test.com',
          password: 'password123',
        })
        .expect(201);

      const refreshToken = loginResponse.body.backendTokens.refreshToken;

      // Wait a moment to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Use refresh token to get new access token
      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Refresh ${refreshToken}`)
        .expect(201);

      expect(refreshResponse.body).toHaveProperty('accessToken');
      expect(refreshResponse.body).toHaveProperty('refreshToken');
      expect(refreshResponse.body.accessToken).not.toBe(
        loginResponse.body.backendTokens.accessToken,
      );
    });

    it('should fail with invalid refresh token', async () => {
      const invalidToken = 'invalid.refresh.token';

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Refresh ${invalidToken}`)
        .expect(401);
    });

    it('should fail without authorization header', async () => {
      await request(app.getHttpServer()).post('/auth/refresh').expect(401);
    });
  });
});
