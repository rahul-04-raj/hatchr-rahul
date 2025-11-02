const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], required: true },
  contentType: { type: String }, // Store mime type (image/jpeg, video/mp4, etc.)
  order: { type: Number, default: 0 } // Order of media in the carousel
}, { _id: false });

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  caption: { type: String, default: '' },
  media: [MediaSchema], // Array of media items (supports up to 10)
  // Keep old field for backward compatibility
  mediaUrl: { type: String },
  contentType: { type: String },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  type: {
    type: String,
    enum: ['update', 'announcement', 'milestone'],
    default: 'update'
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Post', PostSchema);
