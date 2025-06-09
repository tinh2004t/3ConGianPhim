const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { 
    type: String, 
    required: [true, 'Tên người dùng là bắt buộc'],
    unique: true,
    trim: true,
    minlength: [3, 'Tên người dùng phải có ít nhất 3 ký tự'],
    maxlength: [30, 'Tên người dùng không được vượt quá 30 ký tự'],
    match: [/^[a-zA-Z0-9_.-]+$/, 'Tên người dùng chỉ được chứa chữ cái, số, dấu gạch dưới, chấm và dấu gạch ngang']
  },
  email: { 
    type: String, 
    required: [true, 'Email là bắt buộc'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Vui lòng nhập địa chỉ email hợp lệ'
    ],
    maxlength: [254, 'Email không được vượt quá 254 ký tự']
  },
  passwordHash: { 
    type: String, 
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [60, 'Hash mật khẩu không hợp lệ'] // bcrypt hash có độ dài 60 ký tự
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  favorites: [{ type: String, ref: 'Movie' }],
  history: [
  {
    movie: { type: String, ref: 'Movie' },
    episode: { type: mongoose.Schema.Types.ObjectId, ref: 'Episode' }, // thêm trường này
    updatedAt: { type: Date, default: Date.now }
  }
]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
