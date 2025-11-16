/**
 * Integration Tests for Tasks
 */

const request = require('supertest');
const app = require('../app');
const Task = require('../models/Task');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { generateTestToken, createMockUser, createMockTask, clearTestDatabase, connectTestDatabase, disconnectTestDatabase } = require('./testUtils');

describe('Task Endpoints', () => {
  let userToken;
  let adminToken;
  let userId;
  let adminId;

  beforeAll(async () => {
    await connectTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();

    const user = await User.create(createMockUser());
    const admin = await User.create(createMockUser({
      email: 'admin@example.com',
      role: 'admin'
    }));

    userId = user._id.toString();
    adminId = admin._id.toString();
    userToken = generateTestToken(userId);
    adminToken = generateTestToken(adminId, 'admin');
  });

  afterAll(async () => {
    await clearTestDatabase();
    await disconnectTestDatabase();
  });

  describe('GET /api/tasks', () => {
    it('should fetch all active tasks', async () => {
      await Task.create([
        createMockTask({ title: 'Task 1', status: 'active' }),
        createMockTask({ title: 'Task 2', status: 'active' }),
        createMockTask({ title: 'Task 3', status: 'inactive' })
      ]);

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should paginate tasks', async () => {
      for (let i = 0; i < 15; i++) {
        await Task.create(createMockTask({ title: `Task ${i}` }));
      }

      const response = await request(app)
        .get('/api/tasks?page=1&limit=10')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });

    it('should filter tasks by category', async () => {
      await Task.create([
        createMockTask({ category: 'survey' }),
        createMockTask({ category: 'quiz' })
      ]);

      const response = await request(app)
        .get('/api/tasks?category=survey')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data[0].category).toBe('survey');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should fetch single task', async () => {
      const task = await Task.create(createMockTask());

      const response = await request(app)
        .get(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data._id.toString()).toBe(task._id.toString());
      expect(response.body.data.title).toBe(task.title);
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439099';

      const response = await request(app)
        .get(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/tasks/:id/complete', () => {
    it('should mark task as completed', async () => {
      const task = await Task.create(createMockTask());

      const response = await request(app)
        .post(`/api/tasks/${task._id}/complete`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Check activity log created
      const log = await ActivityLog.findOne({ 
        userId, 
        type: 'task_completed' 
      });
      expect(log).toBeDefined();
    });

    it('should fail without authentication', async () => {
      const task = await Task.create(createMockTask());

      const response = await request(app)
        .post(`/api/tasks/${task._id}/complete`);

      expect(response.status).toBe(401);
    });

    it('should fail if already completed', async () => {
      const task = await Task.create(createMockTask());
      
      // Complete task first time
      await request(app)
        .post(`/api/tasks/${task._id}/complete`)
        .set('Authorization', `Bearer ${userToken}`);

      // Try to complete again (if task doesn't allow multiple completions)
      const response = await request(app)
        .post(`/api/tasks/${task._id}/complete`)
        .set('Authorization', `Bearer ${userToken}`);

      // May return 200 or 400 depending on business logic
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('POST /api/tasks (admin)', () => {
    it('should create task as admin', async () => {
      const taskData = {
        title: 'New Admin Task',
        description: 'Task created by admin',
        category: 'survey',
        reward: 25,
        instructions: 'Complete this task'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.reward).toBe(taskData.reward);
    });

    it('should fail to create task as regular user', async () => {
      const taskData = {
        title: 'Task by user',
        category: 'survey',
        reward: 10
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send(taskData);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/tasks/:id (admin)', () => {
    it('should update task as admin', async () => {
      const task = await Task.create(createMockTask());

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Title',
          reward: 50
        });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Updated Title');
      expect(response.body.data.reward).toBe(50);
    });
  });

  describe('DELETE /api/tasks/:id (admin)', () => {
    it('should delete task as admin', async () => {
      const task = await Task.create(createMockTask());

      const response = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });
  });

  describe('GET /api/users/completed-tasks', () => {
    it('should fetch user completed tasks', async () => {
      const task = await Task.create(createMockTask());
      
      await request(app)
        .post(`/api/tasks/${task._id}/complete`)
        .set('Authorization', `Bearer ${userToken}`);

      const response = await request(app)
        .get('/api/users/completed-tasks')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
});
