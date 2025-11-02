/**
 * Post Display Configuration
 * 
 * Centralized configuration for post display settings.
 * Change these values to adjust the appearance across the entire app.
 */

export const POST_CONFIG = {
  // Fixed width for post media in pixels
  // Images will be scaled/centered to fit this width
  FIXED_WIDTH: 450,
  
  // Background color for side bars when image is smaller than fixed width
  // Can use hex, rgb, or named colors
  BAR_COLOR: '#0a0a0a', // Very dark gray/black
  
  // Alternative bar colors you can use:
  // BAR_COLOR: '#1a1a1a',  // Dark gray
  // BAR_COLOR: '#2d2d2d',  // Medium dark gray
  // BAR_COLOR: '#000000',  // Pure black
  // BAR_COLOR: '#1e293b',  // Slate dark
  // BAR_COLOR: '#1f2937',  // Gray dark
};

// Export individual values for convenience
export const { FIXED_WIDTH, BAR_COLOR } = POST_CONFIG;
