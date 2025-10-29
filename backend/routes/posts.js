const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { uploadToCloudinary } = require('../config/cloudinary');
const upload = require('../config/multer');
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');

// Local upload directory for fallback
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const ensureUploadDir = () => {
  const dir = path.join(__dirname, '..', UPLOAD_DIR);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// GET /api/posts - list recent posts
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const posts = await Post.find({ $or: [ { isStory: { $ne: true } }, { expiresAt: { $gt: now } } ] })
      .sort({ createdAt: -1 })
      .populate('user', 'username name avatar')
      .populate({ path: 'comments', populate: { path: 'user', select: 'username name avatar' } });

    // If Cloudinary is configured, migrate any locally-stored uploads
    const cloudConfigured = process.env.CLOUDINARY_API_KEY 
      && process.env.CLOUDINARY_API_SECRET 
      && process.env.CLOUDINARY_CLOUD_NAME 
      && !process.env.CLOUDINARY_API_KEY.includes('your_');

    if (cloudConfigured) {
      // Limit migrations per request to avoid blocking
      let migrated = 0;
      const MAX_MIGRATE = 5;
      for (const post of posts) {
        if (migrated >= MAX_MIGRATE) break;
        if (post.mediaUrl && post.mediaUrl.startsWith('/')) {
          const localPath = path.join(__dirname, '..', post.mediaUrl.replace(/^\//, ''));
          if (fs.existsSync(localPath)) {
            try {
              const result = await uploadToCloudinary(fs.readFileSync(localPath), 'instagram_clone/migrated');
              post.mediaUrl = result.secure_url;
              await post.save();
              migrated++;
            } catch (err) {
              console.error('Failed to migrate local file to Cloudinary for post', post._id, err.message || err);
            }
          }
        }
      }
    }
    
    res.json({ success: true, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/posts/stories - get current stories
router.get('/stories', async (req, res) => {
  try {
    const now = new Date();
    const stories = await Post.find({ isStory: true, expiresAt: { $gt: now } })
      .sort({ createdAt: -1 })
      .populate('user', 'username name avatar');
    res.json({ success: true, stories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/posts - create post with media upload
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No media uploaded' });
    }

    const caption = req.body.caption || '';
    const isStory = req.body.isStory === 'true' || req.body.isStory === true;
    let mediaUrl;

    // Check if Cloudinary is properly configured
    const cloudConfigured = process.env.CLOUDINARY_API_KEY 
      && process.env.CLOUDINARY_API_SECRET 
      && process.env.CLOUDINARY_CLOUD_NAME 
      && !process.env.CLOUDINARY_API_KEY.includes('your_');

    if (cloudConfigured) {
      try {
        // Upload to Cloudinary
        const folder = isStory ? 'instagram_clone/stories' : 'instagram_clone/posts';
        const result = await uploadToCloudinary(req.file.buffer, folder);
        mediaUrl = result.secure_url;
      } catch (err) {
        console.error('Cloudinary upload failed:', err.message);
        
        // Fallback to local storage
        try {
          ensureUploadDir();
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const filename = unique + path.extname(req.file.originalname || '.jpg');
          const filepath = path.join(__dirname, '..', UPLOAD_DIR, filename);
          fs.writeFileSync(filepath, req.file.buffer);
          mediaUrl = `/${UPLOAD_DIR}/${filename}`;
        } catch (err2) {
          console.error('Local save failed after Cloudinary failure:', err2);
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to save media' 
          });
        }
      }
    } else {
      // Cloudinary not configured, save locally
      try {
        ensureUploadDir();
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = unique + path.extname(req.file.originalname || '.jpg');
        const filepath = path.join(__dirname, '..', UPLOAD_DIR, filename);
        fs.writeFileSync(filepath, req.file.buffer);
        mediaUrl = `/${UPLOAD_DIR}/${filename}`;
      } catch (err) {
        console.error('Local save failed:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to save media locally' 
        });
      }
    }

    // Create post with media URL
    const postData = { 
      caption, 
      mediaUrl, 
      user: req.userId,
      contentType: req.file.mimetype
    };

    if (isStory) {
      postData.isStory = true;
      postData.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    }

    const post = new Post(postData);
    await post.save();
    await post.populate('user', 'username name avatar');

    res.json({ 
      success: true, 
      post,
      cloudinary: !!cloudConfigured && mediaUrl.includes('cloudinary')
    });
  } catch (err) {
    console.error('Post creation error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Server error during post creation'
    });
  }
});

// POST /api/posts/:id/like - toggle like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    
    const idx = post.likes.findIndex(l => l.toString() === req.userId);
    let liked = false;
    
    if (idx === -1) {
      post.likes.push(req.userId);
      liked = true;
    } else {
      post.likes.splice(idx, 1);
      liked = false;
    }
    
    await post.save();
    
    // Emit notification to post owner via socket
    try {
      const io = req.app.get('io');
      if (io && post.user.toString() !== req.userId) {
        io.to(post.user.toString()).emit('notification', { 
          type: 'like', 
          postId: post._id, 
          from: req.userId 
        });
      }
    } catch (e) { 
      console.error('emit like notification failed', e);
    }
    
    res.json({ success: true, liked, likesCount: post.likes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/posts/:id/comment - add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Missing comment text' });
    
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    
    // Create comment document and push reference
    const comment = new Comment({ post: post._id, user: req.userId, text });
    await comment.save();
    
    post.comments = post.comments || [];
    post.comments.push(comment._id);
    await post.save();
    
    await comment.populate('user', 'username name avatar');
    
    // Notify post owner
    try {
      const io = req.app.get('io');
      if (io && post.user.toString() !== req.userId) {
        io.to(post.user.toString()).emit('notification', { 
          type: 'comment', 
          postId: post._id, 
          from: req.userId, 
          text 
        });
      }
    } catch (e) { 
      console.error('emit comment notification failed', e);
    }
    
    res.json({ success: true, comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/posts/:id/upvote - toggle upvote
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const hasUpvoted = post.upvotes.includes(req.userId);
    const hasDownvoted = post.downvotes.includes(req.userId);

    if (hasUpvoted) {
      // Remove upvote
      post.upvotes = post.upvotes.filter(id => id.toString() !== req.userId);
    } else {
      // Add upvote and remove downvote if exists
      post.upvotes.push(req.userId);
      if (hasDownvoted) {
        post.downvotes = post.downvotes.filter(id => id.toString() !== req.userId);
      }
    }

    await post.save();
    res.json({ 
      success: true, 
      upvoted: !hasUpvoted,
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/posts/:id/downvote - toggle downvote
router.post('/:id/downvote', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const hasDownvoted = post.downvotes.includes(req.userId);
    const hasUpvoted = post.upvotes.includes(req.userId);

    if (hasDownvoted) {
      // Remove downvote
      post.downvotes = post.downvotes.filter(id => id.toString() !== req.userId);
    } else {
      // Add downvote and remove upvote if exists
      post.downvotes.push(req.userId);
      if (hasUpvoted) {
        post.upvotes = post.upvotes.filter(id => id.toString() !== req.userId);
      }
    }

    await post.save();
    res.json({ 
      success: true, 
      downvoted: !hasDownvoted,
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/posts/:id - delete own post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.user.toString() !== req.userId) return res.status(403).json({ success: false, message: 'Not allowed' });
    
    // Delete local file if it exists
    if (post.mediaUrl && post.mediaUrl.startsWith('/')) {
      const localPath = path.join(__dirname, '..', post.mediaUrl.replace(/^\//, ''));
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    }
    
    await Post.deleteOne({ _id: post._id });
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
