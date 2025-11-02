import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditorJSRenderer from './EditorJSRenderer';

export default function ProjectTimeline({ posts, onRefresh }) {
  const [expandedPost, setExpandedPost] = useState(null);
  const navigate = useNavigate();

  // Sort posts: latest first, hatching last
  const sortedPosts = [...posts].sort((a, b) => {
    // Hatching posts always go to the end
    if (a.type === 'hatching' && b.type !== 'hatching') return 1;
    if (b.type === 'hatching' && a.type !== 'hatching') return -1;
    
    // Otherwise sort by date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const toggleExpand = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  const handlePostClick = (post, e) => {
    // If clicking on the card itself (not expand button), expand it
    if (e.target.closest('.expand-button')) return;
    if (e.target.closest('button')) return; // Don't trigger on other buttons
    toggleExpand(post._id);
  };

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'hatching':
        return '🐣';
      case 'milestone':
        return '🎯';
      case 'announcement':
        return '📢';
      case 'update':
      default:
        return '📝';
    }
  };

  const getPostTypeColor = (type) => {
    switch (type) {
      case 'hatching':
        return 'bg-orange-50 border-orange-200';
      case 'milestone':
        return 'bg-green-50 border-green-200';
      case 'announcement':
        return 'bg-yellow-50 border-yellow-200';
      case 'update':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const renderContentPreview = (caption) => {
    try {
      const captionData = typeof caption === 'string' ? JSON.parse(caption) : caption;
      if (!captionData?.blocks || captionData.blocks.length === 0) {
        return <p className="text-gray-500 italic">No content</p>;
      }

      const firstBlock = captionData.blocks[0];
      let previewText = '';

      if (firstBlock.type === 'paragraph' || firstBlock.type === 'header') {
        previewText = firstBlock.data?.text?.replace(/<[^>]*>/g, '') || '';
      } else if (firstBlock.type === 'list') {
        const firstItem = firstBlock.data?.items?.[0];
        if (typeof firstItem === 'string') {
          previewText = firstItem.replace(/<[^>]*>/g, '');
        } else if (typeof firstItem === 'object' && firstItem?.content) {
          previewText = firstItem.content.replace(/<[^>]*>/g, '');
        }
      } else if (firstBlock.type === 'quote') {
        previewText = firstBlock.data?.text?.replace(/<[^>]*>/g, '') || '';
      }

      return (
        <p className="text-gray-700 line-clamp-2">
          {previewText || '[Content block]'}
        </p>
      );
    } catch (error) {
      return <p className="text-gray-500 italic">Content preview unavailable</p>;
    }
  };

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      {/* Posts */}
      <div className="space-y-6">
        {sortedPosts.map((post, index) => {
          const isExpanded = expandedPost === post._id;
          const isHatching = post.type === 'hatching';

          return (
            <div key={post._id} className="relative pl-14">
              {/* Timeline Dot */}
              <div 
                className={`absolute left-5 top-6 w-4 h-4 rounded-full transform -translate-x-1/2 border-2 border-white shadow-md z-10 ${
                  isHatching ? 'bg-orange-400' : 
                  post.type === 'milestone' ? 'bg-green-400' : 
                  post.type === 'announcement' ? 'bg-yellow-400' : 
                  'bg-blue-400'
                }`}
              />

              {/* Post Card */}
              <div 
                className={`border-2 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer ${
                  getPostTypeColor(post.type)
                } ${isExpanded ? 'shadow-lg' : ''}`}
                onClick={(e) => handlePostClick(post, e)}
              >
                {/* Card Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getPostTypeIcon(post.type)}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          isHatching ? 'bg-orange-100 text-orange-700' :
                          post.type === 'milestone' ? 'bg-green-100 text-green-700' :
                          post.type === 'announcement' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {post.title}
                      </h3>

                      {!isExpanded && (
                        <div className="mt-2">
                          {renderContentPreview(post.caption)}
                        </div>
                      )}
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                      className="expand-button ml-4 p-2 hover:bg-white/50 rounded-full transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(post._id);
                      }}
                    >
                      <svg 
                        className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {/* Media Preview */}
                      {post.media && post.media.length > 0 && (
                        <div className="mb-4">
                          <div className="grid grid-cols-2 gap-2">
                            {post.media.slice(0, 4).map((item, idx) => (
                              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-200">
                                {item.type === 'image' ? (
                                  <img 
                                    src={item.url} 
                                    alt="" 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          {post.media.length > 4 && (
                            <p className="text-sm text-gray-500 mt-2">
                              +{post.media.length - 4} more
                            </p>
                          )}
                        </div>
                      )}

                      {/* Content */}
                      <div className="prose prose-sm max-w-none mb-4">
                        {post.caption && (
                          <EditorJSRenderer 
                            data={typeof post.caption === 'string' ? JSON.parse(post.caption) : post.caption} 
                          />
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>👍 {post.upvotes?.length || 0}</span>
                        <span>👎 {post.downvotes?.length || 0}</span>
                        <span>💬 {post.comments?.length || 0} comments</span>
                      </div>

                      {/* View Full Post Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/post/${post._id}`);
                        }}
                        className="mt-4 w-full py-2 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                      >
                        View Full Post & Comments
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}