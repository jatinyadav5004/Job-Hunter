const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'manual'],
      default: 'pdf',
    },
    rawText: {
      type: String,
      default: '',
    },
    parsedProfile: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      title: { type: String, default: '' },
      yearsOfExperience: { type: Number, default: 0 },
      skills: [{ type: String }],
      experience: [
        {
          title: String,
          company: String,
          location: String,
          startDate: String,
          endDate: String,
          current: Boolean,
          description: String,
          technologies: [String],
        },
      ],
      education: [
        {
          degree: String,
          institution: String,
          year: String,
          grade: String,
        },
      ],
      projects: [
        {
          name: String,
          description: String,
          technologies: [String],
          link: String,
        },
      ],
      achievements: [{ type: String }],
    },
    isDefault: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', ResumeSchema);
