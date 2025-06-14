// routes/auth.js - Cập nhật routes hiện có của bạn

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const tokenController = require('../controllers/tokenManagement.controller'); // Nếu tạo file riêng
const { authenticate, requireAdmin, checkTokenExpiringSoon } = require('../middlewares/auth.middleware');

// Routes hiện có (không thay đổi)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-reset-code', authController.verifyResetCode);

// Routes cần authentication
router.post('/request-change-password', authenticate, authController.requestChangePassword);
router.post('/confirm-change-password', authenticate, authController.confirmChangePassword);
router.post('/verify-change-password-code', authenticate, authController.verifyChangePasswordCode);

// ===== ROUTES MỚI CHO QUẢN LÝ TOKEN =====

// Làm mới token
router.post('/refresh-token', tokenController.refreshToken);

// Kiểm tra trạng thái token (yêu cầu authentication)
router.get('/token-status', authenticate, tokenController.checkTokenStatus);

// Lấy thông tin user hiện tại (với cảnh báo token sắp hết hạn)
router.get('/me', 
  authenticate, 
  checkTokenExpiringSoon(30), // Cảnh báo nếu token hết hạn trong 30 phút
  tokenController.getCurrentUser
);

// Đăng xuất
router.post('/logout', authenticate, tokenController.logout);

// ===== ROUTES CHO TESTING/DEVELOPMENT =====
if (process.env.NODE_ENV === 'development') {
  // Route test token validation
  router.get('/test-token', authenticate, (req, res) => {
    res.json({
      message: 'Token hợp lệ',
      user: req.user,
      tokenInfo: req.tokenInfo
    });
  });
  
  // Route test admin
  router.get('/test-admin', authenticate, requireAdmin, (req, res) => {
    res.json({
      message: 'Admin access granted',
      user: req.user
    });
  });
}

module.exports = router;