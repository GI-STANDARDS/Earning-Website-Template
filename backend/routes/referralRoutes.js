const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  getMyReferralCode,
  getMyReferrals,
  getReferralEarnings,
  claimBonus,
  getReferralStats
} = require('../controllers/referralController');

// All routes require authentication
router.use(auth);

// @route   GET /api/referrals/my-code
// @desc    Get user's referral code and link
// @access  Private
router.get('/my-code', getMyReferralCode);

// @route   GET /api/referrals/my-referrals
// @desc    Get user's list of referrals
// @access  Private
router.get('/my-referrals', getMyReferrals);

// @route   GET /api/referrals/earnings
// @desc    Get referral earnings breakdown
// @access  Private
router.get('/earnings', getReferralEarnings);

// @route   GET /api/referrals/stats
// @desc    Get referral statistics
// @access  Private
router.get('/stats', getReferralStats);

// @route   POST /api/referrals/claim-bonus/:referralId
// @desc    Claim a pending referral bonus
// @access  Private
router.post('/claim-bonus/:referralId', claimBonus);

module.exports = router;
