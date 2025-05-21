const User = require('../models/user.model');
const Movie = require('../models/movie.model');

// Lấy thông tin người dùng
exports.getMe = async (req, res) => {
    console.log('User from token:', req.user);
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Thêm phim yêu thích
exports.addFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user.favorites.includes(movieId)) {
      user.favorites.push(movieId);
      await user.save();
    }
    res.json({ message: 'Đã thêm vào yêu thích' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy danh sách yêu thích
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('favorites');
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Ghi lịch sử xem
exports.addHistory = async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = await User.findById(req.user.userId);
    user.history.push({ movie: movieId });
    await user.save();
    res.json({ message: 'Đã ghi lịch sử xem' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { movieId } = req.params;  // Lấy movieId từ params, không phải body
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    user.favorites = user.favorites.filter(
      (favId) => favId.toString() !== movieId
    );
    await user.save();
    res.json({ message: 'Đã xóa khỏi yêu thích' });
  } catch (err) {
    console.error('Lỗi removeFavorite:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};


// Lấy lịch sử xem
exports.getHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('history.movie');
    res.json(user.history);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
