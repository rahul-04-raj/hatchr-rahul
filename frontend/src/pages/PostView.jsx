import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../lib/api';
import { useAuth } from '../store/useAuth';
import MediaCarousel from '../components/MediaCarousel';
import EditorJSRenderer from '../components/EditorJSRenderer';

export default function PostView() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuth(state => state.user);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [voteStats, setVoteStats] = useState({
    upvotes: 0,
    downvotes: 0,
    hasUpvoted: false,
    hasDownvoted: false
  });

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/posts/${postId}`);
      const postData = res.data.post || res.data;
      setPost(postData);
      setVoteStats({
        upvotes: postData.upvotes?.length || 0,
        downvotes: postData.downvotes?.length || 0,
        hasUpvoted: currentUser ? postData.upvotes?.includes(currentUser._id) || postData.upvotes?.some(id => id.toString() === currentUser._id) : false,
        hasDownvoted: currentUser ? postData.downvotes?.includes(currentUser._id) || postData.downvotes?.some(id => id.toString() === currentUser._id) : false
      });
    } catch (err) {
      console.error(err);
      alert('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (type) => {
    if (!currentUser) {
      alert('Please login to vote');
      return;
    }
    try {
      const res = await API.post(`/posts/${postId}/${type}`);
      if (res.data.success) {
        setVoteStats({
          upvotes: res.data.upvotes,
          downvotes: res.data.downvotes,
          hasUpvoted: res.data.hasUpvoted,
          hasDownvoted: res.data.hasDownvoted
        });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to vote');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await API.post(`/posts/${postId}/comment`, { text: comment });
      setComment('');
      loadPost();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Post not found</p>
          <button onClick={() => navigate('/feed')} className="mt-4 text-blue-500 hover:underline">
            Go back to feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-500 hover:underline flex items-center gap-1">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="bg-white rounded-lg shadow">
        {/* Post Header */}
        <div className="p-4 flex items-center border-b">
          <img
            onClick={() => navigate(`/profile/${post.user?.username}`)}
            src={post.user?.avatar || '/placeholder-avatar.png'}
            className="w-12 h-12 rounded-full cursor-pointer"
            alt={post.user?.username || 'avatar'}
          />
          <div className="ml-3 flex-1">
            <div 
              onClick={() => navigate(`/profile/${post.user?.username}`)}
              className="font-semibold cursor-pointer hover:underline"
            >
              {post.user?.username}
            </div>
            <div className="text-sm text-gray-600">
              {post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
            </div>
          </div>
          {post.project && (
            <button
              onClick={() => navigate(`/project/${post.project._id}`)}
              className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100"
            >
              {post.project.title}
            </button>
          )}
        </div>

        {/* Title */}
        {post.title && (
          <div className="px-4 py-3 border-b">
            <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
          </div>
        )}

        {/* Media Display */}
        <MediaCarousel media={post.media && post.media.length > 0 ? post.media : post.mediaUrl} />

        {/* Vote Buttons */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleVote('upvote')}
                className={`p-2 rounded-md flex items-center gap-1 transition-colors ${
                  voteStats.hasUpvoted ? 'bg-green-500 text-white' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20V4m0 0l-7 7m7-7l7 7" />
                </svg>
                <span>{voteStats.upvotes}</span>
              </button>

              <button
                onClick={() => handleVote('downvote')}
                className={`p-2 rounded-md flex items-center gap-1 transition-colors ${
                  voteStats.hasDownvoted ? 'bg-red-500 text-white' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4v16m0 0l7-7m-7 7l-7-7" />
                </svg>
                <span>{voteStats.downvotes}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content with Editor.js Blocks */}
        {post.caption && (
          <div className="p-4 border-b">
            <div className="mb-2">
              <span 
                onClick={() => navigate(`/profile/${post.user?.username}`)}
                className="font-semibold cursor-pointer hover:underline"
              >
                {post.user?.username}
              </span>
            </div>
            <EditorJSRenderer data={typeof post.caption === 'string' ? JSON.parse(post.caption) : post.caption} />
          </div>
        )}

        {/* Comments Section */}
        <div className="p-4">
          <h3 className="font-semibold mb-4">Comments</h3>
          <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((c, idx) => (
                <div key={idx} className="flex gap-3">
                  <img
                    src={c.user?.avatar || '/placeholder-avatar.png'}
                    className="w-8 h-8 rounded-full"
                    alt={c.user?.username}
                  />
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span
                        onClick={() => navigate(`/profile/${c.user?.username}`)}
                        className="font-semibold cursor-pointer hover:underline text-sm"
                      >
                        {c.user?.username}
                      </span>
                      <p className="text-sm text-gray-800 mt-1">{c.text}</p>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 ml-3">
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
            )}
          </div>

          {/* Comment Form */}
          {currentUser && (
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a comment..."
              />
              <button
                type="submit"
                disabled={!comment.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
