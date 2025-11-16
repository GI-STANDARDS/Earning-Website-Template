const User = require('../models/User');
const Referral = require('../models/Referral');
const ActivityLog = require('../models/ActivityLog');
const { generateReferralLink } = require('../utils/referralCodeGenerator');
const { calculateReferralBonus } = require('../utils/calculateEarnings');
const { REFERRAL_BONUS } = require('../config/serverConfig');

/**
 * @desc    Get user's referral code
 * @route   GET /api/referrals/my-code
 * @access  Private
 */
exports.getMyReferralCode = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const referralLink = generateReferralLink(user.referralCode);

    res.status(200).json({
      success: true,
      referralCode: user.referralCode,
      referralLink,
      referralCount: user.referralCount,
      totalEarnings: user.referralEarnings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's referrals
 * @route   GET /api/referrals/my-referrals
 * @access  Private
 */
exports.getMyReferrals = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const referrals = await Referral.find({ referrerUser: userId })
      .populate('referredUser', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Referral.countDocuments({ referrerUser: userId });

    // Calculate stats
    const verified = await Referral.countDocuments({
      referrerUser: userId,
      status: 'verified'
    });
    const pending = await Referral.countDocuments({
      referrerUser: userId,
      status: 'pending'
    });

    res.status(200).json({
      success: true,
      data: referrals,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      stats: {
        verified,
        pending,
        rejected: total - verified - pending
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get referral earnings
 * @route   GET /api/referrals/earnings
 * @access  Private
 */
exports.getReferralEarnings = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Get earning breakdown
    const referrals = await Referral.find({ referrerUser: userId });

    const earningBreakdown = {
      total: user.referralEarnings,
      claimed: referrals
        .filter(r => r.bonusClaimed)
        .reduce((sum, r) => sum + r.bonusAmount, 0),
      pending: referrals
        .filter(r => !r.bonusClaimed && r.status === 'verified')
        .reduce((sum, r) => sum + r.bonusAmount, 0),
      unverified: referrals
        .filter(r => r.status === 'pending')
        .reduce((sum, r) => sum + r.bonusAmount, 0)
    };

    const monthlyEarnings = await getMonthlyReferralEarnings(userId);

    res.status(200).json({
      success: true,
      totalReferrals: user.referralCount,
      earningBreakdown,
      monthlyEarnings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Claim referral bonus
 * @route   POST /api/referrals/claim-bonus/:referralId
 * @access  Private
 */
exports.claimBonus = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { referralId } = req.params;

    const referral = await Referral.findById(referralId);

    if (!referral) {
      return res.status(404).json({
        error: 'Referral not found'
      });
    }

    if (referral.referrerUser.toString() !== userId) {
      return res.status(403).json({
        error: 'Not authorized to claim this bonus'
      });
    }

    if (referral.bonusClaimed) {
      return res.status(400).json({
        error: 'Bonus already claimed'
      });
    }

    if (referral.status !== 'verified') {
      return res.status(400).json({
        error: 'Referral is not verified'
      });
    }

    // Update referral
    referral.bonusClaimed = true;
    referral.claimedAt = new Date();
    await referral.save();

    // Update user balance
    const user = await User.findById(userId);
    user.balance += referral.bonusAmount;
    user.totalEarned += referral.bonusAmount;
    await user.save();

    // Log activity
    await ActivityLog.create({
      userId,
      action: 'referral_earned',
      description: `Claimed referral bonus of ${referral.bonusAmount}`,
      severity: 'info'
    });

    res.status(200).json({
      success: true,
      message: 'Bonus claimed successfully',
      bonusAmount: referral.bonusAmount,
      newBalance: user.balance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get referral statistics
 * @route   GET /api/referrals/stats
 * @access  Private
 */
exports.getReferralStats = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    const user = await User.findById(userId);

    const referrals = await Referral.find({ referrerUser: userId });

    const stats = {
      totalReferrals: user.referralCount,
      verifiedReferrals: referrals.filter(r => r.status === 'verified').length,
      pendingReferrals: referrals.filter(r => r.status === 'pending').length,
      rejectedReferrals: referrals.filter(r => r.status === 'rejected').length,
      claimedBonuses: referrals.filter(r => r.bonusClaimed).length,
      totalEarned: user.referralEarnings,
      averageBonus: referrals.length > 0
        ? (referrals.reduce((sum, r) => sum + r.bonusAmount, 0) / referrals.length).toFixed(2)
        : 0
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to get monthly referral earnings
 */
async function getMonthlyReferralEarnings(userId) {
  const referrals = await Referral.find({ referrerUser: userId }).lean();

  const monthlyData = {};

  referrals.forEach(referral => {
    const date = new Date(referral.createdAt);
    const monthKey = date.toISOString().substring(0, 7); // YYYY-MM

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        referrals: 0,
        earnings: 0
      };
    }

    monthlyData[monthKey].referrals += 1;
    if (referral.bonusClaimed) {
      monthlyData[monthKey].earnings += referral.bonusAmount;
    }
  });

  return Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month));
}

module.exports = exports;
