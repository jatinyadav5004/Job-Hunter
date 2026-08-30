const express = require('express');
const router = express.Router();
const { uploadResume, getCurrentResume, updateParsedProfile, getAllResumes, deleteResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/current', getCurrentResume);
router.get('/', getAllResumes);
router.put('/:id', updateParsedProfile);
router.delete('/:id', deleteResume);

module.exports = router;
