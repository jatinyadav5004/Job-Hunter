const express = require('express');
const router = express.Router();
const {
  getRecruiters,
  getRecruiterById,
  searchCompanyEmployees,
} = require('../controllers/recruiterController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/search', searchCompanyEmployees);
router.get('/', getRecruiters);
router.get('/:id', getRecruiterById);

module.exports = router;
