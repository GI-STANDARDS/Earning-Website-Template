const Task = require('../models/Task');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

/**
 * @desc    Get all available tasks (paginated)
 * @param   {Object} req - Express request
 * @param   {Object} res - Express response
 * @access  Public
 */
exports.getAllTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status } = req.query;
    
    // Build query filter
    const filter = { status: 'active' };
    if (category) filter.category = category;
    if (status) filter.status = status;

    // Pagination
    const skip = (page - 1) * limit;
    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .select('-__v')
      .sort({ priority: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get single task by ID
 * @param   {Object} req - Express request
 * @param   {Object} res - Express response
 * @access  Public
 */
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .select('-__v')
      .populate('createdBy', 'firstName lastName email');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Complete a task
 * @param   {Object} req - Express request (taskId in body)
 * @param   {Object} res - Express response
 * @access  Private
 */
exports.completeTask = async (req, res) => {
  try {
    const { taskId, proof } = req.body;
    const userId = req.user.id;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: 'Task ID is required'
      });
    }

    // Find task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    if (task.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Task is not active'
      });
    }

    // Check if task requires proof
    if (task.proofRequired && !proof) {
      return res.status(400).json({
        success: false,
        error: 'Proof is required for this task'
      });
    }

    // Check daily limit
    if (task.dailyLimit) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const completions = await ActivityLog.countDocuments({
        userId,
        taskId,
        type: 'task_completed',
        createdAt: { $gte: today }
      });

      if (completions >= task.dailyLimit) {
        return res.status(400).json({
          success: false,
          error: 'Daily limit reached for this task'
        });
      }
    }

    // Update user balance
    const user = await User.findById(userId);
    user.balance += task.reward;
    user.totalEarned += task.reward;
    await user.save();

    // Increment total completions
    task.totalCompletions += 1;
    await task.save();

    // Log activity
    await ActivityLog.create({
      userId,
      taskId,
      type: 'task_completed',
      description: `Completed task: ${task.title}`,
      metadata: { reward: task.reward, proof }
    });

    res.status(200).json({
      success: true,
      message: 'Task completed successfully',
      reward: task.reward,
      newBalance: user.balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get user's completed tasks
 * @param   {Object} req - Express request
 * @param   {Object} res - Express response
 * @access  Private
 */
exports.getUserCompletedTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    const skip = (page - 1) * limit;
    const total = await ActivityLog.countDocuments({
      userId,
      type: 'task_completed'
    });

    const completedTasks = await ActivityLog.find({
      userId,
      type: 'task_completed'
    })
      .populate('taskId', 'title description reward category')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.status(200).json({
      success: true,
      count: completedTasks.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: completedTasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Create new task (Admin only)
 * @param   {Object} req - Express request
 * @param   {Object} res - Express response
 * @access  Private - Admin
 */
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      reward,
      instructions,
      proofRequired,
      proofInstructions,
      url,
      priority,
      dailyLimit
    } = req.body;

    // Validation
    if (!title || !description || !reward || !instructions) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const task = new Task({
      title,
      description,
      category,
      reward,
      instructions,
      proofRequired,
      proofInstructions,
      url,
      priority,
      dailyLimit,
      createdBy: req.user.id,
      status: 'active'
    });

    await task.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Update task (Admin only)
 * @param   {Object} req - Express request
 * @param   {Object} res - Express response
 * @access  Private - Admin
 */
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating createdBy
    delete updates.createdBy;

    const task = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Delete task (Admin only)
 * @param   {Object} req - Express request
 * @param   {Object} res - Express response
 * @access  Private - Admin
 */
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
