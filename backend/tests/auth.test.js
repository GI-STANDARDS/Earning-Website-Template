/**
 * Integration Tests for Authentication
 */

const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { generateTestToken, createMockUser, clearTestDatabase, connectTestDatabase, disconnectTestDatabase } = require('./testUtils');
const { hashPassword } = require('../utils/hashPassword');

describe('Authentication Endpoints', () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await clearTestDatabase();
    await disconnectTestDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'SecurePassword123!',
          confirmPassword: 'SecurePassword123!'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('john@example.com');
      expect(response.body.data.token).toBeDefined();

      const user = await User.findById(response.body.data.user._id);
      expect(user).toBeDefined();
      expect(user.emailVerified).toBe(false);
    });

    it('should fail when email already exists', async () => {
      await User.create(createMockUser({ email: 'existing@example.com' }));

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'existing@example.com',
          password: 'SecurePassword123!',
          confirmPassword: 'SecurePassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'invalid-email',
          password: 'SecurePassword123!',
          confirmPassword: 'SecurePassword123!'
        });

      expect(response.status).toBe(400);
    });

    it('should fail when passwords do not match', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          password: 'SecurePassword123!',
          confirmPassword: 'DifferentPassword123!'
        });

      expect(response.status).toBe(400);
    });

    it('should fail with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          password: 'weak',
          confirmPassword: 'weak'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const hashedPassword = await hashPassword('SecurePassword123!');
      await User.create(createMockUser({
        email: 'login@example.com',
        password: hashedPassword,
        emailVerified: true
      }));
    });

    it('should login user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'SecurePassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('login@example.com');
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SecurePassword123!'
        });

      expect(response.status).toBe(401);
    });

    it('should fail when account is banned', async () => {
      const hashedPassword = await hashPassword('SecurePassword123!');
      await User.create(createMockUser({
        email: 'banned@example.com',
        password: hashedPassword,
        isBanned: true
      }));

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'banned@example.com',
          password: 'SecurePassword123!'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should verify email with valid token', async () => {
      const user = await User.create(createMockUser({ emailVerified: false }));
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.emailVerified).toBe(true);
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'invalid-token' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should return new token with valid refresh', async () => {
      const user = await User.create(createMockUser());
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.token).not.toBe(token);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const user = await User.create(createMockUser());
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
