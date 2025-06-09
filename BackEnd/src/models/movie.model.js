const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  _id: { 
    type: String, 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: String,
  posterUrl: String,
  trailerUrl: String,
  genres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
  releaseYear: Number,
  status: String,
  country: String,
  totalEpisodes: Number,
  viewCount: { type: Number, default: 0 },
  type: { type: String, enum: ['Movies', 'TvSeries'], required: true },
  oldId: { type: mongoose.Schema.Types.ObjectId }, // Để lưu trữ ObjectId cũ nếu cần
}, {
  timestamps: true,
  _id: false // Disable auto ObjectId generation
});

// Thêm index text cho trường title
movieSchema.index({ title: 'text' });

// Utility function để tạo slug từ title
movieSchema.statics.createSlug = function(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Pre-save middleware để tự động tạo slug nếu chưa có _id
movieSchema.pre('save', function(next) {
  if (!this._id && this.title) {
    this._id = this.constructor.createSlug(this.title);
  }
  next();
});

module.exports = mongoose.model('Movie', movieSchema);