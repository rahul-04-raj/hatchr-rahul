const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  hatchPoints: { type: Number, default: 0 },
  pointsHistory: [{
    action: { type: String, enum: ['project_created', 'post_created', 'received_upvote', 'comment_made'] },
    points: Number,
    timestamp: { type: Date, default: Date.now },
    reference: { type: mongoose.Schema.Types.ObjectId, refPath: 'pointsHistory.referenceModel' },
    referenceModel: { type: String, enum: ['Project', 'Post', 'Comment'] }
  }],
  // OTP verification fields
  otp: {
    code: { type: String, default: null },
    expiresAt: { type: Date, default: null }
  },
  isEmailVerified: { type: Boolean, default: false },
  // Password reset fields
  resetPasswordOtp: {
    code: { type: String, default: null },
    expiresAt: { type: Date, default: null }
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// TTL index - auto-delete expired OTPs
UserSchema.index({ 'otp.expiresAt': 1 }, { expireAfterSeconds: 0 });
UserSchema.index({ 'resetPasswordOtp.expiresAt': 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('User', UserSchema);
