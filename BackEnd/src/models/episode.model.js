const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  title: { type: String, required: true },
  episodeNumber: { type: Number, required: true },
  videoSources: { type: Array, required: true },
  duration: { type: String }, // vd: "23 phút"
}, {
  timestamps: true
});

module.exports = mongoose.model('Episode', episodeSchema);
