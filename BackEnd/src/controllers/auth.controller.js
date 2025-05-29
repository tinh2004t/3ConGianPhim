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
    await new PasswordReset({ email, code: resetCode }).save();

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

    // Log yêu cầu reset password thành công
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

    const reset = await PasswordReset.findOne({ email, code });
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

    // Log reset password thành công
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
    const reset = await PasswordReset.findOne({ email, code });

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