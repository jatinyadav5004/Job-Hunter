const EmailAccount = require('../models/EmailAccount');
const emailService = require('../services/emailService');

// @route   GET /api/email/senders
exports.getSenderAccounts = async (req, res) => {
  try {
    let accounts = await EmailAccount.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // If no custom accounts added yet, create the user's primary registration email by default
    if (accounts.length === 0) {
      const defaultAccount = await EmailAccount.create({
        userId: req.user._id,
        emailAddress: req.user.email,
        senderName: req.user.name,
        isDefault: true,
        dailyLimit: req.user.dailyEmailLimit || 20,
      });
      accounts = [defaultAccount];
    }

    const today = new Date().toISOString().split('T')[0];
    const enriched = accounts.map((acc) => ({
      _id: acc._id,
      emailAddress: acc.emailAddress,
      senderName: acc.senderName || req.user.name,
      provider: acc.provider,
      isDefault: acc.isDefault,
      dailyLimit: acc.dailyLimit || 20,
      sentToday: acc.lastSentDate === today ? acc.sentTodayCount : 0,
      remainingToday: Math.max(0, (acc.dailyLimit || 20) - (acc.lastSentDate === today ? acc.sentTodayCount : 0)),
    }));

    res.json({
      success: true,
      count: enriched.length,
      senders: enriched,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/email/senders
exports.addSenderAccount = async (req, res) => {
  try {
    const { emailAddress, senderName, dailyLimit, setAsDefault } = req.body;

    if (!emailAddress) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const cleanEmail = emailAddress.toLowerCase().trim();

    // Check if email already registered for this user
    const existing = await EmailAccount.findOne({ userId: req.user._id, emailAddress: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This sender email is already in your account list' });
    }

    // If setAsDefault, unset existing defaults
    if (setAsDefault) {
      await EmailAccount.updateMany({ userId: req.user._id }, { isDefault: false });
    }

    const isFirst = (await EmailAccount.countDocuments({ userId: req.user._id })) === 0;

    const account = await EmailAccount.create({
      userId: req.user._id,
      emailAddress: cleanEmail,
      senderName: senderName || req.user.name,
      dailyLimit: Number(dailyLimit) || 20,
      isDefault: setAsDefault || isFirst,
    });

    res.status(201).json({
      success: true,
      message: `Sender email ${cleanEmail} added successfully!`,
      account,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/email/senders/:id/default
exports.setDefaultSender = async (req, res) => {
  try {
    // Unset all defaults
    await EmailAccount.updateMany({ userId: req.user._id }, { isDefault: false });

    // Set target default
    const account = await EmailAccount.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isDefault: true },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ success: false, message: 'Sender account not found' });
    }

    res.json({
      success: true,
      message: `Default sender changed to ${account.emailAddress}`,
      account,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/email/senders/:id
exports.deleteSenderAccount = async (req, res) => {
  try {
    const account = await EmailAccount.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Sender account not found' });
    }

    // If the deleted one was default, set another one as default
    if (account.isDefault) {
      const remaining = await EmailAccount.findOne({ userId: req.user._id });
      if (remaining) {
        remaining.isDefault = true;
        await remaining.save();
      }
    }

    res.json({ success: true, message: `Sender ${account.emailAddress} removed` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/email/status
exports.getEmailStatus = async (req, res) => {
  try {
    const status = await emailService.getAccountStatus(req.user._id);
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Legacy connectors for optional simulation
exports.connectGmail = async (req, res) => {
  res.json({ success: true, message: 'Direct email sender active' });
};
exports.connectOutlook = async (req, res) => {
  res.json({ success: true, message: 'Direct email sender active' });
};
exports.disconnect = async (req, res) => {
  res.json({ success: true, message: 'Sender disconnected' });
};
