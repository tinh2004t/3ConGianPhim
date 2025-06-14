// utils/tokenCleanup.js - Tiện ích dọn dẹp token

const jwt = require('jsonwebtoken');
const logger = require('./logger');

const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

// Model cho blacklist token (tùy chọn)
// const TokenBlacklist = require('../models/TokenBlacklist.model');

class TokenManager {
  constructor() {
    this.blacklistedTokens = new Set(); // Trong memory, bạn có thể thay bằng Redis
  }

  // Kiểm tra token có trong blacklist không
  isTokenBlacklisted(token) {
    return this.blacklistedTokens.has(token);
  }

  // Thêm token vào blacklist
  blacklistToken(token, reason = 'logout') {
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        this.blacklistedTokens.add(token);
        
        logger.info('Token blacklisted', {
          userId: decoded.userId,
          username: decoded.username,
          reason,
          expiresAt: new Date(decoded.exp * 1000)
        });

        // Tự động xóa token khỏi blacklist khi hết hạn
        const timeUntilExpiry = (decoded.exp * 1000) - Date.now();
        if (timeUntilExpiry > 0) {
          setTimeout(() => {
            this.blacklistedTokens.delete(token);
            logger.info('Expired token removed from blacklist', {
              userId: decoded.userId,
              username: decoded.username
            });
          }, timeUntilExpiry);
        }
        
        return true;
      }
    } catch (error) {
      logger.error('Failed to blacklist token', {
        error: error.message,
        reason
      });
    }
    
    return false;
  }

  // Xóa tất cả token hết hạn khỏi blacklist
  cleanupExpiredTokens() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const token of this.blacklistedTokens) {
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp && (decoded.exp * 1000) < now) {
          this.blacklistedTokens.delete(token);
          cleanedCount++;
        }
      } catch (error) {
        // Token không thể decode, xóa luôn
        this.blacklistedTokens.delete(token);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      logger.info('Token cleanup completed', {
        removedTokens: cleanedCount,
        remainingTokens: this.blacklistedTokens.size
      });
    }
    
    return cleanedCount;
  }

  // Lấy thống kê blacklist
  getBlacklistStats() {
    return {
      totalBlacklistedTokens: this.blacklistedTokens.size,
      lastCleanup: new Date().toISOString()
    };
  }

  // Middleware để kiểm tra blacklist
  checkBlacklist() {
    return (req, res, next) => {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        
        if (this.isTokenBlacklisted(token)) {
          logger.security('Blacklisted token attempted access', {
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            tokenLength: token.length
          });
          
          return res.status(401).json({
            message: 'Token đã bị vô hiệu hóa',
            code: 'TOKEN_BLACKLISTED'
          });
        }
      }
      
      next();
    };
  }
}

// Singleton instance
const tokenManager = new TokenManager();

// Tự động dọn dẹp mỗi giờ
setInterval(() => {
  tokenManager.cleanupExpiredTokens();
}, 3600000); // 1 giờ

// Export functions
module.exports = {
  tokenManager,
  
  // Hàm tiện ích để validate token
  validateToken: (token) => {
    if (tokenManager.isTokenBlacklisted(token)) {
      return { 
        valid: false, 
        reason: 'Token đã bị blacklist',
        code: 'BLACKLISTED'
      };
    }
    
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      return { 
        valid: true, 
        decoded,
        code: 'VALID'
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return { 
          valid: false, 
          reason: 'Token đã hết hạn',
          code: 'EXPIRED',
          expired: true
        };
      }
      
      return { 
        valid: false, 
        reason: 'Token không hợp lệ',
        code: 'INVALID'
      };
    }
  },

  // Hàm blacklist token
  blacklistToken: (token, reason) => {
    return tokenManager.blacklistToken(token, reason);
  },

  // Middleware kiểm tra blacklist
  checkBlacklist: () => {
    return tokenManager.checkBlacklist();
  },

  // Hàm dọn dẹp thủ công
  cleanupTokens: () => {
    return tokenManager.cleanupExpiredTokens();
  },

  // Lấy thống kê
  getStats: () => {
    return tokenManager.getBlacklistStats();
  }
};