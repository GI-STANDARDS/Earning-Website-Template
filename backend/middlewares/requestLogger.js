const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const statusEmoji = res.statusCode >= 400 ? '❌' : '✅';
      console.log(
        `${statusEmoji} ${logEntry.method} ${logEntry.path} - ${logEntry.status} (${logEntry.duration})`
      );
    }

    // Log to file
    const logFile = path.join(logsDir, 'access.log');
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n', (err) => {
      if (err) console.error('Failed to write to log file:', err);
    });

    // Log errors to error.log
    if (res.statusCode >= 400) {
      const errorLogFile = path.join(logsDir, 'error.log');
      fs.appendFileSync(errorLogFile, JSON.stringify(logEntry) + '\n', (err) => {
        if (err) console.error('Failed to write to error log:', err);
      });
    }

    originalSend.call(this, data);
  };

  next();
};

module.exports = requestLogger;
