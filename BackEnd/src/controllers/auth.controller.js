const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const PasswordReset = require('../models/PasswordReset.model');
const transporter = require('../utils/mail');
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

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const clientIP = getClientIP(req);
    const userAgent = req.get('User-Agent');

    // Kiểm tra user đã tồn tại
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      // Log thông tin đăng ký thất bại do user đã tồn tại
      logger.security('Registration failed - User already exists', {
        ip: clientIP,
        userAgent,
        attemptedUsername: username,
        attemptedEmail: email,
        existingField: existingUser.username === username ? 'username' : 'email'
      });

      return res.status(400).json({ 
        message: 'Tên đăng nhập hoặc email đã tồn tại' 
      });
    }

    // Tạo user mới
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ username, email, passwordHash });

    await user.save();

    // Log đăng ký thành công
    logger.info('User registered successfully', {
      ip: clientIP,
      userAgent,
      username: username,
      email: email
    });

    res.status(201).json({ message: 'Đăng ký thành công' });

  } catch (error) {
    const clientIP = getClientIP(req);
    
    // Xử lý lỗi validation từ mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      // Log lỗi validation
      logger.security('Registration validation failed', {
        ip: clientIP,
        userAgent: req.get('User-Agent'),
        errors: validationErrors,
        attemptedData: {
          username: req.body.username,
          email: req.body.email
        }
      });

      return res.status(400).json({
        message: 'Dữ liệu không hợp lệ',
        errors: validationErrors
      });
    }

    // Log các lỗi khác
    logger.error('Registration error', {
      ip: clientIP,
      error: error.message,
      stack: error.stack,
      attemptedData: {
        username: req.body.username,
        email: req.body.email
      }
    });

    res.status(500).json({ message: 'Lỗi server khi đăng ký' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const clientIP = getClientIP(req);
    const userAgent = req.get('User-Agent');

    const user = await User.findOne({ username });

    if (!user) {
      // Log khi không tìm thấy user
      logger.security('Login failed - User not found', {
        ip: clientIP,
        userAgent,
        attemptedUsername: username
      });

      return res.status(401).json({ 
        message: 'Tên đăng nhập hoặc mật khẩu không đúng' 
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      // Log khi mật khẩu sai
      logger.security('Login failed - Invalid password', {
        ip: clientIP,
        userAgent,
        username: username,
        userId: user._id
      });

      return res.status(401).json({ 
        message: 'Tên đăng nhập hoặc mật khẩu không đúng' 
      });
    }

    // Tạo token và đăng nhập thành công
    const token = jwt.sign(
      { userId: user._id, role: user.role, username: user.username },
      SECRET_KEY,
      { expiresIn: '1d' }
    );

    // Log đăng nhập thành công
    logger.info('User logged in successfully', {
      ip: clientIP,
      userAgent,
      username: username,
      userId: user._id,
      role: user.role
    });

    res.json({ token });

  } catch (error) {
    const clientIP = getClientIP(req);
    
    logger.error('Login error', {
      ip: clientIP,
      error: error.message,
      stack: error.stack,
      attemptedUsername: req.body.username
    });
    
    res.status(500).json({ message: 'Lỗi server khi đăng nhập' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const clientIP = getClientIP(req);
    const userAgent = req.get('User-Agent');

    if (!email) {
      logger.security('Forgot password - Missing email', {
        ip: clientIP,
        userAgent
      });
      return res.status(400).json({ message: 'Email là bắt buộc' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      logger.security('Forgot password - Email not found', {
        ip: clientIP,
        userAgent,
        attemptedEmail: email
      });
      return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });
    }

    const resetCode = crypto.randomInt(100000, 999999).toString();
    await PasswordReset.deleteMany({ email });
    await new PasswordReset({ 
      email, 
      code: resetCode,
      type: 'forgot_password'
    }).save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Mã xác minh đặt lại mật khẩu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Đặt lại mật khẩu</h2>
          <p>Bạn đã yêu cầu đặt lại mật khẩu. Sử dụng mã xác minh dưới đây:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0;">${resetCode}</h1>
          </div>
          <p style="color: #666;">Mã này sẽ hết hạn sau 10 phút.</p>
          <p style="color: #666;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        </div>
      `
    });

    logger.info('Password reset code sent', {
      ip: clientIP,
      userAgent,
      email: email,
      userId: user._id
    });

    res.json({ 
      message: 'Mã xác minh đã được gửi', 
      email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3') 
    });

  } catch (err) {
    const clientIP = getClientIP(req);
    
    logger.error('Forgot password error', {
      ip: clientIP,
      error: err.message,
      stack: err.stack,
      email: req.body.email
    });
    
    res.status(500).json({ message: 'Lỗi gửi mã xác minh' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const clientIP = getClientIP(req);
    const userAgent = req.get('User-Agent');

    if (!email || !code || !newPassword) {
      logger.security('Reset password - Missing information', {
        ip: clientIP,
        userAgent,
        email: email,
        hasCode: !!code,
        hasPassword: !!newPassword
      });
      return res.status(400).json({ message: 'Thiếu thông tin' });
    }

    const reset = await PasswordReset.findOne({ 
      email, 
      code,
      type: 'forgot_password'
    });
    
    if (!reset) {
      logger.security('Reset password - Invalid code', {
        ip: clientIP,
        userAgent,
        email: email,
        attemptedCode: code
      });
      return res.status(400).json({ message: 'Mã không đúng hoặc đã hết hạn' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const result = await User.updateOne({ email }, { passwordHash: hashed });
    
    if (result.matchedCount === 0) {
      logger.error('Reset password - User update failed', {
        ip: clientIP,
        userAgent,
        email: email
      });
      return res.status(404).json({ message: 'Không thể cập nhật mật khẩu' });
    }

    await PasswordReset.deleteMany({ email });

    logger.info('Password reset successfully', {
      ip: clientIP,
      userAgent,
      email: email
    });

    res.json({ message: 'Cập nhật mật khẩu thành công' });

  } catch (err) {
    const clientIP = getClientIP(req);
    
    logger.error('Reset password error', {
      ip: clientIP,
      error: err.message,
      stack: err.stack,
      email: req.body.email
    });
    
    res.status(500).json({ message: 'Lỗi đặt lại mật khẩu' });
  }
};

exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const clientIP = getClientIP(req);
    const reset = await PasswordReset.findOne({ 
      email, 
      code,
      type: 'forgot_password'
    });

    if (reset) {
      const ttl = 600000; // 10 phút
      const timeLeft = Math.max(0, reset.createdAt.getTime() + ttl - Date.now());
      
      logger.info('Reset code verified', {
        ip: clientIP,
        email: email,
        timeLeft: timeLeft
      });
      
      return res.json({ valid: true, timeLeft });
    }

    logger.security('Reset code verification failed', {
      ip: clientIP,
      email: email,
      attemptedCode: code
    });

    res.json({ valid: false });

  } catch (err) {
    const clientIP = getClientIP(req);
    
    logger.error('Verify reset code error', {
      ip: clientIP,
      error: err.message,
      email: req.body.email
    });
    
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.requestChangePassword = async (req, res) => {
  try {
    const { currentPassword } = req.body;
    const clientIP = getClientIP(req);
    const userAgent = req.get('User-Agent');
    const userId = req.user.userId; // Lấy từ token JWT

    if (!currentPassword) {
      logger.security('Change password request - Missing current password', {
        ip: clientIP,
        userAgent,
        userId
      });
      return res.status(400).json({ message: 'Mật khẩu hiện tại là bắt buộc' });
    }

    // Tìm user và xác minh mật khẩu hiện tại
    const user = await User.findById(userId);
    if (!user) {
      logger.security('Change password request - User not found', {
        ip: clientIP,
        userAgent,
        userId
      });
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Kiểm tra mật khẩu hiện tại
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      logger.security('Change password request - Current password incorrect', {
        ip: clientIP,
        userAgent,
        userId,
        username: user.username
      });
      return res.status(401).json({ 
        message: 'Mật khẩu hiện tại không đúng' 
      });
    }

    // Tạo mã xác nhận
    const changeCode = crypto.randomInt(100000, 999999).toString();
    
    // Xóa các mã xác nhận cũ cho email này
    await PasswordReset.deleteMany({ email: user.email });
    
    // Tạo bản ghi mới với type để phân biệt với forgot password
    await new PasswordReset({ 
      email: user.email, 
      code: changeCode,
      type: 'change_password'
    }).save();

    // Gửi email xác nhận
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Mã xác minh đổi mật khẩu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Xác nhận đổi mật khẩu</h2>
          <p>Xin chào <strong>${user.username}</strong>,</p>
          <p>Bạn đã yêu cầu đổi mật khẩu tài khoản. Sử dụng mã xác minh dưới đây:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #28a745; font-size: 32px; margin: 0;">${changeCode}</h1>
          </div>
          <p style="color: #666;">Mã này sẽ hết hạn sau 10 phút.</p>
          <p style="color: #666;">Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            Yêu cầu từ IP: ${clientIP}<br>
            Thiết bị: ${userAgent}
          </p>
        </div>
      `
    });

    // Log yêu cầu đổi mật khẩu thành công
    logger.info('Change password code sent', {
      ip: clientIP,
      userAgent,
      userId,
      username: user.username,
      email: user.email
    });

    res.json({ 
      message: 'Mã xác minh đã được gửi đến email của bạn',
      email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    });

  } catch (error) {
    const clientIP = getClientIP(req);
    
    logger.error('Request change password error', {
      ip: clientIP,
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId
    });
    
    res.status(500).json({ message: 'Lỗi server khi gửi mã xác minh' });
  }
};

exports.confirmChangePassword = async (req, res) => {
  try {
    const { code, newPassword, confirmPassword } = req.body;
    const clientIP = getClientIP(req);
    const userAgent = req.get('User-Agent');
    const userId = req.user.userId;

    // Kiểm tra input
    if (!code || !newPassword || !confirmPassword) {
      logger.security('Change password confirm - Missing information', {
        ip: clientIP,
        userAgent,
        userId,
        hasCode: !!code,
        hasNewPassword: !!newPassword,
        hasConfirmPassword: !!confirmPassword
      });
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    // Kiểm tra mật khẩu xác nhận
    if (newPassword !== confirmPassword) {
      logger.security('Change password confirm - Password mismatch', {
        ip: clientIP,
        userAgent,
        userId
      });
      return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp' });
    }

    // Kiểm tra độ dài mật khẩu mới
    if (newPassword.length < 6) {
      logger.security('Change password confirm - Password too short', {
        ip: clientIP,
        userAgent,
        userId,
        passwordLength: newPassword.length
      });
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    // Tìm user
    const user = await User.findById(userId);
    if (!user) {
      logger.security('Change password confirm - User not found', {
        ip: clientIP,
        userAgent,
        userId
      });
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Kiểm tra mã xác nhận
    const reset = await PasswordReset.findOne({ 
      email: user.email, 
      code: code,
      type: 'change_password'
    });

    if (!reset) {
      logger.security('Change password confirm - Invalid code', {
        ip: clientIP,
        userAgent,
        userId,
        email: user.email,
        attemptedCode: code
      });
      return res.status(400).json({ message: 'Mã xác nhận không đúng hoặc đã hết hạn' });
    }

    // Kiểm tra mã có hết hạn không (10 phút)
    const ttl = 600000; // 10 phút
    const isExpired = (Date.now() - reset.createdAt.getTime()) > ttl;
    if (isExpired) {
      await PasswordReset.deleteOne({ _id: reset._id });
      logger.security('Change password confirm - Code expired', {
        ip: clientIP,
        userAgent,
        userId,
        email: user.email
      });
      return res.status(400).json({ message: 'Mã xác nhận đã hết hạn' });
    }

    // Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      logger.security('Change password confirm - Same as current password', {
        ip: clientIP,
        userAgent,
        userId,
        username: user.username
      });
      return res.status(400).json({ 
        message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại' 
      });
    }

    // Hash mật khẩu mới và cập nhật
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { 
      passwordHash: hashedNewPassword 
    });

    // Xóa mã xác nhận đã sử dụng
    await PasswordReset.deleteMany({ email: user.email });

    // Log đổi mật khẩu thành công
    logger.info('Password changed successfully', {
      ip: clientIP,
      userAgent,
      userId,
      username: user.username,
      email: user.email
    });

    // Gửi email thông báo đổi mật khẩu thành công
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Mật khẩu đã được thay đổi',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Mật khẩu đã được thay đổi thành công</h2>
            <p>Xin chào <strong>${user.username}</strong>,</p>
            <p>Mật khẩu tài khoản của bạn đã được thay đổi thành công vào lúc:</p>
            <p><strong>${new Date().toLocaleString('vi-VN')}</strong></p>
            <hr style="margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              Thay đổi từ IP: ${clientIP}<br>
              Thiết bị: ${userAgent}
            </p>
            <p style="color: #666; font-size: 14px;">
              Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ với chúng tôi ngay lập tức.
            </p>
          </div>
        `
      });
    } catch (emailError) {
      // Log lỗi gửi email nhưng không ảnh hưởng đến response
      logger.error('Failed to send password change notification email', {
        userId,
        email: user.email,
        error: emailError.message
      });
    }

    res.json({ 
      message: 'Đổi mật khẩu thành công',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const clientIP = getClientIP(req);
    
    logger.error('Confirm change password error', {
      ip: clientIP,
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId
    });
    
    res.status(500).json({ message: 'Lỗi server khi đổi mật khẩu' });
  }
};

exports.verifyChangePasswordCode = async (req, res) => {
  try {
    const { code } = req.body;
    const clientIP = getClientIP(req);
    const userId = req.user.userId;

    if (!code) {
      return res.status(400).json({ message: 'Mã xác nhận là bắt buộc' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const reset = await PasswordReset.findOne({ 
      email: user.email, 
      code: code,
      type: 'change_password'
    });

    if (reset) {
      const ttl = 600000; // 10 phút
      const timeLeft = Math.max(0, reset.createdAt.getTime() + ttl - Date.now());
      
      if (timeLeft > 0) {
        logger.info('Change password code verified', {
          ip: clientIP,
          userId,
          email: user.email,
          timeLeft: timeLeft
        });
        
        return res.json({ valid: true, timeLeft });
      }
    }

    logger.security('Change password code verification failed', {
      ip: clientIP,
      userId,
      email: user.email,
      attemptedCode: code
    });

    res.json({ valid: false });

  } catch (error) {
    const clientIP = getClientIP(req);
    
    logger.error('Verify change password code error', {
      ip: clientIP,
      error: error.message,
      userId: req.user?.userId
    });
    
    res.status(500).json({ message: 'Lỗi server' });
  }
};