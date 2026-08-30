const express = require('express');
const router = express.Router();
const {
  getMatchedJobs,
  getJobDetails,
  updateJobStatus,
  saveOrApplyJob,
  getDashboardStats,
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard/stats', getDashboardStats);
router.get('/', getMatchedJobs);
router.post('/save-or-apply', saveOrApplyJob);
router.get('/:id', getJobDetails);
router.post('/:id/status', updateJobStatus);

module.exports = router;
