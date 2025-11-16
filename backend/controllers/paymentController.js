const Payment = require('../models/Payment');
const User = require('../models/User');
const Plan = require('../models/Plan');
const ActivityLog = require('../models/ActivityLog');
const crypto = require('crypto');

/**
 * @desc    Initialize payment for subscription
 * @param   {Object} req - Express request (paymentId in body)
 * @param   {Object} res - Express response
 * @access  Private
 */
exports.initializePayment = async (req, res) => {
  try {
    const { paymentId, method } = req.body;
    const userId = req.user.id;

    if (!paymentId || !method) {
      return res.status(400).json({
        success: false,
        error: 'Payment ID and method are required'
      });
    }

    // Valid payment methods
    const validMethods = ['stripe', 'paypal', 'bank_transfer', 'manual'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment method'
      });
    }

    // Find payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    if (payment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Payment cannot be initialized'
      });
    }

    // Update payment with method
    payment.method = method;
    await payment.save();

    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    // Response varies by payment method
    let paymentData = {
      paymentId: payment._id,
      transactionId,
      amount: payment.amount,
      currency: payment.currency,
      method,
      userId
    };

    // Add method-specific data
    if (method === 'stripe') {
      paymentData.stripePublicKey = process.env.STRIPE_PUBLIC_KEY || 'pk_test_example';
      paymentData.clientSecret = crypto.randomBytes(32).toString('hex');
    } else if (method === 'paypal') {
      paymentData.paypalClientId = process.env.PAYPAL_CLIENT_ID || 'sb_client_id';
    } else if (method === 'bank_transfer') {
      paymentData.bankDetails = {
        accountNumber: '****1234',
        routingNumber: '****5678',
        accountHolder: 'Platform Account',
        reference: transactionId
      };
    }

    res.status(200).json({
      success: true,
      message: 'Payment initialization successful',
      data: paymentData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Handle payment gateway webhooks
 * @param   {Object} req - Express request
 * @param   {Object} res - Express response
 * @access  Public
 */
exports.handlePaymentWebhook = async (req, res) => {
  try {
    const { event, data } = req.body;

    if (!event || !data) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook data'
      });
    }

    // Handle different webhook events
    switch (event) {
      case 'payment.success':
      case 'charge.completed':
        await handlePaymentSuccess(data);
        break;
      case 'payment.failed':
      case 'charge.failed':
        await handlePaymentFailure(data);
        break;
      case 'payment.refunded':
      case 'charge.refunded':
        await handlePaymentRefund(data);
        break;
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    // Return 200 OK to webhook sender
    res.status(200).json({
      success: true,
      message: 'Webhook processed'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get user's payment history
 * @param   {Object} req - Express request
 * @param   {Object} res - Express response
 * @access  Private
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.id;

    const filter = { userId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const total = await Payment.countDocuments(filter);

    const payments = await Payment.find(filter)
      .populate('subscriptionPlan', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get payment details
 * @param   {Object} req - Express request
 * @param   {Object} res - Express response
 * @access  Private
 */
exports.getPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findById(id)
      .populate('subscriptionPlan')
      .populate('userId', 'firstName lastName email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // Check authorization (user can only see their own payments)
    if (payment.userId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Record manual payment (Admin only)
 * @param   {Object} req - Express request
 * @param   {Object} res - Express response
 * @access  Private - Admin
 */
exports.recordManualPayment = async (req, res) => {
  try {
    const { userId, amount, type, description, subscriptionPlanId } = req.body;

    if (!userId || !amount || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Valid payment types
    const validTypes = ['subscription', 'withdrawal', 'manual', 'refund'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment type'
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Create payment record
    const payment = new Payment({
      userId,
      amount,
      type,
      method: 'manual',
      status: 'completed',
      description: description || `Manual ${type}`,
      subscriptionPlan: subscriptionPlanId || null,
      transactionId: `MANUAL-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      processedAt: new Date()
    });

    await payment.save();

    // Update user based on payment type
    if (type === 'subscription' && subscriptionPlanId) {
      const plan = await Plan.findById(subscriptionPlanId);
      if (plan) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + plan.duration);
        user.subscriptionPlan = subscriptionPlanId;
        user.subscriptionStatus = 'active';
        user.subscriptionExpire = expirationDate;
      }
    } else if (type === 'withdrawal') {
      user.totalWithdrawn += amount;
      user.balance -= amount;
    }

    await user.save();

    // Log activity
    await ActivityLog.create({
      userId,
      type: 'payment_recorded',
      description: `Manual payment recorded: ${type}`,
      metadata: {
        paymentId: payment._id,
        amount,
        paymentType: type
      }
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Refund payment (Admin only)
 * @param   {Object} req - Express request
 * @param   {Object} res - Express response
 * @access  Private - Admin
 */
exports.refundPayment = async (req, res) => {
  try {
    const { paymentId, reason } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment ID is required'
      });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    if (payment.status === 'refunded') {
      return res.status(400).json({
        success: false,
        error: 'Payment already refunded'
      });
    }

    // Update payment status
    payment.status = 'refunded';
    payment.failureReason = reason || 'Refund requested by admin';
    await payment.save();

    // Refund user if applicable
    const user = await User.findById(payment.userId);
    if (user && payment.type === 'subscription') {
      user.balance += payment.amount;
      await user.save();
    }

    // Log activity
    await ActivityLog.create({
      userId: payment.userId,
      type: 'payment_refunded',
      description: `Payment refunded: ${reason || 'Admin refund'}`,
      metadata: {
        paymentId: payment._id,
        amount: payment.amount
      }
    });

    res.status(200).json({
      success: true,
      message: 'Payment refunded successfully',
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Helper: Handle payment success
 */
async function handlePaymentSuccess(data) {
  try {
    const { paymentId, transactionId, amount } = data;

    const payment = await Payment.findById(paymentId);
    if (payment) {
      payment.status = 'completed';
      payment.transactionId = transactionId;
      payment.processedAt = new Date();
      await payment.save();

      // If subscription payment, confirm subscription
      if (payment.type === 'subscription' && payment.subscriptionPlan) {
        const plan = await Plan.findById(payment.subscriptionPlan);
        const user = await User.findById(payment.userId);

        if (plan && user) {
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + plan.duration);

          user.subscriptionPlan = payment.subscriptionPlan;
          user.subscriptionStatus = 'active';
          user.subscriptionExpire = expirationDate;
          await user.save();
        }
      }
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

/**
 * Helper: Handle payment failure
 */
async function handlePaymentFailure(data) {
  try {
    const { paymentId, failureReason } = data;

    const payment = await Payment.findById(paymentId);
    if (payment) {
      payment.status = 'failed';
      payment.failureReason = failureReason || 'Payment failed';
      await payment.save();
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

/**
 * Helper: Handle payment refund
 */
async function handlePaymentRefund(data) {
  try {
    const { paymentId, refundAmount } = data;

    const payment = await Payment.findById(paymentId);
    if (payment) {
      payment.status = 'refunded';
      await payment.save();

      // Refund user
      const user = await User.findById(payment.userId);
      if (user) {
        user.balance += refundAmount || payment.amount;
        await user.save();
      }
    }
  } catch (error) {
    console.error('Error handling refund:', error);
  }
}
