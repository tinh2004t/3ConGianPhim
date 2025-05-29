// middleware/requestLogger.js
const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  try {
    // Lấy IP thực của client một cách an toàn
    req.clientIP = req.headers['x-forwarded-for'] || 
                   req.connection?.remoteAddress || 
                   req.socket?.remoteAddress ||
                   req.connection?.socket?.remoteAddress ||
                   req.ip ||
                   'unknown';

    // Log tất cả requests đến API endpoints quan trọng
    const sensitiveRoutes = ['/api/auth/register', '/api/auth/login', '/api/auth/forgot-password', '/api/auth/reset-password'];
    
    if (sensitiveRoutes.some(route => req.originalUrl.includes(route))) {
      logger.info('API Request', {
        method: req.method,
        url: req.originalUrl,
        ip: req.clientIP,
        userAgent: req.get('User-Agent') || 'unknown',
        timestamp: new Date().toISOString()
      });
    }

    next();
  } catch (error) {
    console.error('Error in requestLogger middleware:', error);
    next(); // Vẫn cho request tiếp tục dù có lỗi
  }
};

module.exports = requestLogger;