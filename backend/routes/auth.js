const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const User = require('../models/User');
const auth = require('../middleware/auth');
const otp = require('../utils/otp');
const mail = require('../utils/email');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) return res.status(400).json({ success: false, message: 'Missing fields' });

    // Check if user already exists and is verified
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing && existing.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email or username already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Generate OTP
    const newOTP = otp.generate();

    // Create or update user
    const user = await User.findOneAndUpdate(
      { $or: [{ email }, { username }] },
      {
        name,
        username,
        email,
        password: hashed,
        otp: {
          code: newOTP,
          expiresAt: otp.getExpiry()
        },
        isEmailVerified: false
      },
      { upsert: true, new: true }
    );

    // Send OTP email (don't fail registration if email fails)
    try {
      await mail.sendOTP(email, newOTP, name);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
    }

    res.json({
      success: true,
      message: 'Registration successful. Please check your email for OTP verification.',
      userId: user._id,
      email: user.email
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) return res.status(400).json({ success: false, message: 'Missing fields' });

    const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Resend OTP for convenience
      const newOTP = otp.generate();
      user.otp = {
        code: newOTP,
        expiresAt: otp.getExpiry()
      };
      await user.save();

      try {
        await mail.sendOTP(user.email, newOTP, user.name);
      } catch (e) {
        console.error('Failed to resend OTP:', e);
      }

      return res.status(403).json({
        success: false,
        message: 'Please verify your email first. A new OTP has been sent.',
        requiresVerification: true,
        email: user.email,
        userId: user._id
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        hatchPoints: user.hatchPoints
      },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/auth/me - get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: { _id: user._id, name: user.name, username: user.username, email: user.email, avatar: user.avatar, hatchPoints: user.hatchPoints || 0 } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/verify-email - verify OTP
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp: providedOTP } = req.body;

    if (!email || !providedOTP) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    // Validate OTP
    if (!otp.isValid(user.otp.code, providedOTP, user.otp.expiresAt)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Mark as verified
    user.isEmailVerified = true;
    user.otp = { code: null, expiresAt: null };
    await user.save();

    // Send welcome email
    try {
      await mail.sendWelcome(user.email, user.name);
    } catch (e) {
      console.error('Failed to send welcome email:', e);
    }

    // Generate token for auto-login
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        hatchPoints: user.hatchPoints || 0
      },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/resend-otp - resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    // Generate new OTP
    const newOTP = otp.generate();
    user.otp = {
      code: newOTP,
      expiresAt: otp.getExpiry()
    };
    await user.save();

    // Send OTP email
    try {
      await mail.sendOTP(user.email, newOTP, user.name);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
    }

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;