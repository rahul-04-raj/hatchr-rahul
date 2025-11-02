import React, { useState, useRef, useEffect } from 'react';
import FixedWidthMedia from './FixedWidthMedia';
import { FIXED_WIDTH, BAR_COLOR } from '../config/postConfig';

export default function MediaCarousel({ media }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const videoRefs = useRef([]);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    if (!media || media.length === 0) return null;

    // Support both old single media format and new array format
    const mediaItems = Array.isArray(media) ? media : [{ url: media, type: 'image' }];

    // Pause videos when switching slides
    useEffect(() => {
        videoRefs.current.forEach((video, index) => {
            if (video && index !== currentIndex) {
                video.pause();
            }
        });
    }, [currentIndex]);

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? mediaItems.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === mediaItems.length - 1 ? 0 : prevIndex + 1
        );
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    // Touch handlers for swipe
    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            goToNext();
        } else if (isRightSwipe) {
            goToPrevious();
        }
    };

    // Mouse handlers for desktop swipe
    const [mouseDown, setMouseDown] = useState(false);
    const [mouseStart, setMouseStart] = useState(null);

    const onMouseDown = (e) => {
        setMouseDown(true);
        setMouseStart(e.clientX);
    };

    const onMouseMove = (e) => {
        if (!mouseDown) return;
    };

    const onMouseUp = (e) => {
        if (!mouseDown || !mouseStart) {
            setMouseDown(false);
            return;
        }

        const distance = mouseStart - e.clientX;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            goToNext();
        } else if (isRightSwipe) {
            goToPrevious();
        }

        setMouseDown(false);
        setMouseStart(null);
    };

    const onMouseLeave = () => {
        setMouseDown(false);
        setMouseStart(null);
    };

    return (
        <div className="relative w-full bg-black" onClick={(e) => e.stopPropagation()}>
            {/* Media Display */}
            <div
                className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
            >
                {mediaItems.map((item, index) => (
                    <div
                        key={index}
                        className={`transition-opacity duration-300 ${index === currentIndex ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
                            }`}
                        style={{ backgroundColor: BAR_COLOR }}
                    >
                        {index === currentIndex && (
                            <FixedWidthMedia
                                src={item.url}
                                type={item.type}
                                fixedWidth={FIXED_WIDTH}
                                barColor={BAR_COLOR}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {mediaItems.length > 1 && (
                <>
                    {/* Previous Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            goToPrevious();
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-20"
                        aria-label="Previous"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Next Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            goToNext();
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-20"
                        aria-label="Next"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {mediaItems.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
                    {mediaItems.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                goToSlide(index);
                            }}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                ? 'bg-white w-8'
                                : 'bg-white/50 hover:bg-white/75'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Media Counter (top-right) */}
            {mediaItems.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full z-20">
                    {currentIndex + 1} / {mediaItems.length}
                </div>
            )}
        </div>
    );
}