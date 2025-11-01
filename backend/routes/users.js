const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const User = require('../models/User');
const upload = require('../config/multer');
const { uploadToCloudinary } = require('../config/cloudinary');
const ioEmit = (req, payload) => {
  try { const io = req.app.get('io'); if (io) io.emit('notification', payload) } catch (e) { }
}

// GET /api/users/:username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password').populate('followers', 'username name avatar').populate('following', 'username name avatar');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/users/follow/:id - follow a user
router.post('/follow/:id', auth, async (req, res) => {
  try {
    const targetId = req.params.id;
    if (req.userId === targetId) return res.status(400).json({ success: false, message: 'Cannot follow yourself' });

    const me = await User.findById(req.userId);
    const target = await User.findById(targetId);
    if (!me || !target) return res.status(404).json({ success: false, message: 'User not found' });

    const isFollowing = me.following.some(f => f.toString() === targetId);
    if (isFollowing) {
      return res.status(400).json({ success: false, message: 'Already following this user' });
    }

    me.following.push(targetId);
    target.followers.push(req.userId);
    await me.save();
    await target.save();

    // notify target user about follow
    try {
      const io = req.app.get('io')
      if (io && targetId !== req.userId) io.to(targetId).emit('notification', { type: 'follow', from: req.userId })
    } catch (e) { }

    res.json({ success: true, following: true, followersCount: target.followers.length, followingCount: me.following.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/users/unfollow/:id - unfollow a user
router.post('/unfollow/:id', auth, async (req, res) => {
  try {
    const targetId = req.params.id;
    if (req.userId === targetId) return res.status(400).json({ success: false, message: 'Cannot unfollow yourself' });

    const me = await User.findById(req.userId);
    const target = await User.findById(targetId);
    if (!me || !target) return res.status(404).json({ success: false, message: 'User not found' });

    const isFollowing = me.following.some(f => f.toString() === targetId);
    if (!isFollowing) {
      return res.status(400).json({ success: false, message: 'Not following this user' });
    }

    me.following = me.following.filter(f => f.toString() !== targetId);
    target.followers = target.followers.filter(f => f.toString() !== req.userId);
    await me.save();
    await target.save();

    res.json({ success: true, following: false, followersCount: target.followers.length, followingCount: me.following.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/users/:userId/followers - get followers list
router.get('/:userId/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('followers', 'username name avatar bio')
      .select('followers');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, followers: user.followers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/users/:userId/following - get following list
router.get('/:userId/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('following', 'username name avatar bio')
      .select('following');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, following: user.following });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/users/:id - update profile
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.userId !== req.params.id) return res.status(403).json({ success: false, message: 'Not allowed' })
    const allowed = ['name', 'username', 'avatar', 'email', 'bio']
    const update = {}
    for (const k of allowed) if (req.body[k]) update[k] = req.body[k]
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password')
    res.json({ success: true, user })
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Server error' }) }
})

// POST /api/users/avatar - Update user avatar
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No avatar image uploaded' });
    }

    // Check if Cloudinary is properly configured
    const cloudConfigured = process.env.CLOUDINARY_API_KEY
      && process.env.CLOUDINARY_API_SECRET
      && process.env.CLOUDINARY_CLOUD_NAME
      && !process.env.CLOUDINARY_API_KEY.includes('your_');

    let avatarUrl;
    if (cloudConfigured) {
      try {
        // Upload to Cloudinary with transformation for avatar
        const result = await uploadToCloudinary(req.file.buffer, 'instagram_clone/avatars', {
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto' }
          ]
        });
        avatarUrl = result.secure_url;
      } catch (err) {
        console.error('Cloudinary upload failed:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to upload avatar' });
      }
    } else {
      return res.status(500).json({ success: false, message: 'Cloud storage not configured' });
    }

    // Update user avatar in database
    const user = await User.findByIdAndUpdate(
      req.userId,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during avatar upload'
    });
  }
});

module.exports = router;
