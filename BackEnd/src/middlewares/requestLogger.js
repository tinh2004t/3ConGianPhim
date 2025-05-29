// middleware/requestLogger.js
const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  // Lấy IP thực của client
  req.clientIP = req.headers['x-forwarded-for'] || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress ||
                 (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                 req.ip;

  // Log tất cả requests đến API endpoints quan trọng
  const sensitiveRoutes = ['/api/auth/register', '/api/auth/login', '/api/auth/forgot-password', '/api/auth/reset-password'];
  
  if (sensitiveRoutes.some(route => req.originalUrl.includes(route))) {
    logger.info('API Request', {
      method: req.method,
      url: req.originalUrl,
      ip: req.clientIP,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }

  next();
};

module.exports = requestLogger;