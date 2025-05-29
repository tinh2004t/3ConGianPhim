// models/PasswordReset.js hoặc models/passwordReset.model.js
const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    trim: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Vui lòng nhập địa chỉ email hợp lệ'
    ]
  },
  code: {
    type: String,
    required: [true, 'Mã xác minh là bắt buộc'],
    length: 6
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // 10 phút (600 giây)
  }
}, {
  timestamps: true
});

// Index để tìm kiếm nhanh
passwordResetSchema.index({ email: 1, code: 1 });
passwordResetSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model('PasswordReset', passwordResetSchema);