const mongoose = require('mongoose');

const RecruiterSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      default: 'Technical Recruiter',
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    linkedinUrl: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: [
        'job_posting',
        'company_directory',
        'verified_contact',
        'manual',
        'linkedin_google_discovery',
        'recruiter_discovery',
      ],
      default: 'company_directory',
    },
    confidenceScore: {
      type: Number,
      default: 90,
    },
  },
  { timestamps: true }
);

RecruiterSchema.index({ companyName: 1, email: 1 });

module.exports = mongoose.model('Recruiter', RecruiterSchema);
