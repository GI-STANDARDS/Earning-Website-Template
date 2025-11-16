/**
 * Integration Tests for System and Admin
 */

const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { generateTestToken, createMockUser, clearTestDatabase, connectTestDatabase, disconnectTestDatabase } = require('./testUtils');

describe('System & Admin Endpoints', () => {
  let adminToken;
  let userToken;
  let adminId;
  let userId;

  beforeAll(async () => {
    await connectTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();

    const admin = await User.create(createMockUser({
      email: 'admin@example.com',
      role: 'admin'
    }));
    const user = await User.create(createMockUser());

    adminId = admin._id.toString();
    userId = user._id.toString();
    adminToken = generateTestToken(adminId, 'admin');
    userToken = generateTestToken(userId);
  });

  afterAll(async () => {
    await clearTestDatabase();
    await disconnectTestDatabase();
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('running');
    });
  });

  describe('GET /api/admin/users (admin only)', () => {
    it('should fetch all users as admin', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should fail for non-admin user', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/users');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/admin/users/:id (admin only)', () => {
    it('should fetch user details', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data._id.toString()).toBe(userId);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439099';

      const response = await request(app)
        .get(`/api/admin/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/admin/users/:id (admin only)', () => {
    it('should update user details', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Updated',
          balance: 500
        });

      expect(response.status).toBe(200);
      expect(response.body.data.firstName).toBe('Updated');
      expect(response.body.data.balance).toBe(500);
    });
  });

  describe('POST /api/admin/users/:id/ban (admin only)', () => {
    it('should ban a user', async () => {
      const response = await request(app)
        .post(`/api/admin/users/${userId}/ban`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      const bannedUser = await User.findById(userId);
      expect(bannedUser.isBanned).toBe(true);
    });

    it('should unban a user', async () => {
      await User.findByIdAndUpdate(userId, { isBanned: true });

      const response = await request(app)
        .post(`/api/admin/users/${userId}/ban`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      const unbannedUser = await User.findById(userId);
      expect(unbannedUser.isBanned).toBe(false);
    });
  });

  describe('GET /api/admin/analytics (admin only)', () => {
    it('should fetch analytics data', async () => {
      const response = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data).toHaveProperty('totalEarnings');
      expect(response.body.data).toHaveProperty('activeUsers');
    });
  });

  describe('GET /api/admin/activity-logs (admin only)', () => {
    it('should fetch activity logs', async () => {
      await ActivityLog.create({
        userId,
        type: 'login',
        description: 'User logged in',
        severity: 'info'
      });

      const response = await request(app)
        .get('/api/admin/activity-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support filtering by user', async () => {
      const response = await request(app)
        .get(`/api/admin/activity-logs?userId=${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/system/health (admin only)', () => {
    it('should return system health', async () => {
      const response = await request(app)
        .get('/api/system/health')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.data).toHaveProperty('memory');
    });
  });

  describe('GET /api/system/database (admin only)', () => {
    it('should return database status', async () => {
      const response = await request(app)
        .get('/api/system/database')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('connected');
      expect(response.body.data).toHaveProperty('host');
    });
  });

  describe('GET /api/system/stats (admin only)', () => {
    it('should return system statistics', async () => {
      const response = await request(app)
        .get('/api/system/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data).toHaveProperty('totalTasks');
      expect(response.body.data).toHaveProperty('totalPayments');
    });
  });

  describe('GET /api/system/diagnostics (admin only)', () => {
    it('should run system diagnostics', async () => {
      const response = await request(app)
        .get('/api/system/diagnostics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('database');
      expect(response.body.data).toHaveProperty('memory');
    });
  });

  describe('GET /api/admin/dashboard (admin only)', () => {
    it('should return admin dashboard data', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data).toHaveProperty('recentActivity');
    });
  });
});
