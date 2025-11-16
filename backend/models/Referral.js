const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema(
  {
    referrerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    referredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    referralCode: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    bonusAmount: {
      type: Number,
      required: true
    },
    bonusClaimed: {
      type: Boolean,
      default: false
    },
    claimedAt: {
      type: Date,
      default: null
    },
    claimedVia: {
      type: String,
      enum: ['task_completion', 'subscription', 'manual'],
      default: null
    },
    notes: {
      type: String,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for performance
referralSchema.index({ referrerUser: 1, status: 1 });
referralSchema.index({ referredUser: 1 });
referralSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Referral', referralSchema);
