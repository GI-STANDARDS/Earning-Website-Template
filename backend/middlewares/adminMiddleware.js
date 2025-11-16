const auth = require('./authMiddleware');

/**
 * Check if user is admin
 * Must be used after auth middleware
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied - Admin only'
    });
  }

  next();
};

module.exports = adminOnly;
