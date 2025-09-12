import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfirmationStatus } from '../src/common/confirmation-status.enum';
import { seedWeddings, setupTestApp, teardownTestApp } from './test-utils';

describe('Guest (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let createdGuestId: number;
  let createdWeddingId: number;

  beforeAll(async () => {
    const testAppData = await setupTestApp();
    app = testAppData.app;
    adminToken = testAppData.jwtTokenAdmin;

    const weddings = await seedWeddings(
      app,
      testAppData.adminId,
      1,
      adminToken,
    );
    createdWeddingId = weddings[0].id;
  });

  afterAll(async () => {
    await teardownTestApp(app);
  });

  describe('POST /guests', () => {
    it('should create a new guest successfully', async () => {
      const guestData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        allergies: 'Nuts',
        group: 'Family',
        weddingId: createdWeddingId,
      };

      const response = await request(app.getHttpServer())
        .post('/guests')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(guestData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(guestData.name);
      expect(response.body.allergies).toBe(guestData.allergies);
      expect(response.body.group).toBe(guestData.group);
      expect(response.body.weddingId).toBe(guestData.weddingId);
      expect(response.body.confirmationStatus).toBe(ConfirmationStatus.PENDING);

      createdGuestId = response.body.id;
    });
  });

  describe('POST /guests/bulk', () => {
    it('should create multiple guests successfully', async () => {
      const guestsData = [
        {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          group: 'Friends',
          weddingId: createdWeddingId,
        },
        {
          name: 'Bob Johnson',
          email: 'bob.johnson@example.com',
          allergies: 'Shellfish',
          group: 'Family',
          weddingId: createdWeddingId,
        },
      ];

      const response = await request(app.getHttpServer())
        .post('/guests/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(guestsData)
        .expect(201);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe(guestsData[0].name);
      expect(response.body[1].name).toBe(guestsData[1].name);
      expect(response.body[0].weddingId).toBe(createdWeddingId);
      expect(response.body[1].weddingId).toBe(createdWeddingId);
    });
  });

  describe('GET /guests/wedding/:weddingId', () => {
    it('should get all guests for a wedding', async () => {
      const response = await request(app.getHttpServer())
        .get(`/guests/wedding/${createdWeddingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      response.body.forEach((guest: any) => {
        expect(guest).toHaveProperty('id');
        expect(guest).toHaveProperty('name');
        expect(guest.weddingId).toBe(createdWeddingId);
        expect(guest).toHaveProperty('confirmationStatus');
      });
    });
  });

  describe('GET /guests/:id', () => {
    it('should get a specific guest by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/guests/${createdGuestId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(createdGuestId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('weddingId');
      expect(response.body.weddingId).toBe(createdWeddingId);
    });
  });

  describe('PUT /guests/:id', () => {
    it('should update a guest successfully', async () => {
      const updateData = {
        name: 'John Updated',
        allergies: 'Dairy',
        group: 'VIP',
      };

      const response = await request(app.getHttpServer())
        .put(`/guests/${createdGuestId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.allergies).toBe(updateData.allergies);
      expect(response.body.group).toBe(updateData.group);
      expect(response.body.id).toBe(createdGuestId);
    });
  });

  describe('PUT /guests/:id/confirm', () => {
    it('should confirm guest attendance', async () => {
      const response = await request(app.getHttpServer())
        .put(`/guests/${createdGuestId}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.confirmationStatus).toBe(
        ConfirmationStatus.CONFIRMED,
      );
      expect(response.body.id).toBe(createdGuestId);
    });
  });

  describe('PUT /guests/:id/reject', () => {
    it('should reject guest attendance', async () => {
      const response = await request(app.getHttpServer())
        .put(`/guests/${createdGuestId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.confirmationStatus).toBe(
        ConfirmationStatus.REJECTED,
      );
      expect(response.body.id).toBe(createdGuestId);
    });
  });

  describe('DELETE /guests/:id', () => {
    it('should delete a guest successfully', async () => {
      // First create a guest to delete
      const guestToDelete = {
        name: 'Guest To Delete',
        email: 'guest.delete@example.com',
        weddingId: createdWeddingId,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/guests')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(guestToDelete)
        .expect(201);

      const guestId = createResponse.body.id;

      // Delete the guest
      await request(app.getHttpServer())
        .delete(`/guests/${guestId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify the guest is deleted
      await request(app.getHttpServer())
        .get(`/guests/${guestId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('DELETE /guests/wedding/:weddingId', () => {
    it('should delete all guests for a wedding', async () => {
      // First create a new wedding and guests
      const weddingData = {
        name: 'Wedding To Clear',
        date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Test Location',
      };

      const weddingResponse = await request(app.getHttpServer())
        .post('/weddings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(weddingData)
        .expect(201);

      const weddingId = weddingResponse.body.id;

      // Create guests for this wedding
      const guestsData = [
        { name: 'Guest 1', email: 'guest1@example.com', weddingId },
        { name: 'Guest 2', email: 'guest2@example.com', weddingId },
      ];

      await request(app.getHttpServer())
        .post('/guests/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(guestsData)
        .expect(201);

      // Delete all guests for the wedding
      await request(app.getHttpServer())
        .delete(`/guests/wedding/${weddingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify guests are deleted
      const response = await request(app.getHttpServer())
        .get(`/guests/wedding/${weddingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });
});
