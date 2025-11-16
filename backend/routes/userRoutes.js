const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protected routes (requires authentication)

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authMiddleware, userController.getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, userController.updateProfile);

// @route   GET /api/users/balance
// @desc    Get user balance and earnings
// @access  Private
router.get('/balance', authMiddleware, userController.getBalance);

// @route   GET /api/users/activity
// @desc    Get user activity log
// @access  Private
router.get('/activity', authMiddleware, userController.getActivityLog);

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authMiddleware, userController.changePassword);

// @route   GET /api/users/dashboard-stats
// @desc    Get user dashboard statistics
// @access  Private
router.get('/dashboard-stats', authMiddleware, userController.getDashboardStats);

module.exports = router;
