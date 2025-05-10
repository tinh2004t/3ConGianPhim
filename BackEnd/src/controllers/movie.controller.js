const Movie = require('../models/movie.model');

// GET /api/movies
exports.getAllMovies = async (req, res) => {
  try {
    const {
      genre,
      year,
      status,
      country,
      q,          // từ khóa tìm kiếm
      sort = "createdAt", // mặc định sort theo ngày tạo
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (genre) query.genres = genre;
    if (year) query.releaseYear = Number(year);
    if (status) query.status = status;
    if (country) query.country = country;

    if (q) {
      query.title = { $regex: q, $options: "i" }; // tìm theo tiêu đề
    }

    const movies = await Movie.find(query)
      .populate("genres") // phần C ở dưới
      .sort({ [sort]: -1 }) // ví dụ: sort=viewCount => { viewCount: -1 }
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET /api/movies/:id
exports.getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findById(id);

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

exports.getTopMovies = async (req, res) => {
  try {
    const { type } = req.query;
    let startDate;

    const now = new Date();
    if (type === 'daily') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (type === 'weekly') {
      const firstDayOfWeek = now.getDate() - now.getDay(); // Sunday
      startDate = new Date(now.setDate(firstDayOfWeek));
      startDate.setHours(0, 0, 0, 0);
    } else if (type === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      return res.status(400).json({ message: 'Invalid type. Use daily, weekly, or monthly.' });
    }

    const topMovies = await Movie.find({
      updatedAt: { $gte: startDate }
    }).sort({ viewCount: -1 }).limit(10); // lấy top 10

    res.json(topMovies);
  } catch (err) {
    console.error("Error fetching top movies:", err);
    res.status(500).json({ message: 'Error fetching top movies' });
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