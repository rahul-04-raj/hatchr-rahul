const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const ensureUploadDir = () => {
  const dir = path.join(__dirname, '..', UPLOAD_DIR);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');

// Use memory storage so we can stream buffer to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET /api/posts - list recent posts
router.get('/', async (req, res) => {
  try {
    // Exclude expired stories from the main feed; stories can be fetched separately
    const now = new Date();
    const posts = await Post.find({ $or: [ { isStory: { $ne: true } }, { expiresAt: { $gt: now } } ] }).sort({ createdAt: -1 })
      .populate('user', 'username name avatar')
      .populate({ path: 'comments', populate: { path: 'user', select: 'username name avatar' } });

    // If Cloudinary is configured, migrate any locally-stored uploads to Cloudinary
    const cloudConfigured = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME && !process.env.CLOUDINARY_API_KEY.includes('your_')
    if (cloudConfigured) {
      // Limit how many migrations we do per request to avoid long blocking
      let migrated = 0
      const MAX_MIGRATE = 5
      for (const post of posts) {
        if (migrated >= MAX_MIGRATE) break
        if (post.mediaUrl && post.mediaUrl.startsWith('/')) {
          // likely a local upload path like /uploads/filename
          const uploadsDir = process.env.UPLOAD_DIR || 'uploads'
          const localPath = path.join(__dirname, '..', post.mediaUrl.replace(/^\//, ''))
          if (fs.existsSync(localPath)) {
            try {
              const result = await cloudinary.uploader.upload(localPath, { folder: 'instagram_clone/migrated' })
              post.mediaUrl = result.secure_url
              await post.save()
              migrated++
            } catch (err) {
              console.error('Failed to migrate local file to Cloudinary for post', post._id, err.message || err)
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
  const stories = await Post.find({ isStory: true, expiresAt: { $gt: now } }).sort({ createdAt: -1 }).populate('user', 'username name avatar');
    res.json({ success: true, stories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/posts - create post with media upload
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No media uploaded' });
    const caption = req.body.caption || '';
    const isStory = req.body.isStory === 'true' || req.body.isStory === true;

    // Upload buffer to Cloudinary if configured, otherwise save locally
    let mediaUrl;
    const cloudConfigured = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME && !process.env.CLOUDINARY_API_KEY.includes('your_');
    if (cloudConfigured) {
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'instagram_clone' }, (error, result) => {
            if (result) resolve(result);
            else reject(error);
          });
          streamifier.createReadStream(buffer).pipe(stream);
        });
      };

      try {
        const result = await streamUpload(req.file.buffer);
        mediaUrl = result.secure_url;
      } catch (err) {
        // Log error but FALLBACK to local save instead of failing the request
        console.error('Cloudinary upload failed, falling back to local save', err && err.message ? err.message : err);
        try{
          ensureUploadDir();
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const filename = unique + path.extname(req.file.originalname || '.jpg');
          const filepath = path.join(__dirname, '..', UPLOAD_DIR, filename);
          fs.writeFileSync(filepath, req.file.buffer);
          mediaUrl = `/${UPLOAD_DIR}/${filename}`;
        }catch(err2){
          console.error('Local save failed after Cloudinary failure', err2);
          return res.status(500).json({ success: false, message: 'Failed to upload media' });
        }
      }
    } else {
      // fallback: save to local uploads folder
      try{
        ensureUploadDir();
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = unique + path.extname(req.file.originalname || '.jpg');
        const filepath = path.join(__dirname, '..', UPLOAD_DIR, filename);
        fs.writeFileSync(filepath, req.file.buffer);
        mediaUrl = `/${UPLOAD_DIR}/${filename}`;
      }catch(err){
        console.error('Local save failed', err);
        return res.status(500).json({ success: false, message: 'Failed to save file locally' });
      }
    }

    const postData = { caption, mediaUrl, user: req.userId };
    if (isStory) {
      postData.isStory = true;
      // default story expiration: 24 hours
      postData.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    const post = new Post(postData);
    await post.save();
    await post.populate('user', 'username name avatar');
    res.json({ success: true, post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
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
    // emit notification to post owner via socket
    try{
      const io = req.app.get('io')
      if (io && post.user.toString() !== req.userId) {
        io.to(post.user.toString()).emit('notification', { type: 'like', postId: post._id, from: req.userId })
      }
    }catch(e){ console.error('emit like notification failed', e) }
    res.json({ success: true, liked, likesCount: post.likes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/posts/:id/comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Missing comment text' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    // create comment document and push reference
    const comment = new Comment({ post: post._id, user: req.userId, text });
    await comment.save();
    post.comments = post.comments || [];
    post.comments.push(comment._id);
    await post.save();
    await comment.populate('user', 'username name avatar');
    // notify post owner
    try{
      const io = req.app.get('io')
      if (io && post.user.toString() !== req.userId) {
        io.to(post.user.toString()).emit('notification', { type: 'comment', postId: post._id, from: req.userId, text })
      }
    }catch(e){ console.error('emit comment notification failed', e) }
    res.json({ success: true, comment });
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
    await post.remove();
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
})

module.exports = router;
