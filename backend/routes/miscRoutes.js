const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');

// @route   GET /api/misc/status
// @desc    Get system status
// @access  Public
router.get('/status', (req, res) => {
  res.json({
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// @route   GET /api/misc/ping
// @desc    Health check ping
// @access  Public
router.get('/ping', (req, res) => {
  res.json({
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

// @route   GET /api/misc/version
// @desc    Get API version
// @access  Public
router.get('/version', (req, res) => {
  res.json({
    version: '1.0.0',
    name: 'Task Referral Platform API'
  });
});

// @route   GET /api/misc/health
// @desc    Get system health status
// @access  Public
router.get('/health', systemController.getSystemHealth);

module.exports = router;
