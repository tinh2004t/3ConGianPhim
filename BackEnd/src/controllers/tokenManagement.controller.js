// Thêm vào auth.controller.js hoặc tạo file riêng tokenManagement.controller.js

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

// Hàm lấy IP thực của client
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip;
};

// Route làm mới token
exports.refreshToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const clientIP = getClientIP(req);
    const userAgent = req.get('User-Agent');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.security('Token refresh failed - Missing authorization header', {
        ip: clientIP,
        userAgent
      });
      
      return res.status(401).json({ 
        message: 'Token không được cung cấp',
        code: 'MISSING_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Verify token hiện tại (có thể đã hết hạn)
      const decoded = jwt.verify(token, SECRET_KEY, { ignoreExpiration: true });
      
      // Kiểm tra token có thực sự hết hạn không
      const currentTime = Math.floor(Date.now() / 1000);
      const tokenExpired = decoded.exp && decoded.exp < currentTime;
      
      // Chỉ cho phép refresh nếu token hết hạn trong vòng 24 giờ
      if (tokenExpired) {
        const timeSinceExpiry = currentTime - decoded.exp;
        if (timeSinceExpiry > 86400) { // 24 giờ = 86400 giây
          logger.security('Token refresh failed - Token expired too long ago', {
            ip: clientIP,
            userAgent,
            userId: decoded.userId,
            timeSinceExpiry
          });
          
          return res.status(401).json({ 
            message: 'Token đã hết hạn quá lâu, vui lòng đăng nhập lại',
            code: 'TOKEN_EXPIRED_TOO_LONG'
          });
        }
      }

      // Tạo token mới
      const newToken = jwt.sign(
        { 
          userId: decoded.userId, 
          role: decoded.role, 
          username: decoded.username 
        },
        SECRET_KEY,
        { expiresIn: '1d' }
      );

      // Log refresh thành công
      logger.info('Token refreshed successfully', {
        ip: clientIP,
        userAgent,
        userId: decoded.userId,
        username: decoded.username,
        wasExpired: tokenExpired
      });

      res.json({ 
        message: 'Token đã được làm mới',
        token: newToken,
        user: {
          userId: decoded.userId,
          username: decoded.username,
          role: decoded.role
        }
      });

    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        logger.security('Token refresh failed - Invalid token', {
          ip: clientIP,
          userAgent,
          error: error.message
        });
        
        return res.status(403).json({ 
          message: 'Token không hợp lệ',
          code: 'INVALID_TOKEN'
        });
      }
      
      throw error;
    }

  } catch (error) {
    const clientIP = getClientIP(req);
    
    logger.error('Token refresh error', {
      ip: clientIP,
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ 
      message: 'Lỗi server khi làm mới token',
      code: 'REFRESH_ERROR'
    });
  }
};

// Route kiểm tra trạng thái token
exports.checkTokenStatus = async (req, res) => {
  try {
    const clientIP = getClientIP(req);
    const tokenInfo = req.tokenInfo; // Được set bởi middleware authenticate
    
    // Tính toán thời gian còn lại
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = req.user.exp - currentTime;
    const timeUntilExpiryMinutes = Math.floor(timeUntilExpiry / 60);
    const timeUntilExpiryHours = Math.floor(timeUntilExpiryMinutes / 60);

    // Xác định trạng thái token
    let status = 'valid';
    let recommendation = null;
    
    if (timeUntilExpiry < 900) { // < 15 phút
      status = 'expires_very_soon';
      recommendation = 'Nên làm mới token ngay';
    } else if (timeUntilExpiry < 1800) { // < 30 phút
      status = 'expires_soon';
      recommendation = 'Nên làm mới token sớm';
    } else if (timeUntilExpiry < 3600) { // < 1 giờ
      status = 'expires_within_hour';
      recommendation = 'Token sẽ hết hạn trong 1 giờ';
    }

    logger.info('Token status checked', {
      ip: clientIP,
      userId: req.user.userId,
      username: req.user.username,
      status,
      timeUntilExpiryMinutes
    });

    res.json({
      message: 'Trạng thái token',
      status,
      timeUntilExpiry,
      timeUntilExpiryMinutes,
      timeUntilExpiryHours,
      issuedAt: tokenInfo.issuedAt,
      expiresAt: tokenInfo.expiresAt,
      recommendation,
      user: {
        userId: req.user.userId,
        username: req.user.username,
        role: req.user.role
      }
    });

  } catch (error) {
    const clientIP = getClientIP(req);
    
    logger.error('Check token status error', {
      ip: clientIP,
      error: error.message,
      userId: req.user?.userId
    });
    
    res.status(500).json({ 
      message: 'Lỗi server khi kiểm tra trạng thái token',
      code: 'STATUS_CHECK_ERROR'
    });
  }
};

// Route logout (blacklist token - tùy chọn)
exports.logout = async (req, res) => {
  try {
    const clientIP = getClientIP(req);
    const userAgent = req.get('User-Agent');

    // Log logout
    logger.info('User logged out', {
      ip: clientIP,
      userAgent,
      userId: req.user.userId,
      username: req.user.username
    });

    // Ở đây bạn có thể thêm logic blacklist token nếu cần
    // Ví dụ: lưu token vào Redis hoặc database với thời gian hết hạn
    
    res.json({ 
      message: 'Đăng xuất thành công',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const clientIP = getClientIP(req);
    
    logger.error('Logout error', {
      ip: clientIP,
      error: error.message,
      userId: req.user?.userId
    });
    
    res.status(500).json({ 
      message: 'Lỗi server khi đăng xuất',
      code: 'LOGOUT_ERROR'
    });
  }
};

// Route xác thực và lấy thông tin user hiện tại
exports.getCurrentUser = async (req, res) => {
  try {
    const User = require('../models/user.model');
    
    // Lấy thông tin user mới nhất từ database
    const user = await User.findById(req.user.userId).select('-passwordHash');
    
    if (!user) {
      logger.security('Get current user failed - User not found in database', {
        userId: req.user.userId,
        username: req.user.username
      });
      
      return res.status(404).json({ 
        message: 'Người dùng không tồn tại',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      message: 'Thông tin người dùng hiện tại',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      tokenInfo: req.tokenInfo
    });

  } catch (error) {
    logger.error('Get current user error', {
      error: error.message,
      userId: req.user?.userId
    });
    
    res.status(500).json({ 
      message: 'Lỗi server khi lấy thông tin user',
      code: 'GET_USER_ERROR'
    });
  }
};