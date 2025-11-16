const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Public routes
// @route   GET /api/tasks
// @desc    Get all available tasks
// @access  Public
router.get('/', taskController.getAllTasks);

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Public
router.get('/:id', taskController.getTaskById);

// Protected routes (requires authentication)
// @route   POST /api/tasks/complete
// @desc    Mark task as complete
// @access  Private
router.post('/complete', authMiddleware, taskController.completeTask);

// @route   GET /api/tasks/user/completed
// @desc    Get user's completed tasks
// @access  Private
router.get('/user/completed', authMiddleware, taskController.getUserCompletedTasks);

// Admin routes (requires admin privilege)
// @route   POST /api/tasks/admin/create
// @desc    Create new task
// @access  Private - Admin
router.post('/admin/create', authMiddleware, adminMiddleware, taskController.createTask);

// @route   PUT /api/tasks/admin/:id
// @desc    Update task
// @access  Private - Admin
router.put('/admin/:id', authMiddleware, adminMiddleware, taskController.updateTask);

// @route   DELETE /api/tasks/admin/:id
// @desc    Delete task
// @access  Private - Admin
router.delete('/admin/:id', authMiddleware, adminMiddleware, taskController.deleteTask);

module.exports = router;
