import { INestApplication } from '@nestjs/common';
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
import {
  authenticateUsers,
  cleanDatabase,
  teardownTestApp,
} from './test-utils';

describe('Admin (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let createdAdminId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const prismaService = app.get(PrismaService);
    await cleanDatabase(prismaService);

    // Create and authenticate users
    const authData = await authenticateUsers(app);
    adminToken = authData.jwtTokenAdmin;
  });

  afterAll(async () => {
    await teardownTestApp(app);
  });

  describe('POST /admins', () => {
    it('should create a new admin successfully', async () => {
      const adminData = {
        name: 'Test Admin API',
        email: 'testadminapi@test.com',
        password: 'password123',
        role: UserRole.ADMIN,
        isCouple: true,
        onboardedDate: new Date().toISOString(),
        weddingType: WeddingType.CHINESE,
        budgetBucket: BudgetBucket.MEDIUM,
        guestCountBucket: GuestCountBucket.MEDIUM,
        preferredStyle: WeddingStyle.MODERN,
        preferredServices: [WeddingService.VENUE, WeddingService.CATERING],
      };

      const response = await request(app.getHttpServer())
        .post('/admins')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adminData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(adminData.name);
      expect(response.body.email).toBe(adminData.email);
      expect(response.body.role).toBe(UserRole.ADMIN);
      expect(response.body.isCouple).toBe(adminData.isCouple);
      expect(response.body.weddingType).toBe(adminData.weddingType);
      expect(response.body.budgetBucket).toBe(adminData.budgetBucket);
      expect(response.body.guestCountBucket).toBe(adminData.guestCountBucket);
      expect(response.body.preferredStyle).toBe(adminData.preferredStyle);
      expect(response.body.preferredServices).toEqual(
        adminData.preferredServices,
      );
      expect(response.body).not.toHaveProperty('password');

      createdAdminId = response.body.id;
    });

    it('should fail to create admin with duplicate email', async () => {
      const adminData = {
        name: 'Duplicate Admin',
        email: 'testadminapi@test.com',
        password: 'password123',
        role: UserRole.ADMIN,
        isCouple: false,
        onboardedDate: new Date().toISOString(),
        weddingType: WeddingType.WESTERN,
        budgetBucket: BudgetBucket.HIGH,
        guestCountBucket: GuestCountBucket.LARGE,
        preferredStyle: WeddingStyle.LUXURY,
        preferredServices: [WeddingService.PHOTOGRAPHY],
      };

      await request(app.getHttpServer())
        .post('/admins')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adminData)
        .expect(409);
    });

    it('should fail to create admin with missing required fields', async () => {
      const invalidAdminData = {
        name: 'Invalid Admin',
        email: 'invalidadmin@test.com',
        password: 'password123',
        role: UserRole.ADMIN,
      };

      await request(app.getHttpServer())
        .post('/admins')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidAdminData)
        .expect(400);
    });

    it('should fail to create admin without authentication', async () => {
      const adminData = {
        name: 'Unauthorized Admin',
        email: 'unauthorized@test.com',
        password: 'password123',
        role: UserRole.ADMIN,
        isCouple: true,
        onboardedDate: new Date().toISOString(),
        weddingType: WeddingType.CHINESE,
        budgetBucket: BudgetBucket.MEDIUM,
        guestCountBucket: GuestCountBucket.MEDIUM,
        preferredStyle: WeddingStyle.MODERN,
        preferredServices: [WeddingService.VENUE],
      };

      await request(app.getHttpServer())
        .post('/admins')
        .send(adminData)
        .expect(401);
    });
  });

  describe('POST /admins/bulk', () => {
    it('should create multiple admins successfully', async () => {
      const adminsData = [
        {
          name: 'Bulk Admin 1',
          email: 'bulkadmin1@test.com',
          password: 'password123',
          role: UserRole.ADMIN,
          isCouple: true,
          onboardedDate: new Date().toISOString(),
          weddingType: WeddingType.CHINESE,
          budgetBucket: BudgetBucket.LOW,
          guestCountBucket: GuestCountBucket.SMALL,
          preferredStyle: WeddingStyle.TRADITIONAL,
          preferredServices: [WeddingService.VENUE],
        },
        {
          name: 'Bulk Admin 2',
          email: 'bulkadmin2@test.com',
          password: 'password123',
          role: UserRole.ADMIN,
          isCouple: false,
          onboardedDate: new Date().toISOString(),
          weddingType: WeddingType.WESTERN,
          budgetBucket: BudgetBucket.HIGH,
          guestCountBucket: GuestCountBucket.LARGE,
          preferredStyle: WeddingStyle.MODERN,
          preferredServices: [
            WeddingService.CATERING,
            WeddingService.PHOTOGRAPHY,
          ],
        },
      ];

      const response = await request(app.getHttpServer())
        .post('/admins/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adminsData)
        .expect(201);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe(adminsData[0].name);
      expect(response.body[1].name).toBe(adminsData[1].name);
      expect(response.body[0].email).toBe(adminsData[0].email);
      expect(response.body[1].email).toBe(adminsData[1].email);
    });
  });

  describe('GET /admins', () => {
    it('should get all admins', async () => {
      const response = await request(app.getHttpServer())
        .get('/admins')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check that each admin has the required properties
      response.body.forEach((admin: any) => {
        expect(admin).toHaveProperty('id');
        expect(admin).toHaveProperty('name');
        expect(admin).toHaveProperty('email');
        expect(admin).toHaveProperty('role');
        expect(admin).not.toHaveProperty('password');
      });
    });

    it('should fail to get admins without authentication', async () => {
      await request(app.getHttpServer()).get('/admins').expect(401);
    });
  });

  describe('GET /admins/:id', () => {
    it('should get a specific admin by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/admins/${createdAdminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      expect(response.body.id).toBe(createdAdminId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('role');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent admin', async () => {
      await request(app.getHttpServer())
        .get('/admins/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('GET /admins/email/:email', () => {
    it('should get admin by email', async () => {
      const response = await request(app.getHttpServer())
        .get('/admins/email/testadminapi@test.com')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      expect(response.body.email).toBe('testadminapi@test.com');
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
    });

    it('should return 404 for non-existent email', async () => {
      await request(app.getHttpServer())
        .get('/admins/email/nonexistent@test.com')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PUT /admins/:id', () => {
    it('should update an admin successfully', async () => {
      const updateData = {
        name: 'Updated Admin Name',
        budgetBucket: BudgetBucket.LUXURY,
        preferredStyle: WeddingStyle.RUSTIC,
      };

      const response = await request(app.getHttpServer())
        .put(`/admins/${createdAdminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(201);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.budgetBucket).toBe(updateData.budgetBucket);
      expect(response.body.preferredStyle).toBe(updateData.preferredStyle);
      expect(response.body.id).toBe(createdAdminId);
    });

    it('should return 404 when updating non-existent admin', async () => {
      const updateData = {
        name: 'Non-existent Admin',
      };

      await request(app.getHttpServer())
        .put('/admins/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /admins/:id', () => {
    it('should delete an admin successfully', async () => {
      // First create an admin to delete
      const adminToDelete = {
        name: 'Admin To Delete',
        email: 'admintodelete@test.com',
        password: 'password123',
        role: UserRole.ADMIN,
        isCouple: true,
        onboardedDate: new Date().toISOString(),
        weddingType: WeddingType.MALAY,
        budgetBucket: BudgetBucket.MEDIUM,
        guestCountBucket: GuestCountBucket.MEDIUM,
        preferredStyle: WeddingStyle.TRADITIONAL,
        preferredServices: [WeddingService.MUSIC],
      };

      const createResponse = await request(app.getHttpServer())
        .post('/admins')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adminToDelete)
        .expect(201);

      const adminId = createResponse.body.id;

      // Delete the admin
      await request(app.getHttpServer())
        .delete(`/admins/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      // Verify the admin is deleted
      await request(app.getHttpServer())
        .get(`/admins/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent admin', async () => {
      await request(app.getHttpServer())
        .delete('/admins/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
