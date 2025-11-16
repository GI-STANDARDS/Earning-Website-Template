/**
 * Jest Test Setup and Configuration
 */

require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = 5001;
process.env.MONGODB_URI = 'mongodb://localhost:27017/task-platform-test';
process.env.JWT_SECRET = 'test-secret-key';

// Suppress console.log in tests
global.console.log = jest.fn();
global.console.error = jest.fn();

// Test timeout
jest.setTimeout(30000);
