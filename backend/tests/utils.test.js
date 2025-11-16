/**
 * Unit Tests for Utilities
 */

const {
  generateTestToken,
  createMockUser,
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} = require('./testUtils');

const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { generateReferralCode } = require('../utils/referralCodeGenerator');
const jwt = require('jsonwebtoken');

describe('Utility Functions', () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const plainPassword = 'TestPassword123!';
      const hashedPassword = await hashPassword(plainPassword);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(plainPassword);
    });

    it('should generate different hashes for same password', async () => {
      const plainPassword = 'TestPassword123!';
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const plainPassword = 'TestPassword123!';
      const hashedPassword = await hashPassword(plainPassword);
      
      const result = await comparePassword(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const plainPassword = 'TestPassword123!';
      const hashedPassword = await hashPassword(plainPassword);
      
      const result = await comparePassword('WrongPassword', hashedPassword);
      expect(result).toBe(false);
    });
  });

  describe('generateReferralCode', () => {
    it('should generate a valid referral code', () => {
      const code = generateReferralCode();
      
      expect(code).toBeDefined();
      expect(code.length).toBe(8);
      expect(/^[A-Z0-9]+$/.test(code)).toBe(true);
    });

    it('should generate unique codes', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateReferralCode());
      }
      
      expect(codes.size).toBe(100);
    });
  });

  describe('generateTestToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateTestToken();
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      expect(decoded.id).toBe('507f1f77bcf86cd799439011');
      expect(decoded.role).toBe('user');
    });

    it('should generate token with custom user ID', () => {
      const customId = '607f1f77bcf86cd799439099';
      const token = generateTestToken(customId);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      expect(decoded.id).toBe(customId);
    });

    it('should generate admin token', () => {
      const token = generateTestToken('507f1f77bcf86cd799439011', 'admin');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      expect(decoded.role).toBe('admin');
    });

    it('should fail with invalid secret', () => {
      const token = generateTestToken();
      
      expect(() => {
        jwt.verify(token, 'wrong-secret');
      }).toThrow();
    });
  });

  describe('createMockUser', () => {
    it('should create a mock user with defaults', () => {
      const user = createMockUser();
      
      expect(user._id).toBe('507f1f77bcf86cd799439011');
      expect(user.email).toBe('test@example.com');
      expect(user.emailVerified).toBe(true);
      expect(user.balance).toBe(100);
    });

    it('should create mock user with custom overrides', () => {
      const user = createMockUser({
        email: 'custom@example.com',
        balance: 500,
        role: 'admin'
      });
      
      expect(user.email).toBe('custom@example.com');
      expect(user.balance).toBe(500);
      expect(user.role).toBe('admin');
      expect(user.firstName).toBe('Test'); // Default still present
    });
  });
});
