const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movie.controller');
const incrementViewCount = require('../middlewares/incrementViewCount.middleware');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

// Lấy danh sách
router.get('/', movieController.getAllMovies);
router.get('/top', movieController.getTopMovies);
router.get('/type/:type', movieController.getMoviesByType);
router.get('/top-view/:type', movieController.getTopViewByType);
router.get('/random', movieController.getRandomMovies);


// Lọc phim theo genre, năm, trạng thái
router.get('/search', movieController.searchMovies);
router.get('/', movieController.filterMovies); // optional query params

// Lấy chi tiết
router.get('/:id', incrementViewCount, movieController.getMovieById);
router.get('/:id', movieController.getMovieById);


// CRUD (admin)
router.post('/', authenticate, requireAdmin, movieController.createMovie);
router.put('/:id', authenticate, requireAdmin, movieController.updateMovie);
router.delete('/:id', authenticate, requireAdmin, movieController.deleteMovie);

module.exports = router;
