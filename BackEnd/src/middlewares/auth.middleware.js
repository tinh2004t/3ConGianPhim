const jwt = require('jsonwebtoken');
const logger = require('../utils/logger'); // Sử dụng logger hiện có của bạn

const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

// Hàm lấy IP thực của client (giống như trong auth controller)
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip;
};

// Hàm kiểm tra token và xử lý hết hạn
const verifyAndCheckExpiration = (token) => {
  try {
    // Verify token với jwt.verify sẽ tự động kiểm tra expiration
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // Kiểm tra thêm thời gian hết hạn (double check)
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      throw new Error('Token expired');
    }
    
    return { success: true, decoded, expired: false };
  } catch (error) {
    // Kiểm tra các loại lỗi khác nhau
    if (error.name === 'TokenExpiredError' || error.message === 'Token expired') {
      return { success: false, decoded: null, expired: true, error: 'Token đã hết hạn' };
    } else if (error.name === 'JsonWebTokenError') {
      return { success: false, decoded: null, expired: false, error: 'Token không hợp lệ' };
    } else if (error.name === 'NotBeforeError') {
      return { success: false, decoded: null, expired: false, error: 'Token chưa có hiệu lực' };
    } else {
      return { success: false, decoded: null, expired: false, error: 'Lỗi xác thực token' };
    }
  }
};

// Middleware xác thực chính với xử lý token hết hạn
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const clientIP = getClientIP(req);
  const userAgent = req.get('User-Agent');

  // Kiểm tra header Authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.security('Authentication failed - Missing or invalid authorization header', {
      ip: clientIP,
      userAgent,
      authHeader: authHeader ? 'Present but invalid format' : 'Missing'
    });
    
    return res.status(401).json({ 
      message: 'Token xác thực không được cung cấp',
      code: 'MISSING_TOKEN'
    });
  }

  const token = authHeader.split(' ')[1];
  
  // Kiểm tra token có tồn tại không
  if (!token) {
    logger.security('Authentication failed - Empty token', {
      ip: clientIP,
      userAgent
    });
    
    return res.status(401).json({ 
      message: 'Token xác thực trống',
      code: 'EMPTY_TOKEN'
    });
  }

  // Verify và kiểm tra token
  const verificationResult = verifyAndCheckExpiration(token);
  
  if (!verificationResult.success) {
    if (verificationResult.expired) {
      // Token đã hết hạn - log và yêu cầu đăng nhập lại
      logger.security('Authentication failed - Token expired', {
        ip: clientIP,
        userAgent,
        tokenLength: token.length,
        error: verificationResult.error
      });
      
      return res.status(401).json({ 
        message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
        code: 'TOKEN_EXPIRED',
        expired: true
      });
    } else {
      // Token không hợp lệ
      logger.security('Authentication failed - Invalid token', {
        ip: clientIP,
        userAgent,
        tokenLength: token.length,
        error: verificationResult.error
      });
      
      return res.status(403).json({ 
        message: verificationResult.error,
        code: 'INVALID_TOKEN'
      });
    }
  }

  // Token hợp lệ - gắn thông tin user vào request
  req.user = verificationResult.decoded;
  req.tokenInfo = {
    issuedAt: new Date(verificationResult.decoded.iat * 1000),
    expiresAt: new Date(verificationResult.decoded.exp * 1000),
    timeUntilExpiry: verificationResult.decoded.exp - Math.floor(Date.now() / 1000)
  };

  // Log thành công (chỉ log khi cần thiết, tránh spam log)
  if (process.env.NODE_ENV === 'development') {
    logger.info('Authentication successful', {
      ip: clientIP,
      userId: req.user.userId,
      username: req.user.username,
      role: req.user.role,
      timeUntilExpiry: req.tokenInfo.timeUntilExpiry
    });
  }

  next();
};

// Middleware kiểm tra quyền admin (không thay đổi logic, chỉ cải thiện logging)
exports.requireAdmin = (req, res, next) => {
  const clientIP = getClientIP(req);
  
  if (req.user.role !== 'admin') {
    logger.security('Admin access denied', {
      ip: clientIP,
      userId: req.user.userId,
      username: req.user.username,
      currentRole: req.user.role,
      attemptedResource: req.originalUrl
    });
    
    return res.status(403).json({ 
      message: 'Chỉ admin mới có quyền truy cập',
      code: 'ADMIN_REQUIRED'
    });
  }
  
  next();
};

// Middleware kiểm tra token sắp hết hạn (tùy chọn)
exports.checkTokenExpiringSoon = (thresholdMinutes = 30) => {
  return (req, res, next) => {
    if (req.tokenInfo && req.tokenInfo.timeUntilExpiry) {
      const timeUntilExpiryMinutes = req.tokenInfo.timeUntilExpiry / 60;
      
      if (timeUntilExpiryMinutes <= thresholdMinutes) {
        // Thêm header cảnh báo token sắp hết hạn
        res.set('X-Token-Expires-Soon', 'true');
        res.set('X-Token-Expires-In', req.tokenInfo.timeUntilExpiry.toString());
        
        logger.info('Token expiring soon', {
          userId: req.user.userId,
          username: req.user.username,
          timeUntilExpiryMinutes: timeUntilExpiryMinutes.toFixed(2)
        });
      }
    }
    
    next();
  };
};

// Middleware làm mới token (tùy chọn)
exports.refreshTokenIfNeeded = (req, res, next) => {
  // Chỉ làm mới nếu token sắp hết hạn trong vòng 15 phút
  if (req.tokenInfo && req.tokenInfo.timeUntilExpiry < 900) { // 15 phút = 900 giây
    try {
      // Tạo token mới với thông tin hiện tại
      const newToken = jwt.sign(
        { 
          userId: req.user.userId, 
          role: req.user.role, 
          username: req.user.username 
        },
        SECRET_KEY,
        { expiresIn: '1d' }
      );
      
      // Gửi token mới trong header response
      res.set('X-New-Token', newToken);
      res.set('X-Token-Refreshed', 'true');
      
      logger.info('Token refreshed automatically', {
        userId: req.user.userId,
        username: req.user.username,
        oldTokenTimeLeft: req.tokenInfo.timeUntilExpiry
      });
    } catch (error) {
      logger.error('Failed to refresh token', {
        userId: req.user.userId,
        error: error.message
      });
    }
  }
  
  next();
};

// Hàm tiện ích để kiểm tra token từ bên ngoài
exports.validateToken = (token) => {
  return verifyAndCheckExpiration(token);
};

// Hàm tạo token mới
exports.generateToken = (userId, role, username, expiresIn = '1d') => {
  return jwt.sign(
    { userId, role, username },
    SECRET_KEY,
    { expiresIn }
  );
};