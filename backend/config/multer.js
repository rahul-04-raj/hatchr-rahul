const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter to validate uploads
const fileFilter = (req, file, cb) => {
  // Accept images and videos only
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    // Check file size based on type
    if (file.mimetype.startsWith('video/')) {
      // 100MB limit for videos
      if (file.size > 100 * 1024 * 1024) {
        cb(new Error('Video file too large! Maximum size is 100MB.'), false);
        return;
      }
    } else {
      // 10MB limit for images
      if (file.size > 10 * 1024 * 1024) {
        cb(new Error('Image file too large! Maximum size is 10MB.'), false);
        return;
      }
    }
    cb(null, true);
  } else {
    cb(new Error('Not an image or video! Please upload only images or videos.'), false);
  }
};

// Configure upload limits
const limits = {
  files: 10 // Maximum 10 files per upload
};

// Create multer instance with configuration
const upload = multer({
  storage,
  fileFilter,
  limits
});

module.exports = upload;