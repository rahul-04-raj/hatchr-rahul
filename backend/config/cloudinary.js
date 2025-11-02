const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Utility function to upload buffer to Cloudinary using streams
const uploadToCloudinary = (buffer, folder = 'instagram_clone') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto', // Automatically detect if it's image or video
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'webp'], // Allowed formats
        transformation: [
          { quality: 'auto:good', fetch_format: 'auto' }, // Automatic quality optimization and format
          { width: 1080, crop: 'limit' } // Limit max width to 1080px for faster uploads
        ],
        timeout: 60000 // 60 second timeout
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary
};
