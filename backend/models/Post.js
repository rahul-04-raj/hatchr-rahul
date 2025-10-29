const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  caption: { type: String, default: '' },
  mediaUrl: { type: String, required: true },
  isStory: { type: Boolean, default: false },
  expiresAt: { type: Date },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
