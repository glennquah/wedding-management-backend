import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserRole } from '../src/common/user-role.enum';
import { setupTestApp, teardownTestApp } from './test-utils';

describe('SuperAdmin (e2e)', () => {
  let app: INestApplication;
  let superAdminToken: string;
  let createdSuperAdminId: number;
  let createdSuperAdminEmail: string;

  beforeAll(async () => {
    const testAppData = await setupTestApp();
    app = testAppData.app;
    superAdminToken = testAppData.jwtTokenSuperAdmin;
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
      createdSuperAdminEmail = response.body.email;
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
        .expect(200);

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
  });

  describe('GET /super-admins/:id', () => {
    it('should get a specific super admin by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/super-admins/${createdSuperAdminId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.id).toBe(createdSuperAdminId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('role');
      expect(response.body.role).toBe(UserRole.SUPERADMIN);
      expect(response.body).not.toHaveProperty('password');
    });
  });

  describe('GET /super-admins/email/:email', () => {
    it('should get super admin by email', async () => {
      const response = await request(app.getHttpServer())
        .get(`/super-admins/email/${createdSuperAdminEmail}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.email).toBe(createdSuperAdminEmail);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body.role).toBe(UserRole.SUPERADMIN);
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
        .expect(200);

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

      const deleteResponse = await request(app.getHttpServer())
        .delete(`/super-admins/${superAdminId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

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
  });
});
