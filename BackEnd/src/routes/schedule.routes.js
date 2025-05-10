const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

router.get('/', scheduleController.getSchedule);
router.post('/', authenticate, requireAdmin, scheduleController.upsertSchedule);
router.put('/', authenticate, requireAdmin, scheduleController.upsertSchedule); // Cho phép PUT nếu cần

module.exports = router;
