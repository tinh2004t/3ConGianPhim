const Episode = require('../models/episode.model');
const Movie = require('../models/movie.model');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const logAdminAction = require('../utils/logAdminAction');
const mongoose = require('mongoose');

// Helper function to validate slug format
function isValidMovieSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function isValidEpisodeSlug(slug) {
  return Episode.isValidSlug(slug);
}

// POST - Thêm tập phim (admin)
exports.createEpisode = async (req, res) => {
  try {
    const { title, episodeNumber, videoSources } = req.body;
    const movieSlug = req.params.movieId; // Movie slug from URL

    console.log('=== CREATE EPISODE START ===');
    console.log('Movie Slug:', movieSlug);
    console.log('User ID:', req.user?.userId);

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Không xác định được người dùng' });
    }

    if (!title || !episodeNumber || !Array.isArray(videoSources) || videoSources.length === 0) {
      return res.status(400).json({ 
        message: 'Thiếu thông tin bắt buộc: title, episodeNumber, videoSources' 
      });
    }

    // Validate movie slug format
    if (!isValidMovieSlug(movieSlug)) {
      return res.status(400).json({ message: 'Movie slug không hợp lệ' });
    }

    // Verify movie exists with the given slug
    const movie = await Movie.findById(movieSlug);
    if (!movie) {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }

    // Check if episode already exists for this movie
    const existingEpisode = await Episode.findOne({ 
      movie: movieSlug, 
      episodeNumber 
    });

    if (existingEpisode) {
      return res.status(400).json({ 
        message: `Tập ${episodeNumber} đã tồn tại cho phim này` 
      });
    }

    // Create episode - the _id will be auto-generated as slug in pre-save middleware
    const episode = new Episode({
      movie: movieSlug,
      title,
      episodeNumber,
      videoSources,
      type: 'TvSeries'
    });

    await episode.save();
    console.log('✅ Episode created with slug:', episode._id);

    // Log admin action
    await logAdminAction(req.user.userId, `Tạo tập phim: ${episode.title} (${episode._id})`);

    // Create notifications for users who favorited this movie
    try {
      console.log('=== CREATING NOTIFICATIONS ===');
      
      // Find users who have this movie in favorites
      const usersWithFavorite = await User.find({ 
        favorites: movieSlug 
      }).select('_id');

      console.log(`Found ${usersWithFavorite.length} users with movie in favorites`);

      if (usersWithFavorite.length > 0) {
        // Prepare notification data
        const notificationData = usersWithFavorite.map(user => ({
          user: user._id,
          movie: movieSlug,
          episode: episode._id, // Episode slug
          title: 'Tập phim mới',
          message: `Phim bạn yêu thích đã có tập mới: "${episode.title}"`,
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        // Insert notifications in batch
        const insertedNotifications = await Notification.insertMany(notificationData);
        console.log(`✅ Created ${insertedNotifications.length} notifications`);
      }
    } catch (notificationError) {
      console.error('❌ Error creating notifications:', notificationError);
      // Don't fail the episode creation if notification fails
    }

    console.log('=== CREATE EPISODE END ===');
    res.status(201).json(episode);
    
  } catch (err) {
    console.error('❌ Error creating episode:', err);
    res.status(500).json({ message: err.message });
  }
};

// PUT - Cập nhật tập phim (admin)
exports.updateEpisode = async (req, res) => {
  try {
    const { title, episodeNumber, videoSources } = req.body;
    const episodeSlug = req.params.id; // Episode slug from URL
    
    // Validate episode slug format
    if (!isValidEpisodeSlug(episodeSlug)) {
      return res.status(400).json({ message: 'Episode slug không hợp lệ' });
    }

    // Validate required fields
    if (!title || !episodeNumber || !videoSources || videoSources.length === 0) {
      return res.status(400).json({ 
        message: 'Thiếu thông tin bắt buộc: title, episodeNumber, videoSources' 
      });
    }

    // Check if episode exists
    const existingEpisode = await Episode.findById(episodeSlug);
    if (!existingEpisode) {
      return res.status(404).json({ message: 'Không tìm thấy tập phim' });
    }

    // Check if episodeNumber is unique (exclude current episode)
    if (episodeNumber !== existingEpisode.episodeNumber) {
      const duplicateEpisode = await Episode.findOne({ 
        movie: existingEpisode.movie,
        episodeNumber: episodeNumber,
        _id: { $ne: episodeSlug }
      });
      
      if (duplicateEpisode) {
        return res.status(400).json({ 
          message: `Tập ${episodeNumber} đã tồn tại cho phim này` 
        });
      }
    }

    // Update episode data
    existingEpisode.title = title;
    existingEpisode.episodeNumber = episodeNumber;
    existingEpisode.videoSources = videoSources;
    existingEpisode.updatedAt = new Date();

    // Check if slug needs to be updated due to episode number change
    let slugChanged = false;
    let oldSlug = episodeSlug;
    let newSlug = episodeSlug;

    if (episodeNumber !== existingEpisode.episodeNumber) {
      const slugUpdateResult = await existingEpisode.updateSlug();
      if (slugUpdateResult) {
        slugChanged = true;
        oldSlug = slugUpdateResult.oldId;
        newSlug = slugUpdateResult.newId;
      }
    }

    await existingEpisode.save();

    // Update related notifications if slug changed
    if (slugChanged) {
      await Notification.updateMany(
        { episode: oldSlug },
        { episode: newSlug }
      );
    }

    await logAdminAction(req.user.userId, `Cập nhật tập phim: ${existingEpisode.title} (${existingEpisode._id})`);
    
    res.status(200).json({
      ...existingEpisode.toObject(),
      slugChanged,
      oldSlug: slugChanged ? oldSlug : null,
      newSlug: slugChanged ? newSlug : null
    });
  } catch (err) {
    console.error('Update episode error:', err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE - Xóa tập phim (admin)
exports.deleteEpisode = async (req, res) => {
  try {
    const episodeSlug = req.params.id;
    
    // Validate episode slug format
    if (!isValidEpisodeSlug(episodeSlug)) {
      return res.status(400).json({ message: 'Episode slug không hợp lệ' });
    }

    const episode = await Episode.findByIdAndDelete(episodeSlug);
    if (!episode) {
      return res.status(404).json({ message: 'Không tìm thấy tập phim' });
    }
    
    // Also delete related notifications
    await Notification.deleteMany({ episode: episodeSlug });
    
    await logAdminAction(req.user.userId, `Xóa tập phim: ${episode.title} (${episodeSlug})`);
    res.status(200).json({ message: 'Xóa tập phim thành công' });
  } catch (err) {
    console.error('Delete episode error:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET - Danh sách tập phim theo movieSlug
exports.getEpisodesByMovie = async (req, res) => {
  try {
    const movieSlug = req.params.movieId;
    
    // Validate movie slug format
    if (!isValidMovieSlug(movieSlug)) {
      return res.status(400).json({ message: 'Movie slug không hợp lệ' });
    }
    
    // Verify movie exists
    const movie = await Movie.findById(movieSlug);
    if (!movie) {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }

    const episodes = await Episode.find({ movie: movieSlug })
      .sort({ episodeNumber: 1 });
    
    res.status(200).json(episodes);
  } catch (err) {
    console.error('Get episodes error:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET - 1 tập phim cụ thể bằng episode slug
exports.getEpisodeById = async (req, res) => {
  try {
    const episodeSlug = req.params.id;
    
    // Validate episode slug format
    if (!isValidEpisodeSlug(episodeSlug)) {
      return res.status(400).json({ message: 'Episode slug không hợp lệ' });
    }

    const episode = await Episode.findById(episodeSlug);
    if (!episode) {
      return res.status(404).json({ message: 'Không tìm thấy tập phim' });
    }

    res.status(200).json(episode);
  } catch (err) {
    console.error('Get episode error:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET - Tập phim theo movieSlug và episodeSlug
exports.getEpisodeByMovieAndEpisodeId = async (req, res) => {
  const { movieId, episodeId } = req.params;

  try {
    // Validate slugs format
    if (!isValidMovieSlug(movieId)) {
      return res.status(400).json({ message: 'Movie slug không hợp lệ' });
    }
    
    if (!isValidEpisodeSlug(episodeId)) {
      return res.status(400).json({ message: 'Episode slug không hợp lệ' });
    }

    // Verify movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }

    const episode = await Episode.findOne({ 
      _id: episodeId, 
      movie: movieId
    });

    if (!episode) {
      return res.status(404).json({ 
        message: 'Không tìm thấy tập phim thuộc phim này' 
      });
    }

    res.status(200).json(episode);
  } catch (err) {
    console.error('Get episode by movie and episode slug error:', err);
    res.status(500).json({ message: err.message });
  }
};

// POST - Tăng view count khi bắt đầu xem tập
exports.watchEpisode = async (req, res) => {
  try {
    const { movieId, episodeId } = req.params;
    
    console.log(`🎬 watchEpisode called - movieSlug: ${movieId}, episodeSlug: ${episodeId}`);

    // Validate slugs format
    if (!isValidMovieSlug(movieId)) {
      return res.status(400).json({ message: 'Movie slug không hợp lệ' });
    }
    
    if (!isValidEpisodeSlug(episodeId)) {
      return res.status(400).json({ message: 'Episode slug không hợp lệ' });
    }

    // Verify movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }

    // Verify episode exists and belongs to movie
    const episode = await Episode.findOne({ 
      _id: episodeId, 
      movie: movieId
    });

    if (!episode) {
      return res.status(404).json({ 
        message: 'Không tìm thấy tập phim thuộc phim này' 
      });
    }

    // Increment both movie and episode view count
    const [updatedMovie, updatedEpisode] = await Promise.all([
      Movie.findByIdAndUpdate(
        movieId,
        { $inc: { viewCount: 1 } },
        { new: true }
      ).populate('genres'),
      Episode.findByIdAndUpdate(
        episodeId,
        { $inc: { viewCount: 1 } },
        { new: true }
      )
    ]);

    if (!updatedMovie || !updatedEpisode) {
      return res.status(404).json({ message: 'Không thể cập nhật lượt xem' });
    }

    console.log(`✅ View count increased! Movie: ${updatedMovie.title}, Episode: ${updatedEpisode.title}`);
    console.log(`Movie views: ${updatedMovie.viewCount}, Episode views: ${updatedEpisode.viewCount}`);

    res.json({
      success: true,
      message: 'Bắt đầu xem tập phim',
      episode: updatedEpisode,
      movie: {
        _id: updatedMovie._id,
        title: updatedMovie.title,
        viewCount: updatedMovie.viewCount
      }
    });

  } catch (err) {
    console.error('❌ Error in watchEpisode:', err);
    res.status(500).json({ message: 'Lỗi khi ghi nhận lượt xem' });
  }
};

// GET - Tìm kiếm tập phim theo từ khóa
exports.searchEpisodes = async (req, res) => {
  try {
    const { q, movieId, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự' });
    }

    const query = {
      $or: [
        { title: { $regex: q.trim(), $options: 'i' } },
        { _id: { $regex: q.trim(), $options: 'i' } }
      ]
    };

    // Filter by movie if provided
    if (movieId && isValidMovieSlug(movieId)) {
      query.movie = movieId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [episodes, total] = await Promise.all([
      Episode.find(query)
        .sort({ episodeNumber: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Episode.countDocuments(query)
    ]);

    res.status(200).json({
      episodes,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Search episodes error:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET - Lấy episode kế tiếp/trước đó
exports.getAdjacentEpisodes = async (req, res) => {
  try {
    const { movieId, episodeId } = req.params;
    
    // Validate slugs
    if (!isValidMovieSlug(movieId) || !isValidEpisodeSlug(episodeId)) {
      return res.status(400).json({ message: 'Slug không hợp lệ' });
    }

    const currentEpisode = await Episode.findOne({ 
      _id: episodeId, 
      movie: movieId 
    });

    if (!currentEpisode) {
      return res.status(404).json({ message: 'Không tìm thấy tập phim' });
    }

    const [prevEpisode, nextEpisode] = await Promise.all([
      Episode.findOne({ 
        movie: movieId, 
        episodeNumber: { $lt: currentEpisode.episodeNumber } 
      }).sort({ episodeNumber: -1 }),
      Episode.findOne({ 
        movie: movieId, 
        episodeNumber: { $gt: currentEpisode.episodeNumber } 
      }).sort({ episodeNumber: 1 })
    ]);

    res.status(200).json({
      current: currentEpisode,
      previous: prevEpisode,
      next: nextEpisode
    });
  } catch (err) {
    console.error('Get adjacent episodes error:', err);
    res.status(500).json({ message: err.message });
  }
};