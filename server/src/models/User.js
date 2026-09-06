const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: String, // Email is the primary key (_id)
      required: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    plan: {
      type: String,
      enum: ['basic', 'pro'],
      default: 'basic',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active',
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    suspendedAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
    dailyEmailLimit: {
      type: Number,
      default: 5,
      min: 1,
      max: 100,
    },
    aiGenerationsCount: {
      type: Number,
      default: 0,
    },
    autoSendEnabled: {
      type: Boolean,
      default: false,
    },
    upgradeRequested: {
      type: Boolean,
      default: false,
    },
    upgradeRequestedAt: {
      type: Date,
      default: null,
    },
    upgradeRequestNote: {
      type: String,
      default: '',
    },
    activeResumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
