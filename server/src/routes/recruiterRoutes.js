const express = require('express');
const router = express.Router();
const {
  getRecruiters,
  createRecruiter,
  getRecruiterById,
  searchCompanyEmployees,
} = require('../controllers/recruiterController');
const { protect } = require('../middleware/auth');
const { requirePro } = require('../middleware/tierCheck');

router.use(protect);
router.use(requirePro); // Recruiter Discovery is a PRO feature

router.get('/search', searchCompanyEmployees);
router.get('/', getRecruiters);
router.post('/', createRecruiter);
router.get('/:id', getRecruiterById);

module.exports = router;
