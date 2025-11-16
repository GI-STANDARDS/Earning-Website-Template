const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Public routes
// @route   GET /api/plans
// @desc    Get all subscription plans
// @access  Public
router.get('/', planController.getAllPlans);

// @route   GET /api/plans/:id
// @desc    Get plan by ID
// @access  Public
router.get('/:id', planController.getPlanById);

// Protected routes (requires authentication)
// @route   POST /api/plans/subscribe
// @desc    Subscribe to a plan
// @access  Private
router.post('/subscribe', authMiddleware, planController.subscribeToPlan);

// @route   GET /api/plans/user/current
// @desc    Get user's current subscription
// @access  Private
router.get('/user/current', authMiddleware, planController.getUserCurrentSubscription);

// @route   POST /api/plans/confirm-subscription
// @desc    Confirm subscription after payment
// @access  Private
router.post('/confirm-subscription', authMiddleware, planController.confirmSubscription);

// Admin routes (requires admin privilege)
// @route   POST /api/plans/admin/create
// @desc    Create new plan
// @access  Private - Admin
router.post('/admin/create', authMiddleware, adminMiddleware, planController.createPlan);

// @route   PUT /api/plans/admin/:id
// @desc    Update plan
// @access  Private - Admin
router.put('/admin/:id', authMiddleware, adminMiddleware, planController.updatePlan);

// @route   DELETE /api/plans/admin/:id
// @desc    Delete plan
// @access  Private - Admin
router.delete('/admin/:id', authMiddleware, adminMiddleware, planController.deletePlan);

module.exports = router;
