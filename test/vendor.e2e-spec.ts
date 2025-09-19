import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserRole } from '../src/common/user-role.enum';
import { WeddingService } from '../src/common/wedding-service.enum';
import { WeddingStyle } from '../src/common/wedding-style.enum';
import { WeddingType } from '../src/common/wedding-type.enum';
import { setupTestApp, teardownTestApp } from './test-utils';

describe('Vendor (e2e)', () => {
  let app: INestApplication;
  let vendorToken: string;
  let adminToken: string;
  let superAdminToken: string;
  let createdVendorId: number;
  let createdVendorEmail: string;

  beforeAll(async () => {
    const testAppData = await setupTestApp();
    app = testAppData.app;
    vendorToken = testAppData.jwtTokenVendor;
    adminToken = testAppData.jwtTokenAdmin;
    superAdminToken = testAppData.jwtTokenSuperAdmin;
  });

  afterAll(async () => {
    await teardownTestApp(app);
  });

  describe('POST /vendors', () => {
    it('should create a new vendor successfully', async () => {
      const vendorData = {
        name: 'Test Vendor API',
        email: 'testvendorapi@test.com',
        password: 'password123',
        role: UserRole.VENDOR,
        vendorWebsite: 'https://testvendorapi.com',
        uenNumber: 'TESTAPI123456',
        onboardedDate: new Date().toISOString(),
        bio: 'Test vendor for API testing',
        rating: 4.5,
        serviceOffered: WeddingService.PHOTOGRAPHY,
        styleOffered: WeddingStyle.MODERN,
        weddingTypes: [WeddingType.CHINESE, WeddingType.WESTERN],
        capacity: 200,
      };

      const response = await request(app.getHttpServer())
        .post('/vendors')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(vendorData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(vendorData.name);
      expect(response.body.email).toBe(vendorData.email);
      expect(response.body.role).toBe(UserRole.VENDOR);
      expect(response.body.vendorWebsite).toBe(vendorData.vendorWebsite);
      expect(response.body.uenNumber).toBe(vendorData.uenNumber);
      expect(response.body.bio).toBe(vendorData.bio);
      expect(response.body.rating).toBe(vendorData.rating);
      expect(response.body.serviceOffered).toBe(vendorData.serviceOffered);
      expect(response.body.styleOffered).toBe(vendorData.styleOffered);
      expect(response.body.weddingTypes).toEqual(vendorData.weddingTypes);
      expect(response.body.capacity).toBe(vendorData.capacity);
      expect(response.body).not.toHaveProperty('password');

      createdVendorId = response.body.id;
      createdVendorEmail = response.body.email;
    });

    it('should create vendor with minimal required fields', async () => {
      const vendorData = {
        name: 'Minimal Vendor',
        email: 'minimalvendor@test.com',
        password: 'password123',
        role: UserRole.VENDOR,
        serviceOffered: WeddingService.VENUE,
        styleOffered: WeddingStyle.TRADITIONAL,
        weddingTypes: [WeddingType.MALAY],
      };

      const response = await request(app.getHttpServer())
        .post('/vendors')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(vendorData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(vendorData.name);
      expect(response.body.email).toBe(vendorData.email);
      expect(response.body.serviceOffered).toBe(vendorData.serviceOffered);
      expect(response.body.styleOffered).toBe(vendorData.styleOffered);
      expect(response.body.weddingTypes).toEqual(vendorData.weddingTypes);
    });

    it('should fail to create vendor with duplicate email', async () => {
      const vendorData = {
        name: 'Duplicate Vendor',
        email: createdVendorEmail, // Same email as above
        password: 'password123',
        role: UserRole.VENDOR,
        serviceOffered: WeddingService.CATERING,
        styleOffered: WeddingStyle.LUXURY,
        weddingTypes: [WeddingType.INDIAN],
      };

      await request(app.getHttpServer())
        .post('/vendors')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(vendorData)
        .expect(409);
    });
  });

  describe('POST /vendors/bulk', () => {
    it('should create multiple vendors successfully', async () => {
      const vendorsData = [
        {
          name: 'Bulk Vendor 1',
          email: 'bulkvendor1@test.com',
          password: 'password123',
          role: UserRole.VENDOR,
          serviceOffered: WeddingService.DECORATION,
          styleOffered: WeddingStyle.TRADITIONAL,
          weddingTypes: [WeddingType.CHINESE],
          rating: 4.0,
        },
        {
          name: 'Bulk Vendor 2',
          email: 'bulkvendor2@test.com',
          password: 'password123',
          role: UserRole.VENDOR,
          serviceOffered: WeddingService.ATTIRE,
          styleOffered: WeddingStyle.MODERN,
          weddingTypes: [WeddingType.WESTERN, WeddingType.INDIAN],
          bio: 'Specialized in wedding attire',
        },
      ];

      const response = await request(app.getHttpServer())
        .post('/vendors/bulk')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(vendorsData)
        .expect(201);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe(vendorsData[0].name);
      expect(response.body[1].name).toBe(vendorsData[1].name);
      expect(response.body[0].email).toBe(vendorsData[0].email);
      expect(response.body[1].email).toBe(vendorsData[1].email);
      expect(response.body[0]).not.toHaveProperty('password');
      expect(response.body[1]).not.toHaveProperty('password');
    });
  });

  describe('GET /vendors', () => {
    it('should get all vendors', async () => {
      const response = await request(app.getHttpServer())
        .get('/vendors')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check that each vendor has the required properties
      response.body.forEach((vendor: any) => {
        expect(vendor).toHaveProperty('id');
        expect(vendor).toHaveProperty('name');
        expect(vendor).toHaveProperty('email');
        expect(vendor).toHaveProperty('role');
        expect(vendor.role).toBe(UserRole.VENDOR);
        expect(vendor).toHaveProperty('serviceOffered');
        expect(vendor).toHaveProperty('styleOffered');
        expect(vendor).toHaveProperty('weddingTypes');
        expect(vendor).not.toHaveProperty('password');
      });
    });
  });

  describe('GET /vendors/:id', () => {
    it('should get a specific vendor by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/vendors/${createdVendorId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(createdVendorId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('role');
      expect(response.body.role).toBe(UserRole.VENDOR);
      expect(response.body).toHaveProperty('serviceOffered');
      expect(response.body).not.toHaveProperty('password');
    });
  });

  describe('GET /vendors/email/:email', () => {
    it('should get vendor by email', async () => {
      const response = await request(app.getHttpServer())
        .get(`/vendors/email/${createdVendorEmail}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.email).toBe(createdVendorEmail);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body.role).toBe(UserRole.VENDOR);
    });
  });

  describe('PUT /vendors/:id', () => {
    it('should update a vendor successfully', async () => {
      const updateData = {
        name: 'Updated Vendor Name',
        bio: 'Updated vendor biography',
        rating: 4.8,
        serviceOffered: WeddingService.MAKEUP,
        capacity: 150,
      };

      const response = await request(app.getHttpServer())
        .put(`/vendors/${createdVendorId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.bio).toBe(updateData.bio);
      expect(response.body.rating).toBe(updateData.rating);
      expect(response.body.serviceOffered).toBe(updateData.serviceOffered);
      expect(response.body.capacity).toBe(updateData.capacity);
      expect(response.body.id).toBe(createdVendorId);
    });

    it('should allow vendor to update their own profile', async () => {
      const updateData = {
        bio: 'Self-updated vendor bio',
        vendorWebsite: 'https://updated-website.com',
      };

      const response = await request(app.getHttpServer())
        .put(`/vendors/${createdVendorId}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.bio).toBe(updateData.bio);
      expect(response.body.vendorWebsite).toBe(updateData.vendorWebsite);
    });
  });

  describe('DELETE /vendors/delete-self', () => {
    it('should allow vendor to delete their own profile with correct password', async () => {
      // First create a vendor to delete
      const vendorToDelete = {
        name: 'Vendor To Self Delete',
        email: 'vendorselfdelete@test.com',
        password: 'password123',
        role: UserRole.VENDOR,
        serviceOffered: WeddingService.TRANSPORTATION,
        styleOffered: WeddingStyle.MODERN,
        weddingTypes: [WeddingType.WESTERN],
      };

      const createResponse = await request(app.getHttpServer())
        .post('/vendors')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(vendorToDelete)
        .expect(201);

      // Login to get the new vendor's token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: vendorToDelete.email,
          password: vendorToDelete.password,
        })
        .expect(200);

      const newVendorToken = loginResponse.body.accessToken;

      // Delete own profile with correct password
      await request(app.getHttpServer())
        .delete('/vendors/delete-self')
        .set('Authorization', `Bearer ${newVendorToken}`)
        .send({ password: vendorToDelete.password })
        .expect(200);

      // Verify the vendor is deleted by trying to login again
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: vendorToDelete.email,
          password: vendorToDelete.password,
        })
        .expect(401);
    });

    it('should reject delete-self with incorrect password', async () => {
      await request(app.getHttpServer())
        .delete('/vendors/delete-self')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ password: 'wrongpassword' })
        .expect(401);
    });

    it('should reject delete-self without password', async () => {
      await request(app.getHttpServer())
        .delete('/vendors/delete-self')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('DELETE /vendors/:id', () => {
    it('should delete a vendor successfully (super admin only)', async () => {
      // First create a vendor to delete
      const vendorToDelete = {
        name: 'Vendor To Delete',
        email: 'vendortodelete@test.com',
        password: 'password123',
        role: UserRole.VENDOR,
        serviceOffered: WeddingService.TRANSPORTATION,
        styleOffered: WeddingStyle.LUXURY,
        weddingTypes: [WeddingType.WESTERN],
      };

      const createResponse = await request(app.getHttpServer())
        .post('/vendors')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(vendorToDelete)
        .expect(201);

      const vendorId = createResponse.body.id;

      // Delete the vendor
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/vendors/${vendorId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(deleteResponse.body).toHaveProperty('message');
      expect(deleteResponse.body.message).toBe('Vendor successfully deleted');

      // Verify the vendor is deleted
      await request(app.getHttpServer())
        .get(`/vendors/${vendorId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
