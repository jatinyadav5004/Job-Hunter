const express = require('express');
const router = express.Router();
const {
  generateEmail,
  sendEmail,
  bulkGenerateEmails,
  bulkSendEmails,
  getEmailLogs,
} = require('../controllers/coldEmailController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/generate', generateEmail);
router.post('/send', sendEmail);
router.post('/bulk-generate', bulkGenerateEmails);
router.post('/bulk-send', bulkSendEmails);
router.get('/logs', getEmailLogs);

module.exports = router;
