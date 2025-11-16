const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'object', 'array'],
      default: 'string'
    },
    description: {
      type: String,
      default: null
    },
    category: {
      type: String,
      enum: [
        'payment',
        'referral',
        'task',
        'subscription',
        'email',
        'security',
        'general'
      ],
      default: 'general'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for performance
settingsSchema.index({ key: 1 });
settingsSchema.index({ category: 1 });

module.exports = mongoose.model('Settings', settingsSchema);
