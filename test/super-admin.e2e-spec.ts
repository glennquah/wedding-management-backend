import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRole } from '../src/common/user-role.enum';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  authenticateUsers,
  cleanDatabase,
  teardownTestApp,
} from './test-utils';

describe('SuperAdmin (e2e)', () => {
  let app: INestApplication;
  let superAdminToken: string;
  let createdSuperAdminId: number;

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
    superAdminToken = authData.jwtTokenSuperAdmin;
  });

  afterAll(async () => {
    await teardownTestApp(app);
  });

  describe('POST /super-admins', () => {
    it('should create a new super admin successfully', async () => {
      const superAdminData = {
        name: 'Test SuperAdmin API',
        email: 'testsuperadminapi@test.com',
        password: 'password123',
        role: UserRole.SUPERADMIN,
      };

      const response = await request(app.getHttpServer())
        .post('/super-admins')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(superAdminData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(superAdminData.name);
      expect(response.body.email).toBe(superAdminData.email);
      expect(response.body.role).toBe(UserRole.SUPERADMIN);
      expect(response.body).not.toHaveProperty('password');

      createdSuperAdminId = response.body.id;
    });

    it('should fail to create super admin with duplicate email', async () => {
      const superAdminData = {
        name: 'Duplicate SuperAdmin',
        email: 'testsuperadminapi@test.com', // Same email as above
        password: 'password123',
        role: UserRole.SUPERADMIN,
      };

      await request(app.getHttpServer())
        .post('/super-admins')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(superAdminData)
        .expect(409);
    });

    it('should fail to create super admin with missing required fields', async () => {
      const invalidSuperAdminData = {
        name: 'Invalid SuperAdmin',
        // Missing email and password
        role: UserRole.SUPERADMIN,
      };

      await request(app.getHttpServer())
        .post('/super-admins')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(invalidSuperAdminData)
        .expect(400);
    });

    it('should fail to create super admin without authentication', async () => {
      const superAdminData = {
        name: 'Unauthorized SuperAdmin',
        email: 'unauthorized@test.com',
        password: 'password123',
        role: UserRole.SUPERADMIN,
      };

      await request(app.getHttpServer())
        .post('/super-admins')
        .send(superAdminData)
        .expect(401);
    });
  });

  describe('POST /super-admins/bulk', () => {
    it('should create multiple super admins successfully', async () => {
      const superAdminsData = [
        {
          name: 'Bulk SuperAdmin 1',
          email: 'bulksuperadmin1@test.com',
          password: 'password123',
          role: UserRole.SUPERADMIN,
        },
        {
          name: 'Bulk SuperAdmin 2',
          email: 'bulksuperadmin2@test.com',
          password: 'password123',
          role: UserRole.SUPERADMIN,
        },
      ];

      const response = await request(app.getHttpServer())
        .post('/super-admins/bulk')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(superAdminsData)
        .expect(201);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe(superAdminsData[0].name);
      expect(response.body[1].name).toBe(superAdminsData[1].name);
      expect(response.body[0].email).toBe(superAdminsData[0].email);
      expect(response.body[1].email).toBe(superAdminsData[1].email);
      expect(response.body[0]).not.toHaveProperty('password');
      expect(response.body[1]).not.toHaveProperty('password');
    });
  });

  describe('GET /super-admins', () => {
    it('should get all super admins', async () => {
      const response = await request(app.getHttpServer())
        .get('/super-admins')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(201);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check that each super admin has the required properties
      response.body.forEach((superAdmin: any) => {
        expect(superAdmin).toHaveProperty('id');
        expect(superAdmin).toHaveProperty('name');
        expect(superAdmin).toHaveProperty('email');
        expect(superAdmin).toHaveProperty('role');
        expect(superAdmin.role).toBe(UserRole.SUPERADMIN);
        expect(superAdmin).not.toHaveProperty('password');
      });
    });

    it('should fail to get super admins without authentication', async () => {
      await request(app.getHttpServer()).get('/super-admins').expect(401);
    });
  });

  describe('GET /super-admins/:id', () => {
    it('should get a specific super admin by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/super-admins/${createdSuperAdminId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(201);

      expect(response.body.id).toBe(createdSuperAdminId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('role');
      expect(response.body.role).toBe(UserRole.SUPERADMIN);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent super admin', async () => {
      await request(app.getHttpServer())
        .get('/super-admins/99999')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(404);
    });
  });

  describe('GET /super-admins/email/:email', () => {
    it('should get super admin by email', async () => {
      const response = await request(app.getHttpServer())
        .get('/super-admins/email/testsuperadminapi@test.com')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(201);

      expect(response.body.email).toBe('testsuperadminapi@test.com');
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body.role).toBe(UserRole.SUPERADMIN);
    });

    it('should return 404 for non-existent email', async () => {
      await request(app.getHttpServer())
        .get('/super-admins/email/nonexistent@test.com')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(404);
    });
  });

  describe('PUT /super-admins/:id', () => {
    it('should update a super admin successfully', async () => {
      const updateData = {
        name: 'Updated SuperAdmin Name',
        email: 'updatedsuperadmin@test.com',
      };

      const response = await request(app.getHttpServer())
        .put(`/super-admins/${createdSuperAdminId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(updateData)
        .expect(201);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.email).toBe(updateData.email);
      expect(response.body.id).toBe(createdSuperAdminId);
      expect(response.body.role).toBe(UserRole.SUPERADMIN);
    });

    it('should return 404 when updating non-existent super admin', async () => {
      const updateData = {
        name: 'Non-existent SuperAdmin',
      };

      await request(app.getHttpServer())
        .put('/super-admins/99999')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(updateData)
        .expect(404);
    });

    it('should fail to update super admin email to existing email', async () => {
      // First create another super admin
      const anotherSuperAdmin = {
        name: 'Another SuperAdmin',
        email: 'anothersuperadmin@test.com',
        password: 'password123',
        role: UserRole.SUPERADMIN,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/super-admins')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(anotherSuperAdmin)
        .expect(201);

      // Try to update the created super admin's email to an existing one
      const updateData = {
        email: 'updatedsuperadmin@test.com', // Email that already exists
      };

      await request(app.getHttpServer())
        .put(`/super-admins/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(updateData)
        .expect(409);
    });
  });

  describe('DELETE /super-admins/:id', () => {
    it('should delete a super admin successfully', async () => {
      // First create a super admin to delete
      const superAdminToDelete = {
        name: 'SuperAdmin To Delete',
        email: 'superadmintodelete@test.com',
        password: 'password123',
        role: UserRole.SUPERADMIN,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/super-admins')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(superAdminToDelete)
        .expect(201);

      const superAdminId = createResponse.body.id;

      // Delete the super admin
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/super-admins/${superAdminId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(201);

      expect(deleteResponse.body).toHaveProperty('message');
      expect(deleteResponse.body.message).toBe(
        'Super admin successfully deleted',
      );

      // Verify the super admin is deleted
      await request(app.getHttpServer())
        .get(`/super-admins/${superAdminId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent super admin', async () => {
      await request(app.getHttpServer())
        .delete('/super-admins/99999')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(404);
    });
  });
});
