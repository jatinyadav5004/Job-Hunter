const mongoose = require('mongoose');

const EmailLogSchema = new mongoose.Schema(
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
    },
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    recipientName: {
      type: String,
      default: 'Hiring Team',
      trim: true,
    },
    companyName: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    versionType: {
      type: String,
      enum: ['normal', 'short'],
      default: 'normal',
    },
    status: {
      type: String,
      enum: ['draft', 'approved', 'sent', 'failed', 'cancelled'],
      default: 'draft',
      index: true,
    },
    provider: {
      type: String,
      default: 'direct',
    },
    providerMessageId: {
      type: String,
    },
    error: {
      type: String,
    },
    sentAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

EmailLogSchema.index({ userId: 1, recipientEmail: 1, jobId: 1 });
EmailLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('EmailLog', EmailLogSchema);
