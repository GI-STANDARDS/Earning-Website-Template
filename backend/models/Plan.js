const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Plan description is required']
    },
    price: {
      type: Number,
      required: [true, 'Plan price is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR']
    },
    duration: {
      type: Number,
      required: [true, 'Duration in days is required'],
      min: [1, 'Duration must be at least 1 day']
    },
    features: [{
      type: String,
      trim: true
    }],
    benefits: {
      taskLimit: {
        type: Number,
        default: null // null means unlimited
      },
      dailyEarningLimit: {
        type: Number,
        default: null
      },
      withdrawalFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
      },
      prioritySupport: {
        type: Boolean,
        default: false
      },
      earningBonus: {
        type: Number,
        default: 0 // Percentage bonus
      }
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    popular: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
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
planSchema.index({ status: 1, order: 1 });

module.exports = mongoose.model('Plan', planSchema);
