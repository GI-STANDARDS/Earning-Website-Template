const User = require('../models/User');
const Task = require('../models/Task');
const Payment = require('../models/Payment');
const Referral = require('../models/Referral');
const ActivityLog = require('../models/ActivityLog');
const Plan = require('../models/Plan');

/**
 * @desc    Get all users with pagination
 * @route   GET /api/admin/users
 * @access  Private - Admin
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'banned') filter.isBanned = true;

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select('-password -emailVerificationToken')
      .populate('subscriptionPlan', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get user details by ID
 * @route   GET /api/admin/users/:id
 * @access  Private - Admin
 */
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -emailVerificationToken')
      .populate('subscriptionPlan')
      .populate('referredBy', 'firstName lastName email');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user statistics
    const taskCompletions = await ActivityLog.countDocuments({
      userId: req.params.id,
      type: 'task_completed'
    });

    const referralCount = await Referral.countDocuments({
      referrerUser: req.params.id
    });

    const paymentCount = await Payment.countDocuments({
      userId: req.params.id
    });

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          taskCompletions,
          referralCount,
          paymentCount,
          accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)) + ' days'
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
 * @desc    Update user by ID
 * @route   PUT /api/admin/users/:id
 * @access  Private - Admin
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating sensitive fields
    delete updates.password;
    delete updates.email;
    delete updates.referralCode;

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).select('-password -emailVerificationToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      targetUserId: id,
      type: 'admin_user_updated',
      description: `Admin updated user details`,
      metadata: { updates }
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Ban or unban user
 * @route   PUT /api/admin/users/:id/ban
 * @access  Private - Admin
 */
exports.toggleUserBan = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const wasBanned = user.isBanned;
    user.isBanned = !user.isBanned;
    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      targetUserId: id,
      type: wasBanned ? 'user_unbanned' : 'user_banned',
      description: `User was ${user.isBanned ? 'banned' : 'unbanned'}`,
      metadata: { reason }
    });

    res.status(200).json({
      success: true,
      message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`,
      data: { userId: id, isBanned: user.isBanned }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Delete user by ID
 * @route   DELETE /api/admin/users/:id
 * @access  Private - Admin
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting admin users
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete admin users'
      });
    }

    // Delete user and related data
    await User.findByIdAndDelete(id);
    await ActivityLog.deleteMany({ userId: id });
    await Referral.deleteMany({ $or: [{ referrerUser: id }, { referredUser: id }] });

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      targetUserId: id,
      type: 'user_deleted',
      description: 'Admin deleted user account'
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get system analytics and statistics
 * @route   GET /api/admin/analytics
 * @access  Private - Admin
 */
exports.getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const daysBack = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // User statistics
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate }
    });
    const activeUsers = await User.countDocuments({
      isActive: true,
      lastLogin: { $gte: startDate }
    });
    const bannedUsers = await User.countDocuments({ isBanned: true });

    // Task statistics
    const totalTasks = await Task.countDocuments();
    const activeTasks = await Task.countDocuments({ status: 'active' });
    const taskCompletions = await ActivityLog.countDocuments({
      type: 'task_completed',
      createdAt: { $gte: startDate }
    });

    // Payment statistics
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({ status: 'completed' });
    const failedPayments = await Payment.countDocuments({ status: 'failed' });

    const paymentRevenue = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Referral statistics
    const totalReferrals = await Referral.countDocuments();
    const verifiedReferrals = await Referral.countDocuments({ status: 'verified' });

    // Subscription statistics
    const activeSubscriptions = await User.countDocuments({
      subscriptionStatus: 'active',
      subscriptionExpire: { $gt: new Date() }
    });

    res.status(200).json({
      success: true,
      period: `${daysBack} days`,
      data: {
        users: {
          total: totalUsers,
          new: newUsers,
          active: activeUsers,
          banned: bannedUsers
        },
        tasks: {
          total: totalTasks,
          active: activeTasks,
          completions: taskCompletions
        },
        payments: {
          total: totalPayments,
          completed: completedPayments,
          failed: failedPayments,
          revenue: paymentRevenue[0]?.total || 0
        },
        referrals: {
          total: totalReferrals,
          verified: verifiedReferrals
        },
        subscriptions: {
          active: activeSubscriptions
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
 * @desc    Get activity logs with pagination
 * @route   GET /api/admin/logs
 * @access  Private - Admin
 */
exports.getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, userId, severity } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (userId) filter.userId = userId;
    if (severity) filter.severity = severity;

    const skip = (page - 1) * limit;
    const total = await ActivityLog.countDocuments(filter);

    const logs = await ActivityLog.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Clear activity logs older than specified days
 * @route   DELETE /api/admin/logs/clear
 * @access  Private - Admin
 */
exports.clearOldLogs = async (req, res) => {
  try {
    const { days = 90 } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await ActivityLog.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} logs deleted`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get dashboard summary
 * @route   GET /api/admin/dashboard
 * @access  Private - Admin
 */
exports.getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's metrics
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today }
    });

    const tasksCompletedToday = await ActivityLog.countDocuments({
      type: 'task_completed',
      createdAt: { $gte: today }
    });

    const paymentsToday = await Payment.countDocuments({
      status: 'completed',
      createdAt: { $gte: today }
    });

    const revenueToday = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: today }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // System summary
    const totalUsers = await User.countDocuments();
    const activeSubscriptions = await User.countDocuments({
      subscriptionStatus: 'active'
    });
    const totalEarnings = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalEarned' } } }
    ]);

    res.status(200).json({
      success: true,
      summary: {
        today: {
          newUsers: newUsersToday,
          tasksCompleted: tasksCompletedToday,
          payments: paymentsToday,
          revenue: revenueToday[0]?.total || 0
        },
        system: {
          totalUsers,
          activeSubscriptions,
          totalEarnings: totalEarnings[0]?.total || 0
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

module.exports = exports;
