const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: [
        'login',
        'logout',
        'task_completed',
        'task_failed',
        'task_submitted',
        'subscription_purchased',
        'subscription_expired',
        'withdrawal_requested',
        'withdrawal_completed',
        'payment_received',
        'profile_updated',
        'password_changed',
        'referral_earned',
        'email_verified',
        'banned',
        'unbanned',
        'other'
      ]
    },
    description: {
      type: String,
      default: null
    },
    ipAddress: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    },
    relatedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'error', 'critical'],
      default: 'info'
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: false }
);

// Index for performance
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ severity: 1 });

// TTL Index - Auto delete logs after 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
