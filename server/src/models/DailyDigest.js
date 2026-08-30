const mongoose = require('mongoose');

const DailyDigestSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    newJobsFound: {
      type: Number,
      default: 0,
    },
    strongMatchesCount: {
      type: Number,
      default: 0,
    },
    recruitersFoundCount: {
      type: Number,
      default: 0,
    },
    topOpportunities: [
      {
        jobId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Job',
        },
        title: String,
        company: String,
        location: String,
        salaryString: String,
        score: Number,
        matchReason: String,
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

DailyDigestSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyDigest', DailyDigestSchema);
