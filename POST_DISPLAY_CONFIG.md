# Post Display Configuration Guide

## Overview
Posts now have a **fixed-width layout** with automatic side bars for images smaller than the target width. This creates a consistent, Instagram-like appearance across all posts.

## Key Features

### 1. Fixed Post Width
- All posts maintain a consistent width of **600px** (configurable)
- Feed and Post View pages use `max-w-2xl` (672px) container
- Creates a clean, centered layout

### 2. Smart Image Display
The `FixedWidthMedia` component automatically handles different image sizes:

**Small Images (< 600px wide)**
- Image displays at its natural size
- Dark side bars appear on left and right
- Image is perfectly centered
- Maintains visual consistency with other posts

**Large Images (≥ 600px wide)**
- Image is scaled down to 600px width
- Aspect ratio is preserved
- No side bars needed
- Fills the entire post width

### 3. Video Support
- Videos are displayed at full width (up to 600px)
- Side bars appear if video is smaller than fixed width
- Native video controls included

## Configuration

Edit `/frontend/src/config/postConfig.js` to customize:

```javascript
export const POST_CONFIG = {
  // Fixed width for post media in pixels
  FIXED_WIDTH: 600,
  
  // Background color for side bars
  BAR_COLOR: '#0a0a0a',
};
```

### Suggested Bar Colors
```javascript
BAR_COLOR: '#0a0a0a'  // Very dark gray (default)
BAR_COLOR: '#1a1a1a'  // Dark gray
BAR_COLOR: '#000000'  // Pure black
BAR_COLOR: '#1e293b'  // Slate dark
BAR_COLOR: '#2d2d2d'  // Medium dark gray
```

## Components

### FixedWidthMedia
Located at: `/frontend/src/components/FixedWidthMedia.jsx`

Handles individual image/video display with automatic bar placement.

**Props:**
- `src` (string) - Media URL
- `type` (string) - 'image' or 'video'
- `fixedWidth` (number) - Target width in pixels
- `barColor` (string) - Side bar color

### MediaCarousel
Located at: `/frontend/src/components/MediaCarousel.jsx`

Displays multiple media items with navigation. Now uses `FixedWidthMedia` internally.

**Features:**
- Swipe navigation (touch and mouse)
- Navigation arrows
- Dot indicators
- Media counter

## Modified Pages

### Feed Page
- Changed from `max-w-3xl` to `max-w-2xl`
- Posts are more compact and focused
- Better mobile experience

### PostView Page
- Changed from `max-w-4xl` to `max-w-2xl`
- Consistent width with Feed page
- Cleaner single-post view

## Technical Details

### Image Loading
1. Component loads image metadata
2. Compares natural width to fixed width
3. Calculates if bars are needed
4. Applies appropriate styles
5. Centers image with bars if needed

### Aspect Ratio
- Always preserved
- No distortion or stretching
- Height adjusts automatically

### Performance
- Images lazy load
- Loading skeleton shown while image loads
- Minimal re-renders

## Usage Example

```jsx
import FixedWidthMedia from './components/FixedWidthMedia';
import { FIXED_WIDTH, BAR_COLOR } from './config/postConfig';

function MyComponent() {
  return (
    <FixedWidthMedia
      src="https://example.com/image.jpg"
      type="image"
      fixedWidth={FIXED_WIDTH}
      barColor={BAR_COLOR}
    />
  );
}
```

## Benefits

✅ **Consistent Layout** - All posts have the same width
✅ **Professional Look** - Clean, Instagram-like appearance
✅ **Better Focus** - Narrower posts are easier to read
✅ **Responsive** - Works on all screen sizes
✅ **Flexible** - Easy to customize width and colors
✅ **Smart Scaling** - Handles any image size gracefully

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires CSS Flexbox support
