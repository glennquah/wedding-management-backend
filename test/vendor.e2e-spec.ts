import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
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

describe('Vendor (e2e)', () => {
  let app: INestApplication;
  let vendorToken: string;
  let adminToken: string;
  let superAdminToken: string;
  let createdVendorId: number;

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
    vendorToken = authData.jwtTokenVendor;
    adminToken = authData.jwtTokenAdmin;
    superAdminToken = authData.jwtTokenSuperAdmin;
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
        email: 'testvendorapi@test.com', // Same email as above
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

    it('should fail to create vendor with missing required fields', async () => {
      const invalidVendorData = {
        name: 'Invalid Vendor',
        email: 'invalidvendor@test.com',
        password: 'password123',
        role: UserRole.VENDOR,
        // Missing required serviceOffered, styleOffered, and weddingTypes
      };

      await request(app.getHttpServer())
        .post('/vendors')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(invalidVendorData)
        .expect(400);
    });

    it('should fail to create vendor without authentication', async () => {
      const vendorData = {
        name: 'Unauthorized Vendor',
        email: 'unauthorized@test.com',
        password: 'password123',
        role: UserRole.VENDOR,
        serviceOffered: WeddingService.MUSIC,
        styleOffered: WeddingStyle.RUSTIC,
        weddingTypes: [WeddingType.WESTERN],
      };

      await request(app.getHttpServer())
        .post('/vendors')
        .send(vendorData)
        .expect(401);
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
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

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

    it('should fail to get vendors without authentication', async () => {
      await request(app.getHttpServer()).get('/vendors').expect(401);
    });
  });

  describe('GET /vendors/:id', () => {
    it('should get a specific vendor by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/vendors/${createdVendorId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      expect(response.body.id).toBe(createdVendorId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('role');
      expect(response.body.role).toBe(UserRole.VENDOR);
      expect(response.body).toHaveProperty('serviceOffered');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent vendor', async () => {
      await request(app.getHttpServer())
        .get('/vendors/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('GET /vendors/email/:email', () => {
    it('should get vendor by email', async () => {
      const response = await request(app.getHttpServer())
        .get('/vendors/email/testvendorapi@test.com')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      expect(response.body.email).toBe('testvendorapi@test.com');
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body.role).toBe(UserRole.VENDOR);
    });

    it('should return 404 for non-existent email', async () => {
      await request(app.getHttpServer())
        .get('/vendors/email/nonexistent@test.com')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
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
        .expect(201);

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
        .expect(201);

      expect(response.body.bio).toBe(updateData.bio);
      expect(response.body.vendorWebsite).toBe(updateData.vendorWebsite);
    });

    it('should return 404 when updating non-existent vendor', async () => {
      const updateData = {
        name: 'Non-existent Vendor',
      };

      await request(app.getHttpServer())
        .put('/vendors/99999')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(updateData)
        .expect(404);
    });

    it('should fail to update vendor email to existing email', async () => {
      const updateData = {
        email: 'minimalvendor@test.com', // Email that already exists
      };

      await request(app.getHttpServer())
        .put(`/vendors/${createdVendorId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(updateData)
        .expect(409);
    });
  });

  describe('DELETE /vendors/:id', () => {
    it('should delete a vendor successfully', async () => {
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
        .expect(201);

      expect(deleteResponse.body).toHaveProperty('message');
      expect(deleteResponse.body.message).toBe('Vendor successfully deleted');

      // Verify the vendor is deleted
      await request(app.getHttpServer())
        .get(`/vendors/${vendorId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent vendor', async () => {
      await request(app.getHttpServer())
        .delete('/vendors/99999')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(404);
    });
  });

  describe('Vendor filtering and search', () => {
    beforeAll(async () => {
      // Create additional vendors with different services and styles for testing
      const additionalVendors = [
        {
          name: 'Photography Specialist',
          email: 'photospecialist@test.com',
          password: 'password123',
          role: UserRole.VENDOR,
          serviceOffered: WeddingService.PHOTOGRAPHY,
          styleOffered: WeddingStyle.MODERN,
          weddingTypes: [WeddingType.CHINESE, WeddingType.WESTERN],
          rating: 4.9,
        },
        {
          name: 'Venue Provider',
          email: 'venueprovider@test.com',
          password: 'password123',
          role: UserRole.VENDOR,
          serviceOffered: WeddingService.VENUE,
          styleOffered: WeddingStyle.LUXURY,
          weddingTypes: [WeddingType.INDIAN, WeddingType.MALAY],
          capacity: 500,
        },
      ];

      for (const vendor of additionalVendors) {
        await request(app.getHttpServer())
          .post('/vendors')
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send(vendor)
          .expect(201);
      }
    });

    it('should get all vendors and verify different services', async () => {
      const response = await request(app.getHttpServer())
        .get('/vendors')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      const services = response.body.map(
        (vendor: any) => vendor.serviceOffered,
      );
      const uniqueServices = [...new Set(services)];

      expect(uniqueServices.length).toBeGreaterThan(1);
      expect(uniqueServices).toContain(WeddingService.PHOTOGRAPHY);
      expect(uniqueServices).toContain(WeddingService.VENUE);
    });
  });
});
