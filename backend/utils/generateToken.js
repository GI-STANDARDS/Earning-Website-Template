const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRE } = require('../config/serverConfig');

/**
 * Generate JWT token for user
 * @param {String} userId - User ID
 * @param {String} role - User role (user/admin)
 * @returns {String} JWT token
 */
const generateToken = (userId, role = 'user') => {
  try {
    const token = jwt.sign(
      {
        id: userId,
        role: role,
        iat: Date.now()
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );
    return token;
  } catch (error) {
    throw new Error('Token generation failed: ' + error.message);
  }
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    throw new Error('Invalid token');
  }
};

/**
 * Decode token without verification (use carefully)
 * @param {String} token - JWT token
 * @returns {Object} Decoded payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error('Failed to decode token');
  }
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
};
