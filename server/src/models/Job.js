const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    location: {
      type: String,
      default: 'Remote',
      trim: true,
    },
    workMode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site', 'Unknown'],
      default: 'Remote',
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'INR' },
      isNegotiable: { type: Boolean, default: true },
    },
    experienceRequired: {
      minYears: { type: Number, default: 0 },
      maxYears: { type: Number },
    },
    description: {
      type: String,
      required: true,
    },
    requirements: [{ type: String }],
    skills: [{ type: String }],
    employmentType: {
      type: String,
      default: 'Full-time',
    },
    source: {
      type: String,
      enum: ['greenhouse', 'lever', 'linkedin', 'indeed', 'wellfound', 'naukri', 'career_page', 'manual'],
      required: true,
      index: true,
    },
    sourceJobId: {
      type: String,
      trim: true,
    },
    applicationUrl: {
      type: String,
      required: true,
    },
    fingerprint: {
      type: String,
      unique: true,
      index: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recruiter',
    },
    postedAt: {
      type: Date,
      default: Date.now,
    },
    discoveredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for source deduplication
JobSchema.index({ source: 1, sourceJobId: 1 }, { unique: true, sparse: true });

// Text index for fast text searches
JobSchema.index({ title: 'text', description: 'text', company: 'text', skills: 'text' });

module.exports = mongoose.model('Job', JobSchema);
