const Movie = require('../models/movie.model');
const mongoose = require('mongoose');


// GET /api/movies
// GET /api/movies?genre=Action&year=2023&type=Movies&q=inception&sort=viewCount&page=1&limit=20
exports.getAllMovies = async (req, res) => {
  try {
    const {
      genre,
      year,
      status,
      country,
      type,
      q,
      sort = 'createdAt',
      page = 1,
      limit = 18,
    } = req.query;

    const query = {};

    // Lọc theo type nếu có
    if (type && ['Movies', 'TvSeries'].includes(type)) {
      query.type = type;
    }

    // Lọc theo genre (nếu genres là mảng ObjectId)
    if (req.query.genre) {
  query.genres = req.query.genre; // nếu genres là mảng các ID string
}


    if (year) {
      query.releaseYear = Number(year);
    }

    if (status) query.status = status;
    if (country) query.country = country;

    // Tìm kiếm theo tiêu đề
    if (q) {
      query.title = { $regex: q, $options: 'i' };
    }

    

    const totalItems = await Movie.countDocuments(query);
const movies = await Movie.find(query)
  .populate('genres')
  .sort({ [sort]: -1 })
  .skip((Number(page) - 1) * Number(limit))
  .limit(Number(limit));

res.json({
  success: true,
  data: movies,
  totalItems,
  currentPage: Number(page),
  totalPages: Math.ceil(totalItems / Number(limit)),
});

  } catch (err) {
    console.error('Lỗi khi lấy danh sách phim:', err);
    res.status(500).json({ message: err.message });
  }
};



// GET /api/movies/:id
exports.getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findById(id).populate('genres');

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json(movie);
  } catch (err) {
    console.error("Error fetching movie:", err);
    res.status(500).json({ message: 'Error fetching movie' });
  }
};



// GET /api/movies/search?q=
exports.searchMovies = async (req, res) => {
  try {
    const q = req.query.q || '';
    const movies = await Movie.find({ title: new RegExp(q, 'i') });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/movies?genre=...&year=...&status=...
exports.filterMovies = async (req, res) => {
  try {
    const query = {};
    if (req.query.genre) query.genres = req.query.genre;
    if (req.query.year) query.releaseYear = req.query.year;
    if (req.query.status) query.status = req.query.status;

    const movies = await Movie.find(query);
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/movies
exports.createMovie = async (req, res) => {
  try {
    const newMovie = new Movie(req.body);
    const saved = await newMovie.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/movies/:id
exports.updateMovie = async (req, res) => {
  try {
    const updated = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/movies/:id
exports.deleteMovie = async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa phim thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// controllers/movieController.js

exports.getTopMovies = async (req, res) => {
  try {
    const topMovies = await Movie.find({})
      .sort({ viewCount: -1 }) // sắp xếp giảm dần theo lượt xem
      .limit(5) // lấy 10 phim có view cao nhất
      .populate("genres", "name");

    res.json(topMovies);
  } catch (err) {
    console.error("Error fetching top movies:", err);
    res.status(500).json({ message: 'Error fetching top movies' });
  }
};

exports.getRandomMovies = async (req, res) => {
  try {
    const randomMovies = await Movie.aggregate([
      { $sample: { size: 10 } }
    ]);

    res.json(randomMovies);
  } catch (error) {
    console.error("Lỗi khi lấy phim ngẫu nhiên:", error);
    res.status(500).json({ message: "Lỗi server khi lấy phim ngẫu nhiên." });
  }
};



exports.getMoviesByType = async (req, res) => {
  const { type } = req.params;

  // Kiểm tra type có hợp lệ không
  if (!['Movies', 'TvSeries'].includes(type)) {
    return res.status(400).json({ message: 'Type không hợp lệ. Phải là Movies hoặc TvSeries' });
  }

  try {
    const movies = await Movie.find({ type }).populate('genres');
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// GET /api/movies/top-view/:type?limit=12
exports.getTopViewByType = async (req, res) => {
  const { type } = req.params;
  const limit = parseInt(req.query.limit) || 12;

  if (!['Movies', 'TvSeries'].includes(type)) {
    return res.status(400).json({ message: 'Type không hợp lệ. Phải là Movies hoặc TvSeries' });
  }

  try {
    const movies = await Movie.find({ type })
      .sort({ viewCount: -1 })
      .limit(limit)
      .populate('genres');
      
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};




exports.incrementViewCount = async (req, res) => {
  try {
    const { movieId } = req.params; // Lấy movieId từ URL
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Tăng viewCount lên 1
    movie.viewCount += 1;
    await movie.save(); // Lưu lại thay đổi

    // Trả về phim đã cập nhật
    res.json(movie);
  } catch (err) {
    console.error('Error incrementing view count:', err);
    res.status(500).json({ message: 'Error incrementing view count' });
  }
};