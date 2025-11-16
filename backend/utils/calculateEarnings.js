/**
 * Calculate earnings from task completion
 * @param {Number} taskReward - Reward amount from task
 * @param {Object} userPlan - User's subscription plan object
 * @returns {Number} Final earning amount
 */
const calculateTaskEarning = (taskReward, userPlan = null) => {
  if (!taskReward || taskReward <= 0) return 0;

  let earning = taskReward;

  // Apply plan bonus if user has subscription
  if (userPlan && userPlan.benefits && userPlan.benefits.earningBonus > 0) {
    const bonus = taskReward * (userPlan.benefits.earningBonus / 100);
    earning = taskReward + bonus;
  }

  return earning;
};

/**
 * Calculate referral bonus
 * @param {Number} referralBonus - Base referral bonus amount
 * @param {Number} referralCount - Total number of successful referrals
 * @returns {Number} Referral bonus (can be tiered)
 */
const calculateReferralBonus = (referralBonus = 100, referralCount = 0) => {
  let bonus = referralBonus;

  // Tiered bonus system
  if (referralCount >= 5) {
    bonus = referralBonus * 1.25; // 25% bonus for 5+ referrals
  } else if (referralCount >= 10) {
    bonus = referralBonus * 1.5; // 50% bonus for 10+ referrals
  } else if (referralCount >= 20) {
    bonus = referralBonus * 2; // 100% bonus for 20+ referrals
  }

  return bonus;
};

/**
 * Calculate withdrawal amount with fees
 * @param {Number} amount - Withdrawal amount
 * @param {Number} feePercentage - Fee percentage (default 2%)
 * @returns {Object} { grossAmount, fee, netAmount }
 */
const calculateWithdrawalWithFees = (amount, feePercentage = 2) => {
  if (amount <= 0) {
    return {
      grossAmount: 0,
      fee: 0,
      netAmount: 0
    };
  }

  const fee = amount * (feePercentage / 100);
  const netAmount = amount - fee;

  return {
    grossAmount: amount,
    fee: Math.round(fee * 100) / 100, // Round to 2 decimals
    netAmount: Math.round(netAmount * 100) / 100
  };
};

/**
 * Calculate subscription cost with taxes
 * @param {Number} price - Base price
 * @param {Number} taxPercentage - Tax percentage (default 10%)
 * @returns {Object} { basePrice, tax, totalPrice }
 */
const calculateSubscriptionCost = (price, taxPercentage = 10) => {
  if (price <= 0) {
    return {
      basePrice: 0,
      tax: 0,
      totalPrice: 0
    };
  }

  const tax = price * (taxPercentage / 100);
  const totalPrice = price + tax;

  return {
    basePrice: price,
    tax: Math.round(tax * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100
  };
};

/**
 * Calculate daily earning limit based on plan
 * @param {Object} userPlan - User's subscription plan
 * @param {Number} tasksCompleted - Number of tasks completed today
 * @returns {Object} { dailyLimit, currentEarnings, remainingLimit, canEarnMore }
 */
const calculateDailyEarningLimit = (userPlan, currentEarnings = 0) => {
  const dailyLimit = userPlan?.benefits?.dailyEarningLimit || null;

  if (!dailyLimit) {
    return {
      dailyLimit: null,
      currentEarnings,
      remainingLimit: null,
      canEarnMore: true
    };
  }

  const remainingLimit = Math.max(0, dailyLimit - currentEarnings);

  return {
    dailyLimit,
    currentEarnings: Math.round(currentEarnings * 100) / 100,
    remainingLimit: Math.round(remainingLimit * 100) / 100,
    canEarnMore: remainingLimit > 0
  };
};

/**
 * Calculate total earnings summary
 * @param {Number} taskEarnings - Total from tasks
 * @param {Number} referralEarnings - Total from referrals
 * @param {Number} bonusEarnings - Total from bonuses
 * @returns {Object} Summary object
 */
const calculateEarningsSummary = (taskEarnings = 0, referralEarnings = 0, bonusEarnings = 0) => {
  const totalEarned = taskEarnings + referralEarnings + bonusEarnings;

  return {
    taskEarnings: Math.round(taskEarnings * 100) / 100,
    referralEarnings: Math.round(referralEarnings * 100) / 100,
    bonusEarnings: Math.round(bonusEarnings * 100) / 100,
    totalEarned: Math.round(totalEarned * 100) / 100,
    breakdown: {
      taskPercentage: totalEarned > 0 ? ((taskEarnings / totalEarned) * 100).toFixed(2) : 0,
      referralPercentage: totalEarned > 0 ? ((referralEarnings / totalEarned) * 100).toFixed(2) : 0,
      bonusPercentage: totalEarned > 0 ? ((bonusEarnings / totalEarned) * 100).toFixed(2) : 0
    }
  };
};

module.exports = {
  calculateTaskEarning,
  calculateReferralBonus,
  calculateWithdrawalWithFees,
  calculateSubscriptionCost,
  calculateDailyEarningLimit,
  calculateEarningsSummary
};
