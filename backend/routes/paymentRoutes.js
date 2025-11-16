const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Public routes
// @route   POST /api/payments/webhook
// @desc    Handle payment gateway webhooks
// @access  Public
router.post('/webhook', paymentController.handlePaymentWebhook);

// Protected routes (requires authentication)
// @route   POST /api/payments/initialize
// @desc    Initialize payment (Stripe, PayPal, etc)
// @access  Private
router.post('/initialize', authMiddleware, paymentController.initializePayment);

// @route   GET /api/payments/history
// @desc    Get user's payment history
// @access  Private
router.get('/history', authMiddleware, paymentController.getPaymentHistory);

// @route   GET /api/payments/:id
// @desc    Get payment details
// @access  Private
router.get('/:id', authMiddleware, paymentController.getPaymentDetails);

// Admin routes (requires admin privilege)
// @route   POST /api/payments/manual
// @desc    Record manual payment
// @access  Private - Admin
router.post('/manual', authMiddleware, adminMiddleware, paymentController.recordManualPayment);

// @route   POST /api/payments/refund
// @desc    Refund payment
// @access  Private - Admin
router.post('/refund', authMiddleware, adminMiddleware, paymentController.refundPayment);

module.exports = router;
