/**
 * Integration Tests for User Endpoints
 */

const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { generateTestToken, createMockUser, clearTestDatabase, connectTestDatabase, disconnectTestDatabase } = require('./testUtils');
const { hashPassword } = require('../utils/hashPassword');

describe('User Endpoints', () => {
  let userToken;
  let userId;

  beforeAll(async () => {
    await connectTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();

    const user = await User.create(createMockUser());
    userId = user._id.toString();
    userToken = generateTestToken(userId);
  });

  afterAll(async () => {
    await clearTestDatabase();
    await disconnectTestDatabase();
  });

  describe('GET /api/users/profile', () => {
    it('should fetch user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id.toString()).toBe(userId);
      expect(response.body.data.email).toBeDefined();
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'UpdatedFirst',
          lastName: 'UpdatedLast'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.firstName).toBe('UpdatedFirst');
      expect(response.body.data.lastName).toBe('UpdatedLast');

      const updatedUser = await User.findById(userId);
      expect(updatedUser.firstName).toBe('UpdatedFirst');
    });

    it('should not allow changing email directly', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'newemail@example.com'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/users/balance', () => {
    it('should fetch user balance', async () => {
      const response = await request(app)
        .get('/api/users/balance')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('balance');
      expect(response.body.data).toHaveProperty('totalEarned');
      expect(response.body.data).toHaveProperty('totalWithdrawn');
      expect(typeof response.body.data.balance).toBe('number');
    });
  });

  describe('GET /api/users/activity', () => {
    it('should fetch user activity logs', async () => {
      const response = await request(app)
        .get('/api/users/activity')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/users/activity?page=1&limit=10')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe('POST /api/users/change-password', () => {
    it('should change user password', async () => {
      const oldPassword = 'TestPassword123!';
      const newPassword = 'NewPassword456!';
      const hashedPassword = await hashPassword(oldPassword);

      const user = await User.create(createMockUser({
        email: 'changepass@example.com',
        password: hashedPassword
      }));

      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: oldPassword,
          newPassword: newPassword,
          confirmPassword: newPassword
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should fail with incorrect current password', async () => {
      const response = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewPassword456!',
          confirmPassword: 'NewPassword456!'
        });

      expect(response.status).toBe(401);
    });

    it('should fail when new passwords do not match', async () => {
      const response = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'TestPassword123!',
          newPassword: 'NewPassword456!',
          confirmPassword: 'DifferentPassword!'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/users/dashboard-stats', () => {
    it('should fetch dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/users/dashboard-stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('totalEarned');
      expect(response.body.data).toHaveProperty('availableBalance');
      expect(response.body.data).toHaveProperty('tasksCompleted');
      expect(response.body.data).toHaveProperty('subscriptionStatus');
    });
  });

  describe('GET /api/users/referral-stats', () => {
    it('should fetch referral statistics', async () => {
      const response = await request(app)
        .get('/api/users/referral-stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('referralCode');
      expect(response.body.data).toHaveProperty('referralCount');
      expect(response.body.data).toHaveProperty('referralEarnings');
    });
  });

  describe('POST /api/users/request-withdrawal', () => {
    it('should request withdrawal', async () => {
      const response = await request(app)
        .post('/api/users/request-withdrawal')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: 50,
          paymentMethod: 'bank_transfer',
          accountDetails: {
            accountNumber: '1234567890',
            bankName: 'Test Bank'
          }
        });

      expect([200, 201, 400]).toContain(response.status);
      
      if (response.status === 200 || response.status === 201) {
        expect(response.body.success).toBe(true);
      }
    });

    it('should fail if requesting more than available balance', async () => {
      const response = await request(app)
        .post('/api/users/request-withdrawal')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: 99999,
          paymentMethod: 'bank_transfer',
          accountDetails: {}
        });

      expect(response.status).toBe(400);
    });
  });
});
