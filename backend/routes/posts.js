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
const Project = require('../models/Project');
const { awardPoints } = require('../utils/points');

// Local upload directory for fallback
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const ensureUploadDir = () => {
  const dir = path.join(__dirname, '..', UPLOAD_DIR);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Search posts
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query parameter required' });
    }

    const userId = req.user?._id || req.userId;
    const posts = await Post.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { caption: { $regex: q, $options: 'i' } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
      .populate('user', 'username name avatar')
      .populate('project', 'title')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username name avatar' }
      });

    // Process each post to add vote status
    const processedPosts = posts.map(post => ({
      ...post,
      hasUpvoted: userId ? post.upvotes.some(id => String(id) === String(userId)) : false,
      hasDownvoted: userId ? post.downvotes.some(id => String(id) === String(userId)) : false,
      upvoteCount: post.upvotes.length,
      downvoteCount: post.downvotes.length
    }));

    res.json(processedPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to search posts' });
  }
});

// GET /api/posts/:id - get single post
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const post = await Post.findById(req.params.id)
      .lean()
      .populate('user', 'username name avatar')
      .populate('project', 'title')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username name avatar' },
        options: { sort: { createdAt: 1 } }
      });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const processedPost = {
      ...post,
      hasUpvoted: userId ? post.upvotes.some(id => String(id) === String(userId)) : false,
      hasDownvoted: userId ? post.downvotes.some(id => String(id) === String(userId)) : false,
      upvoteCount: post.upvotes.length,
      downvoteCount: post.downvotes.length
    };

    res.json({ success: true, post: processedPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/posts - list recent posts
router.get('/', async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .lean()
      .populate('user', 'username name avatar')
      .populate({
        path: 'project',
        populate: { path: 'posts' }
      })
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username name avatar' }
      });

    // Process each post to add vote status
    const processedPosts = posts.map(post => ({
      ...post,
      hasUpvoted: userId ? post.upvotes.some(id => String(id) === String(userId)) : false,
      hasDownvoted: userId ? post.downvotes.some(id => String(id) === String(userId)) : false,
      upvoteCount: post.upvotes.length,
      downvoteCount: post.downvotes.length
    }));

    res.json({ success: true, posts: processedPosts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new post
router.post('/', auth, upload.array('media', 10), async (req, res) => {
  try {
    const { title, caption, projectId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one media file is required'
      });
    }

    if (req.files.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 media files allowed'
      });
    }

    // Upload all media files
    const mediaArray = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      let mediaUrl;

      try {
        const result = await uploadToCloudinary(file.buffer);
        mediaUrl = result.secure_url;
      } catch (err) {
        console.error('Cloudinary upload failed:', err);
        // Fallback to local storage
        try {
          ensureUploadDir();
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const filename = unique + path.extname(file.originalname || '.jpg');
          const filepath = path.join(__dirname, '..', UPLOAD_DIR, filename);
          fs.writeFileSync(filepath, file.buffer);
          mediaUrl = `/${UPLOAD_DIR}/${filename}`;
        } catch (err2) {
          console.error('Local save failed:', err2);
          return res.status(500).json({
            success: false,
            message: 'Failed to save media'
          });
        }
      }

      mediaArray.push({
        url: mediaUrl,
        type: file.mimetype.startsWith('video/') ? 'video' : 'image',
        contentType: file.mimetype,
        order: i
      });
    }

    const post = new Post({
      title: title.trim(),
      caption,
      media: mediaArray,
      // Backward compatibility - use first media item
      mediaUrl: mediaArray[0].url,
      contentType: mediaArray[0].contentType,
      user: req.userId,
      project: projectId
    });

    await post.save();

    // Update project's posts array
    if (projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        project.posts.push(post._id);
        await project.save();
      }
    }

    await post.populate('user', 'username name avatar');
    await post.populate('project');

    // Award points for creating a post
    const pointsAwarded = await awardPoints(
      req.userId,
      'post_created',
      post._id,
      'Post'
    );

    res.status(201).json({
      success: true,
      post: {
        ...post.toObject(),
        hasUpvoted: false,
        hasDownvoted: false,
        upvoteCount: 0,
        downvoteCount: 0
      },
      pointsAwarded: pointsAwarded.points,
      totalPoints: pointsAwarded.total
    });
  } catch (err) {
    console.error('Post creation error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create post'
    });
  }
});

// Add comment to a post
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = new Comment({
      text,
      user: req.userId,
      post: post._id
    });

    await comment.save();
    await comment.populate('user', 'username name avatar');

    post.comments.push(comment._id);
    await post.save();

    // Award points for making a comment
    const pointsAwarded = await awardPoints(
      req.userId,
      'comment_made',
      comment._id,
      'Comment'
    );

    res.json({
      success: true,
      comment,
      pointsAwarded: pointsAwarded.points,
      totalPoints: pointsAwarded.total
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
});

// Upvote a post
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

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

    // Award points to the post creator for receiving an upvote
    // Only award points if this is a new upvote (not removing an upvote)
    let pointsAwarded = null;
    if (!hasUpvoted) {
      pointsAwarded = await awardPoints(
        post.user.toString(),
        'received_upvote',
        post._id,
        'Post'
      );
    }

    res.json({
      success: true,
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
      hasUpvoted: !hasUpvoted,
      hasDownvoted: false,
      pointsAwarded: pointsAwarded ? pointsAwarded.points : 0,
      totalPoints: pointsAwarded ? pointsAwarded.total : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to update vote'
    });
  }
});

// Downvote a post
router.post('/:id/downvote', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

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
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
      hasUpvoted: false,
      hasDownvoted: !hasDownvoted
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to update vote'
    });
  }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Delete associated comments
    await Comment.deleteMany({ post: post._id });

    // Remove post reference from project
    if (post.project) {
      const project = await Project.findById(post.project);
      if (project) {
        project.posts = project.posts.filter(id => id.toString() !== post._id.toString());
        await project.save();
      }
    }

    await post.deleteOne();
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
});

module.exports = router;