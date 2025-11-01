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
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
