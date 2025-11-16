const { verifyToken } = require('../utils/generateToken');

/**
 * Protect routes - verify JWT token
 */
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'No token provided, authorization denied'
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.message === 'Token has expired') {
      return res.status(401).json({
        error: 'Token has expired, please login again'
      });
    }
    return res.status(401).json({
      error: 'Invalid token'
    });
  }
};

module.exports = auth;
