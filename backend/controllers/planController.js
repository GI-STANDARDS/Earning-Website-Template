const Plan = require('../models/Plan');
const User = require('../models/User');
const Payment = require('../models/Payment');
const ActivityLog = require('../models/ActivityLog');

/**
 * @desc    Get all subscription plans
 * @param   {Object} req - Express request
 * @param   {Object} res - Express response
 * @access  Public
 */
exports.getAllPlans = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const plans = await Plan.find(filter)
      .select('-__v')
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get plan by ID
 * @param   {Object} req - Express request
 * @param   {Object} res - Express response
 * @access  Public
 */
exports.getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Subscribe to a plan
 * @param   {Object} req - Express request (planId in body)
 * @param   {Object} res - Express response
 * @access  Private
 */
exports.subscribeToPlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    if (!planId) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID is required'
      });
    }

    // Find plan
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }

    if (plan.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Plan is not active'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user already has active subscription
    if (user.subscriptionStatus === 'active' && user.subscriptionExpire > new Date()) {
      return res.status(400).json({
        success: false,
        error: 'User already has an active subscription'
      });
    }

    // Calculate expiration date
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + plan.duration);

    // Create payment record
    const payment = new Payment({
      userId,
      amount: plan.price,
      currency: plan.currency,
      type: 'subscription',
      method: 'pending', // Will be updated after payment gateway integration
      status: 'pending',
      subscriptionPlan: planId,
      description: `Subscription to ${plan.name}`
    });

    await payment.save();

    // Log activity
    await ActivityLog.create({
      userId,
      type: 'subscription_initiated',
      description: `Initiated subscription to ${plan.name}`,
      metadata: {
        planId,
        amount: plan.price,
        paymentId: payment._id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Subscription initiated. Proceed to payment.',
      data: {
        paymentId: payment._id,
        amount: plan.price,
        currency: plan.currency,
        plan: {
          id: plan._id,
          name: plan.name,
          duration: plan.duration
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get user's current subscription
 * @param   {Object} req - Express request
 * @param   {Object} res - Express response
 * @access  Private
 */
exports.getUserCurrentSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .populate('subscriptionPlan');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: user.subscriptionStatus,
        plan: user.subscriptionPlan,
        expiresAt: user.subscriptionExpire,
        isExpired: user.subscriptionExpire && user.subscriptionExpire < new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Confirm subscription after payment
 * @param   {Object} req - Express request (paymentId, planId in body)
 * @param   {Object} res - Express response
 * @access  Private
 */
exports.confirmSubscription = async (req, res) => {
  try {
    const { paymentId } = req.body;
    const userId = req.user.id;

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

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed'
      });
    }

    // Get plan
    const plan = await Plan.findById(payment.subscriptionPlan);

    // Update user subscription
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + plan.duration);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        subscriptionPlan: payment.subscriptionPlan,
        subscriptionStatus: 'active',
        subscriptionExpire: expirationDate
      },
      { new: true }
    );

    // Log activity
    await ActivityLog.create({
      userId,
      type: 'subscription_activated',
      description: `Subscription to ${plan.name} activated`,
      metadata: {
        planId: plan._id,
        expiresAt: expirationDate
      }
    });

    res.status(200).json({
      success: true,
      message: 'Subscription activated successfully',
      data: {
        plan: plan.name,
        status: 'active',
        expiresAt: expirationDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Create new plan (Admin only)
 * @param   {Object} req - Express request
 * @param   {Object} res - Express response
 * @access  Private - Admin
 */
exports.createPlan = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      currency,
      duration,
      features,
      benefits,
      popular,
      order
    } = req.body;

    // Validation
    if (!name || !description || !price || !duration) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Check if plan already exists
    const existingPlan = await Plan.findOne({ name });
    if (existingPlan) {
      return res.status(400).json({
        success: false,
        error: 'Plan with this name already exists'
      });
    }

    const plan = new Plan({
      name,
      description,
      price,
      currency,
      duration,
      features,
      benefits,
      popular,
      order,
      status: 'active'
    });

    await plan.save();

    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Update plan (Admin only)
 * @param   {Object} req - Express request
 * @param   {Object} res - Express response
 * @access  Private - Admin
 */
exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const plan = await Plan.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Plan updated successfully',
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Delete plan (Admin only)
 * @param   {Object} req - Express request
 * @param   {Object} res - Express response
 * @access  Private - Admin
 */
exports.deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Plan deleted successfully',
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
