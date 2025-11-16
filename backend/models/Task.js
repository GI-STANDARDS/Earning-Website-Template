const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    category: {
      type: String,
      enum: ['survey', 'signup', 'download', 'review', 'social', 'other'],
      default: 'other'
    },
    reward: {
      type: Number,
      required: [true, 'Reward amount is required'],
      min: [0, 'Reward cannot be negative']
    },
    instructions: {
      type: String,
      required: [true, 'Instructions are required']
    },
    proofRequired: {
      type: Boolean,
      default: false
    },
    proofInstructions: {
      type: String,
      default: null
    },
    url: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'completed'],
      default: 'active'
    },
    priority: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    dailyLimit: {
      type: Number,
      default: null,
      min: 0
    },
    totalCompletions: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
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
taskSchema.index({ status: 1, createdAt: -1 });
taskSchema.index({ category: 1 });

module.exports = mongoose.model('Task', taskSchema);
