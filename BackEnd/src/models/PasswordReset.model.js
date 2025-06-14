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
  type: { 
    type: String, 
    enum: ['forgot_password', 'change_password'], 
    default: 'forgot_password' 
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // TTL index được tạo tự động
  }
}, {
  timestamps: true
});

// Chỉ mục để tìm kiếm nhanh
passwordResetSchema.index({ email: 1 });

module.exports = mongoose.model('PasswordReset', passwordResetSchema);