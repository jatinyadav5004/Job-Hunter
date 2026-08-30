const mongoose = require('mongoose');

const JobMatchSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    savedSearchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SavedSearch',
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },
    breakdown: {
      skills: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      location: { type: Number, default: 0 },
      title: { type: Number, default: 0 },
      salary: { type: Number, default: 0 },
    },
    matchReason: {
      type: String,
      default: '',
    },
    missingRequirements: {
      type: String,
      default: '',
    },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    status: {
      type: String,
      enum: ['new', 'saved', 'applied', 'skipped'],
      default: 'new',
      index: true,
    },
    isStrongMatch: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

JobMatchSchema.index({ userId: 1, jobId: 1 }, { unique: true });
JobMatchSchema.index({ userId: 1, status: 1, score: -1 });

module.exports = mongoose.model('JobMatch', JobMatchSchema);
