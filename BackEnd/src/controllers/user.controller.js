const User = require('../models/user.model');
const Movie = require('../models/movie.model');
const Episode = require('../models/episode.model');
const logAdminAction = require('../utils/logAdminAction');

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

// Lấy danh sách yêu thích - FIXED: Không dùng populate với String
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    // Lấy thông tin chi tiết của các phim yêu thích
    const favoriteMovies = await Movie.find({
      _id: { $in: user.favorites }
    });
    
    res.json(favoriteMovies);
  } catch (err) {
    console.error('Lỗi getFavorites:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Ghi lịch sử xem - FIXED: Xử lý dữ liệu cũ
exports.addHistory = async (req, res) => {
  try {
    const { movieId, episodeId } = req.body;

    if (!movieId || !episodeId || typeof movieId !== 'string' || typeof episodeId !== 'string') {
      return res.status(400).json({ message: 'movieId và episodeId phải là chuỗi hợp lệ' });
    }

    const movie = await Movie.findById(movieId);
    const episode = await Episode.findById(episodeId);
    if (!movie || !episode) {
      return res.status(404).json({ message: 'Phim hoặc tập không tồn tại' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Làm sạch dữ liệu history cũ (loại bỏ các entry không hợp lệ)
    user.history = user.history.filter(item => 
      item && 
      item.movie && 
      item.episode && 
      typeof item.movie === 'string' && 
      typeof item.episode === 'string'
    );

    const existing = user.history.find(
      (item) => item.movie === movieId
    );

    if (existing) {
      existing.episode = episodeId;
      existing.updatedAt = new Date();
    } else {
      user.history.push({ 
        movie: movieId, 
        episode: episodeId, 
        updatedAt: new Date() 
      });
    }

    await user.save();

    res.json({ message: 'Đã cập nhật lịch sử xem' });
  } catch (err) {
    console.error('Lỗi addHistory:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Xóa phim khỏi yêu thích
exports.removeFavorite = async (req, res) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    user.favorites = user.favorites.filter(
      (favId) => favId !== movieId
    );
    await user.save();
    res.json({ message: 'Đã xóa khỏi yêu thích' });
  } catch (err) {
    console.error('Lỗi removeFavorite:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy lịch sử xem - FIXED: Không dùng populate với String
exports.getHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    // Làm sạch dữ liệu history cũ
    const validHistory = user.history.filter(item => 
      item && 
      item.movie && 
      item.episode && 
      typeof item.movie === 'string' && 
      typeof item.episode === 'string'
    );

    // Lấy thông tin chi tiết của movies và episodes
    const historyWithDetails = await Promise.all(
      validHistory.map(async (item) => {
        try {
          const movie = await Movie.findById(item.movie);
          const episode = await Episode.findById(item.episode);
          
          return {
            movie: movie,
            episode: episode,
            updatedAt: item.updatedAt
          };
        } catch (error) {
          console.error('Lỗi khi lấy chi tiết history:', error);
          return null;
        }
      })
    );

    // Lọc bỏ các item null (không tìm thấy movie hoặc episode)
    const filteredHistory = historyWithDetails.filter(item => 
      item && item.movie && item.episode
    );

    res.json(filteredHistory);
  } catch (err) {
    console.error('Lỗi getHistory:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (err) {
    console.error('Lỗi getAllUsers:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Sửa thông tin người dùng
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select('-passwordHash');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    await logAdminAction(req.user.userId, `Sửa thông tin người dùng ${updatedUser.username}`);
    res.json(updatedUser);
  } catch (err) {
    console.error('Lỗi updateUser:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const deleted = await User.findByIdAndDelete(userId);

    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    await logAdminAction(req.user.userId, `Xóa người dùng ${deleted.username}`);
    res.json({ message: 'Đã xóa người dùng' });
  } catch (err) {
    console.error('Lỗi deleteUser:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};