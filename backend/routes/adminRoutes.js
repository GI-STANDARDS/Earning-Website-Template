const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const systemController = require('../controllers/systemController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// User Management Routes
// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private - Admin
router.get('/users', authMiddleware, adminMiddleware, adminController.getAllUsers);

// @route   GET /api/admin/users/:id
// @desc    Get user details
// @access  Private - Admin
router.get('/users/:id', authMiddleware, adminMiddleware, adminController.getUserDetails);

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private - Admin
router.put('/users/:id', authMiddleware, adminMiddleware, adminController.updateUser);

// @route   PUT /api/admin/users/:id/ban
// @desc    Ban or unban user
// @access  Private - Admin
router.put('/users/:id/ban', authMiddleware, adminMiddleware, adminController.toggleUserBan);

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private - Admin
router.delete('/users/:id', authMiddleware, adminMiddleware, adminController.deleteUser);

// Analytics & Reporting Routes
// @route   GET /api/admin/analytics
// @desc    Get system analytics
// @access  Private - Admin
router.get('/analytics', authMiddleware, adminMiddleware, adminController.getAnalytics);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard summary
// @access  Private - Admin
router.get('/dashboard', authMiddleware, adminMiddleware, adminController.getDashboard);

// Logs Management Routes
// @route   GET /api/admin/logs
// @desc    Get activity logs
// @access  Private - Admin
router.get('/logs', authMiddleware, adminMiddleware, adminController.getActivityLogs);

// @route   DELETE /api/admin/logs/clear
// @desc    Clear old logs
// @access  Private - Admin
router.delete('/logs/clear', authMiddleware, adminMiddleware, adminController.clearOldLogs);

// System Routes
// @route   GET /api/admin/system/health
// @desc    Get system health status
// @access  Private - Admin
router.get('/system/health', authMiddleware, adminMiddleware, systemController.getSystemHealth);

// @route   GET /api/admin/system/db-status
// @desc    Get database status
// @access  Private - Admin
router.get('/system/db-status', authMiddleware, adminMiddleware, systemController.getDatabaseStatus);

// @route   GET /api/admin/system/config
// @desc    Get system configuration
// @access  Private - Admin
router.get('/system/config', authMiddleware, adminMiddleware, systemController.getSystemConfig);

// @route   GET /api/admin/system/stats
// @desc    Get system statistics
// @access  Private - Admin
router.get('/system/stats', authMiddleware, adminMiddleware, systemController.getSystemStats);

// @route   GET /api/admin/system/growth
// @desc    Get growth metrics
// @access  Private - Admin
router.get('/system/growth', authMiddleware, adminMiddleware, systemController.getGrowthMetrics);

// @route   GET /api/admin/system/performance
// @desc    Get performance metrics
// @access  Private - Admin
router.get('/system/performance', authMiddleware, adminMiddleware, systemController.getPerformanceMetrics);

// @route   GET /api/admin/system/diagnostics
// @desc    Run system diagnostics
// @access  Private - Admin
router.get('/system/diagnostics', authMiddleware, adminMiddleware, systemController.runDiagnostics);

module.exports = router;
