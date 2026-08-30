const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
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
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recruiter',
    },
    status: {
      type: String,
      enum: ['shortlisted', 'applied', 'contacted', 'interview', 'offer', 'rejected'],
      default: 'shortlisted',
      index: true,
    },
    matchScore: {
      type: Number,
      default: 0,
    },
    dateFound: {
      type: Date,
      default: Date.now,
    },
    dateApplied: {
      type: Date,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmailLog',
    },
    notes: {
      type: String,
      default: '',
    },
    interviews: [
      {
        roundName: String,
        scheduledAt: Date,
        feedback: String,
        interviewer: String,
      },
    ],
    salaryOffered: {
      type: Number,
    },
  },
  { timestamps: true }
);

ApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });
ApplicationSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
