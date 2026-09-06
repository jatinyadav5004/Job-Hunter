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
const { requirePro } = require('../middleware/tierCheck');

router.use(protect);

router.post('/generate', generateEmail);
router.post('/send', sendEmail);
router.post('/bulk-generate', requirePro, bulkGenerateEmails);
router.post('/bulk-send', requirePro, bulkSendEmails);
router.get('/logs', getEmailLogs);

module.exports = router;
