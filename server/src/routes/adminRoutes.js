const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateUserPlan,
  updateUserRole,
  toggleSuspension,
  toggleSoftDelete,
  resetPreviewLimit,
  dismissUpgradeRequest,
} = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and role === 'admin' in database
router.use(protect);
router.use(requireAdmin);

router.get('/users', getUsers);
router.post('/users/:id/plan', updateUserPlan);
router.post('/users/:id/role', updateUserRole);
router.post('/users/:id/suspend', toggleSuspension);
router.post('/users/:id/soft-delete', toggleSoftDelete);
router.post('/users/:id/reset-preview', resetPreviewLimit);
router.post('/users/:id/dismiss-upgrade', dismissUpgradeRequest);

module.exports = router;
