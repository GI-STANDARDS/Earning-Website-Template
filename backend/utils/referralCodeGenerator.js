const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique referral code
 * Format: ABC12345 (8 characters - alphanumeric uppercase)
 * @returns {String} Unique referral code
 */
const generateReferralCode = () => {
  // Generate a short UUID and convert to alphanumeric
  const uuid = uuidv4().replace(/-/g, '');
  const code = uuid.substring(0, 8).toUpperCase();
  return code;
};

/**
 * Generate multiple referral codes (for batch operations)
 * @param {Number} count - Number of codes to generate
 * @returns {Array} Array of unique codes
 */
const generateReferralCodes = (count = 1) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(generateReferralCode());
  }
  return codes;
};

/**
 * Validate referral code format
 * @param {String} code - Referral code to validate
 * @returns {Boolean} true if valid format
 */
const isValidReferralCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  // Check if code is 8 alphanumeric characters
  return /^[A-Z0-9]{8}$/.test(code);
};

/**
 * Generate referral link
 * @param {String} code - Referral code
 * @param {String} baseUrl - Base URL of the app
 * @returns {String} Full referral link
 */
const generateReferralLink = (code, baseUrl = 'http://localhost:3000') => {
  return `${baseUrl}/register?ref=${code}`;
};

module.exports = {
  generateReferralCode,
  generateReferralCodes,
  isValidReferralCode,
  generateReferralLink
};
