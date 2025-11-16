const User = require('../models/User');
const Task = require('../models/Task');
const Payment = require('../models/Payment');
const ActivityLog = require('../models/ActivityLog');
const Plan = require('../models/Plan');

/**
 * @desc    Get system health status
 * @route   GET /api/system/health
 * @access  Public
 */
exports.getSystemHealth = async (req, res) => {
  try {
    const uptime = process.uptime();
    const memory = process.memoryUsage();

    res.status(200).json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptime),
        formatted: formatUptime(uptime)
      },
      memory: {
        heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
        external: `${Math.round(memory.external / 1024 / 1024)} MB`
      },
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get database connection status
 * @route   GET /api/system/db-status
 * @access  Private - Admin
 */
exports.getDatabaseStatus = async (req, res) => {
  try {
    const collections = await User.db.listCollections().toArray();
    
    const stats = {
      users: await User.countDocuments(),
      tasks: await Task.countDocuments(),
      plans: await Plan.countDocuments(),
      payments: await Payment.countDocuments(),
      activityLogs: await ActivityLog.countDocuments()
    };

    res.status(200).json({
      success: true,
      database: {
        connected: true,
        collections: collections.map(c => c.name),
        stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'disconnected',
      error: error.message
    });
  }
};

/**
 * @desc    Get system configuration (sanitized)
 * @route   GET /api/system/config
 * @access  Private - Admin
 */
exports.getSystemConfig = async (req, res) => {
  try {
    const config = {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT || 5000,
      corsOrigins: [
        'http://localhost:3000',
        'http://localhost:5000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5000'
      ],
      features: {
        emailVerification: true,
        referralSystem: true,
        subscriptionPlans: true,
        paymentGateway: !!process.env.STRIPE_SECRET_KEY,
        adminDashboard: true
      },
      limits: {
        rateLimitWindow: process.env.RATE_LIMIT_WINDOW_MS || 900000,
        rateLimitMaxRequests: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
        maxUploadSize: '10MB'
      }
    };

    res.status(200).json({
      success: true,
      config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get system statistics and metrics
 * @route   GET /api/system/stats
 * @access  Private - Admin
 */
exports.getSystemStats = async (req, res) => {
  try {
    const stats = {
      timestamp: new Date().toISOString(),
      users: {
        total: await User.countDocuments(),
        active: await User.countDocuments({ isActive: true }),
        banned: await User.countDocuments({ isBanned: true }),
        withSubscription: await User.countDocuments({ subscriptionStatus: 'active' })
      },
      tasks: {
        total: await Task.countDocuments(),
        active: await Task.countDocuments({ status: 'active' }),
        inactive: await Task.countDocuments({ status: 'inactive' })
      },
      plans: {
        total: await Plan.countDocuments(),
        active: await Plan.countDocuments({ status: 'active' })
      },
      payments: {
        total: await Payment.countDocuments(),
        completed: await Payment.countDocuments({ status: 'completed' }),
        pending: await Payment.countDocuments({ status: 'pending' }),
        failed: await Payment.countDocuments({ status: 'failed' })
      },
      activityLogs: {
        total: await ActivityLog.countDocuments()
      }
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get growth metrics
 * @route   GET /api/system/growth
 * @access  Private - Admin
 */
exports.getGrowthMetrics = async (req, res) => {
  try {
    const periods = [7, 14, 30, 90]; // days
    const metrics = {};

    for (const days of periods) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      metrics[`last${days}Days`] = {
        newUsers: await User.countDocuments({ createdAt: { $gte: startDate } }),
        completedTasks: await ActivityLog.countDocuments({
          type: 'task_completed',
          createdAt: { $gte: startDate }
        }),
        totalPayments: await Payment.countDocuments({
          status: 'completed',
          createdAt: { $gte: startDate }
        }),
        revenue: (
          await Payment.aggregate([
            {
              $match: {
                status: 'completed',
                createdAt: { $gte: startDate }
              }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ])
        )[0]?.total || 0
      };
    }

    res.status(200).json({
      success: true,
      metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get performance metrics
 * @route   GET /api/system/performance
 * @access  Private - Admin
 */
exports.getPerformanceMetrics = async (req, res) => {
  try {
    // Get most completed tasks
    const topTasks = await ActivityLog.aggregate([
      { $match: { type: 'task_completed' } },
      { $group: { _id: '$taskId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'tasks',
          localField: '_id',
          foreignField: '_id',
          as: 'taskInfo'
        }
      }
    ]);

    // Get most subscribed plans
    const topPlans = await User.aggregate([
      { $match: { subscriptionPlan: { $ne: null } } },
      { $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'plans',
          localField: '_id',
          foreignField: '_id',
          as: 'planInfo'
        }
      }
    ]);

    // Get payment method distribution
    const paymentMethods = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$method', count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
      { $sort: { revenue: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        topTasks: topTasks.map(t => ({
          taskId: t._id,
          name: t.taskInfo[0]?.title,
          completions: t.count
        })),
        topPlans: topPlans.map(p => ({
          planId: p._id,
          name: p.planInfo[0]?.name,
          subscribers: p.count
        })),
        paymentMethods
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
 * @desc    Run system diagnostics
 * @route   GET /api/system/diagnostics
 * @access  Private - Admin
 */
exports.runDiagnostics = async (req, res) => {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      checks: {}
    };

    // Check database connection
    try {
      await User.findOne().select('_id').lean();
      diagnostics.checks.database = { status: 'ok' };
    } catch (error) {
      diagnostics.checks.database = { status: 'error', message: error.message };
    }

    // Check environment variables
    const requiredEnvVars = ['NODE_ENV', 'PORT', 'MONGODB_URI', 'JWT_SECRET'];
    diagnostics.checks.environment = {
      status: requiredEnvVars.every(v => process.env[v]) ? 'ok' : 'warning',
      missing: requiredEnvVars.filter(v => !process.env[v])
    };

    // Check data integrity
    const dataIntegrity = {
      users: await User.countDocuments(),
      orphanedActivities: await ActivityLog.countDocuments({ userId: null })
    };

    diagnostics.checks.dataIntegrity = {
      status: dataIntegrity.orphanedActivities === 0 ? 'ok' : 'warning',
      issues: dataIntegrity
    };

    // Memory usage
    const memory = process.memoryUsage();
    const heapPercentage = (memory.heapUsed / memory.heapTotal) * 100;

    diagnostics.checks.memory = {
      status: heapPercentage < 90 ? 'ok' : 'warning',
      heapUsagePercentage: Math.round(heapPercentage)
    };

    res.status(200).json({
      success: true,
      diagnostics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Helper function to format uptime
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

module.exports = exports;
