const express = require('express');
const router = express.Router();
const { getLatestDigest, markAsRead } = require('../controllers/digestController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/latest', getLatestDigest);
router.post('/:id/read', markAsRead);

module.exports = router;
