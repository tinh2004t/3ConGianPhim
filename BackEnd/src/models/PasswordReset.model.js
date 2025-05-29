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
    expires: 600 // Tự động xóa sau 10 phút
  }
}, {
  timestamps: true
});

// Giữ lại chỉ mục này để truy vấn xác minh
passwordResetSchema.index({ email: 1, code: 1 });

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
