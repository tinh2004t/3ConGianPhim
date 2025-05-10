const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: String,
  description: String,
  posterUrl: String,
  trailerUrl: String,
  genres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
  releaseYear: Number,
  status: String,
  country: String,
  totalEpisodes: Number,
  viewCount: { type: Number, default: 0 },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Movie', movieSchema);
