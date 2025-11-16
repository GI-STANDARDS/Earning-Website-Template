// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
};

// User Roles
const ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Task Categories
const TASK_CATEGORIES = {
  SURVEY: 'survey',
  SIGNUP: 'signup',
  DOWNLOAD: 'download',
  REVIEW: 'review',
  SOCIAL: 'social',
  OTHER: 'other'
};

// Task Status
const TASK_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed'
};

// Subscription Status
const SUBSCRIPTION_STATUS = {
  NONE: 'none',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

// Payment Status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// Payment Types
const PAYMENT_TYPES = {
  SUBSCRIPTION: 'subscription',
  WITHDRAWAL: 'withdrawal',
  MANUAL: 'manual',
  REFUND: 'refund'
};

// Payment Methods
const PAYMENT_METHODS = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  MANUAL: 'manual',
  WALLET: 'wallet'
};

// Referral Status
const REFERRAL_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

// Activity Actions
const ACTIVITY_ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  TASK_COMPLETED: 'task_completed',
  TASK_FAILED: 'task_failed',
  TASK_SUBMITTED: 'task_submitted',
  SUBSCRIPTION_PURCHASED: 'subscription_purchased',
  SUBSCRIPTION_EXPIRED: 'subscription_expired',
  WITHDRAWAL_REQUESTED: 'withdrawal_requested',
  WITHDRAWAL_COMPLETED: 'withdrawal_completed',
  PAYMENT_RECEIVED: 'payment_received',
  PROFILE_UPDATED: 'profile_updated',
  PASSWORD_CHANGED: 'password_changed',
  REFERRAL_EARNED: 'referral_earned',
  EMAIL_VERIFIED: 'email_verified',
  BANNED: 'banned',
  UNBANNED: 'unbanned',
  OTHER: 'other'
};

// Activity Severity Levels
const SEVERITY_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

// Withdrawal Frequency
const WITHDRAWAL_FREQUENCY = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

// Limits & Thresholds
const LIMITS = {
  MIN_WITHDRAWAL: 50,
  MAX_WITHDRAWAL: 10000,
  MIN_PASSWORD_LENGTH: 6,
  MIN_REFERRAL_BONUS: 0,
  MAX_REFERRAL_BONUS: 10000,
  MIN_TASK_REWARD: 0.5,
  MAX_TASK_REWARD: 10000,
  MIN_PLAN_PRICE: 1,
  MAX_PLAN_PRICE: 100000,
  TOKEN_EXPIRY_DAYS: 7,
  SESSION_TIMEOUT_MINUTES: 60
};

// Error Messages
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  EMAIL_EXISTS: 'Email already registered',
  TOKEN_EXPIRED: 'Token has expired',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access denied',
  VALIDATION_ERROR: 'Validation failed',
  SERVER_ERROR: 'Internal server error',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  INVALID_AMOUNT: 'Invalid amount specified'
};

// Success Messages
const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  UPDATE_SUCCESS: 'Updated successfully',
  DELETE_SUCCESS: 'Deleted successfully',
  WITHDRAWAL_SUCCESS: 'Withdrawal request submitted',
  PAYMENT_SUCCESS: 'Payment processed successfully'
};

module.exports = {
  HTTP_STATUS,
  ROLES,
  TASK_CATEGORIES,
  TASK_STATUS,
  SUBSCRIPTION_STATUS,
  PAYMENT_STATUS,
  PAYMENT_TYPES,
  PAYMENT_METHODS,
  REFERRAL_STATUS,
  ACTIVITY_ACTIONS,
  SEVERITY_LEVELS,
  WITHDRAWAL_FREQUENCY,
  LIMITS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
