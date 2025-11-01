import React, { useState, useEffect } from 'react';

export default function PointsToast({ points, action, onClose }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onClose) onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    if (!isVisible) return null;

    let actionText = '';
    switch (action) {
        case 'project_created':
            actionText = 'Hatching new project';
            break;
        case 'post_created':
            actionText = 'Creating post';
            break;
        case 'received_upvote':
            actionText = 'Receiving upvote';
            break;
        case 'comment_made':
            actionText = 'Making comment';
            break;
        default:
            actionText = 'Action';
    }

    return (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg shadow-lg transform transition-transform animate-bounce">
            <div className="flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
                <div>
                    <div className="font-medium">+{points} Hatch Points</div>
                    <div className="text-sm">{actionText}</div>
                </div>
            </div>
        </div>
    );
}