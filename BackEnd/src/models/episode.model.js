const mongoose = require('mongoose');

// Helper function to create slug
function createSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

const episodeSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  movie: {
    type: String,
    ref: 'Movie',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  episodeNumber: {
    type: Number,
    required: true,
    min: 1
  },
  videoSources: [{
    type: {
      type: String,
      enum: ['iframe', 'direct', 'hls'],
      default: 'iframe'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    }
  }],
  type: {
    type: String,
    enum: ['TvSeries', 'Movie'],
    default: 'TvSeries'
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  _id: false
});

// Pre-validate middleware to generate _id before validation
episodeSchema.pre('validate', async function(next) {
  if (!this._id) {
    try {
      const baseSlug = `${this.movie}-tap-${this.episodeNumber}`;
      let finalSlug = baseSlug;
      let counter = 1;
      
      while (await this.constructor.findById(finalSlug)) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      this._id = finalSlug;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Compound index để đảm bảo không trùng episodeNumber trong cùng 1 movie
episodeSchema.index({ movie: 1, episodeNumber: 1 }, { unique: true });

// Index cho tìm kiếm nhanh
episodeSchema.index({ type: 1 });
episodeSchema.index({ createdAt: -1 });

// Static method để tạo slug cho episode
episodeSchema.statics.generateEpisodeSlug = function(movieSlug, episodeNumber, title = '') {
  const baseSlug = `${movieSlug}-tap-${episodeNumber}`;
  return baseSlug;
};

// Static method để validate slug format
episodeSchema.statics.isValidSlug = function(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*-tap-\d+(?:-\d+)?$/.test(slug);
};

// Instance method để cập nhật slug khi cần thiết
episodeSchema.methods.updateSlug = async function() {
  const newSlug = this.constructor.generateEpisodeSlug(this.movie, this.episodeNumber, this.title);
  
  if (newSlug !== this._id) {
    let finalSlug = newSlug;
    let counter = 1;
    
    while (await this.constructor.findById(finalSlug)) {
      finalSlug = `${newSlug}-${counter}`;
      counter++;
    }
    
    const oldId = this._id;
    this._id = finalSlug;
    
    return { oldId, newId: finalSlug };
  }
  
  return null;
};

// Virtual để lấy episode slug từ _id
episodeSchema.virtual('slug').get(function() {
  return this._id;
});

// Ensure virtual fields are serialized
episodeSchema.set('toJSON', { virtuals: true });
episodeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Episode', episodeSchema);