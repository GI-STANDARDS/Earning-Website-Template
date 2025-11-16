const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { hashPassword, comparePassword } = require('../utils/hashPassword');

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId)
      .populate('subscriptionPlan', 'name price duration')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { firstName, lastName, phone, bio, avatar } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Update allowed fields only
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await user.save();

    // Log activity
    await ActivityLog.create({
      userId,
      action: 'profile_updated',
      description: 'User updated profile information',
      severity: 'info'
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user balance
 * @route   GET /api/users/balance
 * @access  Private
 */
exports.getBalance = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      balance: user.balance,
      totalEarned: user.totalEarned,
      totalWithdrawn: user.totalWithdrawn,
      taskEarnings: user.totalEarned - user.referralEarnings,
      referralEarnings: user.referralEarnings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user activity log
 * @route   GET /api/users/activity
 * @access  Private
 */
exports.getActivityLog = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const activities = await ActivityLog.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Verify current password
    const isPasswordMatch = await comparePassword(currentPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log activity
    await ActivityLog.create({
      userId,
      action: 'password_changed',
      description: 'User changed password',
      severity: 'warning'
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user dashboard stats
 * @route   GET /api/users/dashboard-stats
 * @access  Private
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId)
      .populate('subscriptionPlan', 'name')
      .lean();

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const stats = {
      balance: user.balance,
      totalEarned: user.totalEarned,
      totalWithdrawn: user.totalWithdrawn,
      referralCount: user.referralCount,
      referralEarnings: user.referralEarnings,
      subscriptionPlan: user.subscriptionPlan?.name || 'None',
      subscriptionStatus: user.subscriptionStatus,
      accountCreated: user.createdAt,
      lastLogin: user.lastLogin
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
