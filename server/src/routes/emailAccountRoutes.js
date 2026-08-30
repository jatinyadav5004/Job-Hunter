const express = require('express');
const router = express.Router();
const {
  getSenderAccounts,
  addSenderAccount,
  setDefaultSender,
  deleteSenderAccount,
  getEmailStatus,
  connectGmail,
  connectOutlook,
  disconnect,
} = require('../controllers/emailAccountController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/status', getEmailStatus);
router.get('/senders', getSenderAccounts);
router.post('/senders', addSenderAccount);
router.put('/senders/:id/default', setDefaultSender);
router.delete('/senders/:id', deleteSenderAccount);

// Backward compatible routes
router.post('/connect/gmail', connectGmail);
router.post('/connect/outlook', connectOutlook);
router.post('/disconnect', disconnect);

module.exports = router;
