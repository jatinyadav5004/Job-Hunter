const DailyDigest = require('../models/DailyDigest');

// @route   GET /api/digest/latest
exports.getLatestDigest = async (req, res) => {
  try {
    const digest = await DailyDigest.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('topOpportunities.jobId');

    if (!digest) {
      return res.json({
        success: true,
        digest: null,
      });
    }

    res.json({
      success: true,
      digest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/digest/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const digest = await DailyDigest.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, digest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
