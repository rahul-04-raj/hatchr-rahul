import React, { useState, useEffect, useRef } from 'react';

/**
 * FixedWidthMedia Component
 * Displays media (image/video) with a fixed width container.
 * Images smaller than the fixed width are centered with side bars.
 * Images larger than the fixed width are scaled down maintaining aspect ratio.
 * 
 * @param {string} src - The media URL
 * @param {string} type - 'image' or 'video'
 * @param {number} fixedWidth - Target width in pixels (default: 600)
 * @param {string} barColor - Color of side bars (default: '#1a1a1a')
 */
export default function FixedWidthMedia({ src, type = 'image', fixedWidth = 600, barColor = '#1a1a1a' }) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [needsBars, setNeedsBars] = useState(false);
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
        
        // Determine if we need side bars
        if (naturalWidth < fixedWidth) {
          setNeedsBars(true);
          setDimensions({ width: naturalWidth, height: naturalHeight });
        } else {
          setNeedsBars(false);
          // Scale down maintaining aspect ratio
          const aspectRatio = naturalHeight / naturalWidth;
          setDimensions({ width: fixedWidth, height: fixedWidth * aspectRatio });
        }
        setLoading(false);
      };
      img.onerror = () => {
        setLoading(false);
      };
    }
  }, [src, type, fixedWidth]);

  if (type === 'video') {
    return (
      <div 
        className="flex items-center justify-center w-full"
        style={{ 
          backgroundColor: barColor 
        }}
      >
        <video
          src={src}
          controls
          controlsList="nodownload"
          className="w-full"
          style={{ maxWidth: `${fixedWidth}px` }}
          playsInline
          preload="metadata"
          onClick={(e) => e.stopPropagation()}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center justify-center w-full"
      style={{ 
        backgroundColor: needsBars ? barColor : 'black',
        minHeight: loading ? '400px' : (dimensions.height || 'auto')
      }}
    >
      {loading && (
        <div className="animate-pulse bg-gray-800 w-full h-96"></div>
      )}
      <img
        ref={imgRef}
        src={src}
        alt="Post media"
        className={`block ${loading ? 'hidden' : ''}`}
        style={{
          width: needsBars ? `${dimensions.width}px` : '100%',
          maxWidth: `${fixedWidth}px`,
          height: 'auto'
        }}
        draggable="false"
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}
