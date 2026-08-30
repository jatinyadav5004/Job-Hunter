const express = require('express');
const router = express.Router();
const {
  getApplications,
  createApplication,
  updateStatus,
  deleteApplication,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getApplications)
  .post(createApplication);

router.route('/:id/status')
  .put(updateStatus);

router.route('/:id')
  .delete(deleteApplication);

module.exports = router;
