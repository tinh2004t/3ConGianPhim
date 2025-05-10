const Episode = require('../models/episode.model');

// GET - Danh sách tập phim theo movieId
exports.getEpisodesByMovie = async (req, res) => {
  try {
    const episodes = await Episode.find({ movie: req.params.movieId }).sort({ episodeNumber: 1 });
    res.status(200).json(episodes); // ✅ Trả về mảng các tập
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET - 1 tập phim cụ thể
exports.getEpisodeById = async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.id);
    if (!episode) return res.status(404).json({ message: 'Không tìm thấy tập phim' });
    res.status(200).json(episode);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST - Thêm tập phim (admin)
exports.createEpisode = async (req, res) => {
  try {
    const { title, episodeNumber, videoSources, duration } = req.body;
    const episode = new Episode({
      movie: req.params.movieId,
      title,
      episodeNumber,
      videoSources,
      duration
    });
    await episode.save();
    res.status(201).json(episode);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT - Cập nhật tập phim (admin)
exports.updateEpisode = async (req, res) => {
  try {
    const episode = await Episode.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!episode) return res.status(404).json({ message: 'Không tìm thấy tập phim' });
    res.status(200).json(episode);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE - Xóa tập phim (admin)
exports.deleteEpisode = async (req, res) => {
  try {
    const episode = await Episode.findByIdAndDelete(req.params.id);
    if (!episode) return res.status(404).json({ message: 'Không tìm thấy tập phim' });
    res.status(200).json({ message: 'Xóa tập phim thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
