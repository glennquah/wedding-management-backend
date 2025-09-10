import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupTestApp, teardownTestApp } from './test-utils';

describe('Wedding (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let createdWeddingId: number;

  beforeAll(async () => {
    const testAppData = await setupTestApp();
    app = testAppData.app;
    adminToken = testAppData.jwtTokenAdmin;
  });

  afterAll(async () => {
    await teardownTestApp(app);
  });

  describe('POST /weddings', () => {
    it('should create a new wedding successfully', async () => {
      const weddingData = {
        name: 'Test Wedding API',
        date: '2025-06-15T10:00:00.000Z',
        location: 'Marina Bay Sands',
      };

      const response = await request(app.getHttpServer())
        .post('/weddings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(weddingData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(weddingData.name);
      expect(response.body.date).toBe(weddingData.date);
      expect(response.body.location).toBe(weddingData.location);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      createdWeddingId = response.body.id;
    });
  });

  describe('GET /weddings', () => {
    it('should get all weddings', async () => {
      const response = await request(app.getHttpServer())
        .get('/weddings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check that each wedding has the required properties
      response.body.forEach((wedding: any) => {
        expect(wedding).toHaveProperty('id');
        expect(wedding).toHaveProperty('name');
        expect(wedding).toHaveProperty('date');
        expect(wedding).toHaveProperty('createdAt');
        expect(wedding).toHaveProperty('updatedAt');
        // location is optional
        if (wedding.location !== null) {
          expect(typeof wedding.location).toBe('string');
        }
      });
    });
  });

  describe('GET /weddings/:id', () => {
    it('should get a specific wedding by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/weddings/${createdWeddingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(createdWeddingId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('date');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });
  });

  describe('PUT /weddings/:id', () => {
    it('should update a wedding successfully', async () => {
      const updateData = {
        name: 'Updated Wedding Name',
        location: 'Shangri-La Hotel',
        date: '2025-06-16T11:00:00.000Z',
      };

      const response = await request(app.getHttpServer())
        .put(`/weddings/${createdWeddingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.location).toBe(updateData.location);
      expect(response.body.date).toBe(updateData.date);
      expect(response.body.id).toBe(createdWeddingId);
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should update wedding with partial data', async () => {
      const updateData = {
        location: 'Raffles Hotel',
      };

      const response = await request(app.getHttpServer())
        .put(`/weddings/${createdWeddingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.location).toBe(updateData.location);
      expect(response.body.id).toBe(createdWeddingId);
      // Other fields should remain unchanged
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('date');
    });
  });

  describe('DELETE /weddings/:id', () => {
    it('should delete a wedding successfully', async () => {
      // First create a wedding to delete
      const weddingToDelete = {
        name: 'Wedding To Delete',
        date: '2025-08-10T16:00:00.000Z',
        location: 'Temporary Venue',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/weddings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(weddingToDelete)
        .expect(201);

      const weddingId = createResponse.body.id;

      // Delete the wedding
      await request(app.getHttpServer())
        .delete(`/weddings/${weddingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify the wedding is deleted
      await request(app.getHttpServer())
        .get(`/weddings/${weddingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
