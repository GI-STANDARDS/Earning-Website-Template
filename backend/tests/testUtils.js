/**
 * Test Utilities and Helpers
 */

const jwt = require('jsonwebtoken');
const { hashPassword } = require('../utils/hashPassword');

/**
 * Generate test JWT token
 */
function generateTestToken(userId = '507f1f77bcf86cd799439011', role = 'user') {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Create mock user object
 */
function createMockUser(overrides = {}) {
  return {
    _id: '507f1f77bcf86cd799439011',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'HashedPassword123!',
    emailVerified: true,
    isActive: true,
    isBanned: false,
    balance: 100,
    totalEarned: 500,
    totalWithdrawn: 400,
    referralCode: 'TEST12345',
    referralCount: 5,
    referralEarnings: 150,
    subscriptionStatus: 'active',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

/**
 * Create mock task object
 */
function createMockTask(overrides = {}) {
  return {
    _id: '507f1f77bcf86cd799439012',
    title: 'Test Task',
    description: 'Test task description',
    category: 'survey',
    reward: 10,
    instructions: 'Complete this task',
    proofRequired: false,
    url: null,
    status: 'active',
    priority: 50,
    dailyLimit: null,
    totalCompletions: 5,
    createdBy: '507f1f77bcf86cd799439011',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

/**
 * Create mock plan object
 */
function createMockPlan(overrides = {}) {
  return {
    _id: '507f1f77bcf86cd799439013',
    name: 'Basic Plan',
    description: 'Basic subscription plan',
    price: 9.99,
    currency: 'USD',
    duration: 30,
    features: ['Feature 1', 'Feature 2'],
    benefits: {
      taskLimit: 100,
      dailyEarningLimit: null,
      withdrawalFrequency: 'weekly',
      prioritySupport: false,
      earningBonus: 0
    },
    status: 'active',
    popular: false,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

/**
 * Create mock payment object
 */
function createMockPayment(overrides = {}) {
  return {
    _id: '507f1f77bcf86cd799439014',
    userId: '507f1f77bcf86cd799439011',
    amount: 9.99,
    currency: 'USD',
    type: 'subscription',
    method: 'stripe',
    status: 'completed',
    transactionId: 'TXN123456789',
    subscriptionPlan: '507f1f77bcf86cd799439013',
    description: 'Subscription payment',
    metadata: {},
    failureReason: null,
    processedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

/**
 * Create mock activity log
 */
function createMockActivityLog(overrides = {}) {
  return {
    _id: '507f1f77bcf86cd799439015',
    userId: '507f1f77bcf86cd799439011',
    type: 'task_completed',
    description: 'Completed test task',
    metadata: { taskId: '507f1f77bcf86cd799439012', reward: 10 },
    severity: 'info',
    createdAt: new Date(),
    ...overrides
  };
}

/**
 * Clear all test data
 */
async function clearTestDatabase() {
  const User = require('../models/User');
  const Task = require('../models/Task');
  const Plan = require('../models/Plan');
  const Payment = require('../models/Payment');
  const ActivityLog = require('../models/ActivityLog');
  const Referral = require('../models/Referral');

  await Promise.all([
    User.deleteMany({}),
    Task.deleteMany({}),
    Plan.deleteMany({}),
    Payment.deleteMany({}),
    ActivityLog.deleteMany({}),
    Referral.deleteMany({})
  ]);
}

/**
 * Connect to test database
 */
async function connectTestDatabase() {
  const mongoose = require('mongoose');
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }
}

/**
 * Disconnect from test database
 */
async function disconnectTestDatabase() {
  const mongoose = require('mongoose');
  await mongoose.connection.close();
}

module.exports = {
  generateTestToken,
  createMockUser,
  createMockTask,
  createMockPlan,
  createMockPayment,
  createMockActivityLog,
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
};
