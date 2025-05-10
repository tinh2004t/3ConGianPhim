const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genre.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');


// Lấy danh sách thể loại
router.get('/', genreController.getGenres);

// Thêm, sửa, xóa thể loại (chỉ admin)
router.post('/', authenticate, requireAdmin, genreController.createGenre);
router.put('/:id', authenticate, requireAdmin, genreController.updateGenre);
router.delete('/:id', authenticate, requireAdmin, genreController.deleteGenre);

module.exports = router;
