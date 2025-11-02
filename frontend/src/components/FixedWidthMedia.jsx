import React, { useState, useEffect, useRef } from 'react';

/**
 * FixedWidthMedia Component
 * Displays media (image/video) with smart sizing:
 * - If image height fits within 600px: show full width, no black bars
 * - If image height exceeds 600px: constrain to 600px height with black bars on sides
 * 
 * @param {string} src - The media URL
 * @param {string} type - 'image' or 'video'
 * @param {number} fixedWidth - Target width in pixels (default: 600)
 * @param {string} barColor - Color of side bars (default: '#1a1a1a')
 */
export default function FixedWidthMedia({ src, type = 'image', fixedWidth = 600, barColor = '#1a1a1a' }) {
  const [needsConstraint, setNeedsConstraint] = useState(false);
  const [loading, setLoading] = useState(true);
  const imgRef = useRef(null);

  useEffect(() => {
    if (type === 'image') {
      setLoading(true);
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        const maxHeight = 300;

        // Calculate aspect ratio
        const aspectRatio = naturalHeight / naturalWidth;

        // Calculate height if we use full available width
        const heightAtFullWidth = fixedWidth * aspectRatio;

        // Only need constraint (black bars) if height would exceed maxHeight
        setNeedsConstraint(heightAtFullWidth > maxHeight);
        setLoading(false);
      };
      img.onerror = () => {
        setLoading(false);
      };
    }
  }, [src, type, fixedWidth]);

  if (type === 'video') {
    return (
      <div className="flex items-center justify-center w-full bg-black">
        <video
          src={src}
          controls
          controlsList="nodownload"
          className="w-full"
          style={{ maxHeight: '600px' }}
          playsInline
          preload="metadata"
          onClick={(e) => {
            e.stopPropagation();
            const video = e.target;
            if (video.paused) {
              video.play();
            } else {
              video.pause();
            }
          }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // For images
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full bg-black" style={{ minHeight: '400px' }}>
        <div className="animate-pulse bg-gray-800 w-full h-96"></div>
      </div>
    );
  }

  if (needsConstraint) {
    // Image is too tall - use black bars and constrain height
    return (
      <div className="flex items-center justify-center w-full bg-black" style={{ height: '600px' }}>
        <img
          ref={imgRef}
          src={src}
          alt="Post media"
          className="block h-full w-auto object-contain"
          draggable="false"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  }

  // Image fits within height limit - show full width, no black bars
  return (
    <div className="flex items-center justify-center w-full">
      <img
        ref={imgRef}
        src={src}
        alt="Post media"
        className="block w-full h-auto"
        draggable="false"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
