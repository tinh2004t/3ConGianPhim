const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/me', authenticate, userController.getMe);
router.post('/me/favorites', authenticate, userController.addFavorite);
router.get('/me/favorites', authenticate, userController.getFavorites);
router.delete('/me/favorites/:movieId', authenticate, userController.removeFavorite);
router.post('/me/history', authenticate, userController.addHistory);
router.get('/me/history', authenticate, userController.getHistory);

module.exports = router;
