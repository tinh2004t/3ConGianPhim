const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const PasswordReset = require('../models/PasswordReset.model');
const transporter = require('../utils/mail'); // ✅ Dùng transporter từ mail.js

const SECRET_KEY = 'your_secret_key'; // Bạn nên dùng process.env.SECRET_KEY

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    return res.status(400).json({ message: 'Username or email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ username, email, passwordHash });

  await user.save();
  res.status(201).json({ message: 'User created successfully' });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role, username: user.username },
    SECRET_KEY,
    { expiresIn: '1d' }
  );
  res.json({ token });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email là bắt buộc' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });

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

    res.json({ message: 'Mã xác minh đã được gửi', email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3') });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi gửi mã xác minh' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ message: 'Thiếu thông tin' });

    const reset = await PasswordReset.findOne({ email, code });
    if (!reset) return res.status(400).json({ message: 'Mã không đúng hoặc đã hết hạn' });

    const hashed = await bcrypt.hash(newPassword, 10);
    const result = await User.updateOne({ email }, { passwordHash: hashed });
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Không thể cập nhật mật khẩu' });

    await PasswordReset.deleteMany({ email });
    res.json({ message: 'Cập nhật mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi đặt lại mật khẩu' });
  }
};

exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const reset = await PasswordReset.findOne({ email, code });

    if (reset) {
      const ttl = 600000; // 10 phút
      const timeLeft = Math.max(0, reset.createdAt.getTime() + ttl - Date.now());
      return res.json({ valid: true, timeLeft });
    }
    res.json({ valid: false });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
