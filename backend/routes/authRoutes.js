const express = require('express');
const router = express.Router();
const { authLimiter } = require('../config/securityConfig');
const { registerValidation, loginValidation, validateInput } = require('../middlewares/validateInput');
const auth = require('../middlewares/authMiddleware');
const {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser
} = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  authLimiter,
  registerValidation,
  validateInput,
  register
);

// @route   POST /api/auth/login
// @desc    Login user and get JWT token
// @access  Public
router.post(
  '/login',
  authLimiter,
  loginValidation,
  validateInput,
  login
);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, logout);

// @route   POST /api/auth/refresh-token
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh-token', auth, refreshToken);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, getCurrentUser);

module.exports = router;
