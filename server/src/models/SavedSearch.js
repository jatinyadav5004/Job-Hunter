const mongoose = require('mongoose');

const SavedSearchSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Search profile name is required'],
      trim: true,
    },
    jobTitles: [{ type: String, trim: true }],
    skills: [{ type: String, trim: true }],
    experienceMin: { type: Number, default: 0 },
    experienceMax: { type: Number, default: 20 },
    locations: [{ type: String, trim: true }],
    workModes: [{ type: String, enum: ['Remote', 'Hybrid', 'On-site'], default: 'Remote' }],
    minSalary: { type: Number, default: 0 },
    maxSalary: { type: Number },
    currency: { type: String, default: 'INR' },
    employmentTypes: [{ type: String, default: 'Full-time' }],
    industries: [{ type: String }],
    targetCompanies: [{ type: String }],
    excludedCompanies: [{ type: String }],
    keywords: [{ type: String }],
    excludedKeywords: [{ type: String }],
    minMatchScore: {
      type: Number,
      default: 75,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastRunAt: {
      type: Date,
    },
    totalMatchesFound: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavedSearch', SavedSearchSchema);
