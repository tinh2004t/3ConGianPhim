// utils/logger.js
const fs = require('fs');
const path = require('path');

// Tạo thư mục logs nếu chưa có
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = {
  // Ghi log thông tin chung
  info: (message, data = {}) => {
    const logEntry = {
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      data
    };
    
    console.log(`[INFO] ${message}`, data);
    writeToFile('info.log', logEntry);
  },

  // Ghi log lỗi
  error: (message, error = {}) => {
    const logEntry = {
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: {
        message: error.message || error,
        stack: error.stack || ''
      }
    };
    
    console.error(`[ERROR] ${message}`, error);
    writeToFile('error.log', logEntry);
  },

  // Ghi log cảnh báo
  warn: (message, data = {}) => {
    const logEntry = {
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      data
    };
    
    console.warn(`[WARN] ${message}`, data);
    writeToFile('warn.log', logEntry);
  },

  // Ghi log bảo mật (đăng nhập thất bại, validation lỗi)
  security: (message, data = {}) => {
    const logEntry = {
      level: 'SECURITY',
      timestamp: new Date().toISOString(),
      message,
      data
    };
    
    console.log(`[SECURITY] ${message}`, data);
    writeToFile('security.log', logEntry);
  }
};

// Hàm ghi vào file
function writeToFile(filename, logEntry) {
  const logPath = path.join(logsDir, filename);
  const logString = JSON.stringify(logEntry) + '\n';
  
  fs.appendFile(logPath, logString, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}

module.exports = logger;