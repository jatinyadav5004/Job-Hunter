const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateSettings,
  requestUpgrade,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/settings', protect, updateSettings);
router.post('/request-upgrade', protect, requestUpgrade);

module.exports = router;
