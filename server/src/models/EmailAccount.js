const mongoose = require('mongoose');

const EmailAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    emailAddress: {
      type: String,
      required: [true, 'Sender email address is required'],
      lowercase: true,
      trim: true,
    },
    senderName: {
      type: String,
      default: '',
      trim: true,
    },
    provider: {
      type: String,
      enum: ['direct', 'gmail', 'outlook', 'smtp', 'custom'],
      default: 'direct',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    dailyLimit: {
      type: Number,
      default: 20,
    },
    sentTodayCount: {
      type: Number,
      default: 0,
    },
    lastSentDate: {
      type: String, // YYYY-MM-DD
      default: () => new Date().toISOString().split('T')[0],
    },
  },
  { timestamps: true }
);

EmailAccountSchema.index({ userId: 1, emailAddress: 1 }, { unique: true });

module.exports = mongoose.model('EmailAccount', EmailAccountSchema);
