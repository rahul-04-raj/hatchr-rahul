import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../lib/api'
import resolveMediaUrl from '../lib/media'
import { useImage } from '../hooks/useImage'
import { useAuth } from '../store/useAuth'

export default function PostCard({ post, onRefresh }){
  const navigate = useNavigate()
  const currentUser = useAuth(state => state.user)
  const [comment, setComment] = useState('')
  const [loadingLike, setLoadingLike] = useState(false)
  const [loadingVote, setLoadingVote] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [voteStats, setVoteStats] = useState({
    upvotes: post.upvotes?.length || 0,
    downvotes: post.downvotes?.length || 0,
    hasUpvoted: currentUser ? post.upvotes?.some(id => id.toString() === currentUser._id) : false,
    hasDownvoted: currentUser ? post.downvotes?.some(id => id.toString() === currentUser._id) : false
  })
  const { loaded: mediaLoaded, error: mediaError, imgSrc } = useImage(resolveMediaUrl(post.mediaUrl))
  const { loaded: avatarLoaded, imgSrc: avatarSrc } = useImage(post.user?.avatar || '/placeholder-avatar.png')

  const goToProfile = (e) => {
    e.preventDefault()
    if (post.user?.username) {
      navigate(`/profile/${post.user.username}`)
    }
  }

  const handleVote = async (type) => {
    if (!currentUser) {
      alert('Please login to vote')
      return
    }
    if (loadingVote) return
    setLoadingVote(true)
    try {
      const res = await API.post(`/posts/${post._id}/${type}`)
      if (res.data.success) {
        setVoteStats(prev => ({
          upvotes: res.data.upvotes,
          downvotes: res.data.downvotes,
          hasUpvoted: type === 'upvote' ? !prev.hasUpvoted : false,
          hasDownvoted: type === 'downvote' ? !prev.hasDownvoted : false
        }))
      }
    } catch (err) {
      console.error(err)
      if (err.response?.status === 404) {
        alert('This post no longer exists')
      } else {
        alert('Failed to vote. Please try again.')
      }
    } finally {
      setLoadingVote(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    
    setLoadingDelete(true)
    try {
      await API.delete(`/posts/${post._id}`)
      onRefresh && onRefresh()
    } catch (err) {
      console.error(err)
      alert('Failed to delete post')
    } finally {
      setLoadingDelete(false)
    }
  }

  return (
    <div className="bg-white rounded shadow mb-6">
      <div className="p-3 flex items-center">
        <img 
          onClick={goToProfile}
          src={avatarSrc} 
          className={`w-10 h-10 rounded-full mr-3 cursor-pointer ${!avatarLoaded ? 'animate-pulse bg-gray-200' : ''}`}
          alt={post.user?.username || 'avatar'}
        />
        <div className="flex-1">
          <div onClick={goToProfile} className="font-semibold cursor-pointer hover:underline">{post.user?.username}</div>
          <div className="text-sm text-gray-600">{post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}</div>
        </div>
        <div className="text-gray-500">⋯</div>
      </div>

      <div className="w-full bg-black relative aspect-[4/3] flex items-center justify-center">
        {!mediaLoaded && !mediaError && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}
        {mediaError && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400">
            Unable to load image
          </div>
        )}
        <img 
          src={imgSrc} 
          alt={post.caption || 'post'} 
          className={`w-full h-full object-contain ${!mediaLoaded ? 'opacity-0' : ''}`}
          onLoad={() => console.log('Image loaded:', imgSrc)}
          onError={() => console.log('Image error:', imgSrc)}
        />
      </div>

      <div className="p-3">
          <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={async ()=>{ 
                setLoadingLike(true); 
                try{ 
                  await API.post(`/posts/${post._id}/like`); 
                  onRefresh && onRefresh() 
                }catch(e){
                  console.error(e)
                } finally{ 
                  setLoadingLike(false) 
                } 
              }} 
              className="text-2xl" 
              disabled={loadingLike}
            >
              ❤️
            </button>
            
            {/* Vote buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleVote('upvote')}
                disabled={loadingVote}
                className={`px-2 py-1 rounded ${
                  voteStats.hasUpvoted ? 'bg-green-500 text-white' : 'hover:bg-gray-100'
                }`}
              >
                ⬆️ {voteStats.upvotes}
              </button>
              
              <button
                onClick={() => handleVote('downvote')}
                disabled={loadingVote}
                className={`px-2 py-1 rounded ${
                  voteStats.hasDownvoted ? 'bg-red-500 text-white' : 'hover:bg-gray-100'
                }`}
              >
                ⬇️ {voteStats.downvotes}
              </button>
            </div>

            <button className="text-2xl">💬</button>
            <button className="text-2xl">✈️</button>
            
            {/* Delete button - only show for post owner */}
            {currentUser && post.user && currentUser._id === post.user._id && (
              <button
                onClick={handleDelete}
                disabled={loadingDelete}
                className="text-red-500 hover:text-red-600 text-sm font-medium"
              >
                {loadingDelete ? 'Deleting...' : '🗑️ Delete'}
              </button>
            )}
          </div>
          <div className="text-sm text-gray-600">{post.likes?.length || 0} likes</div>
        </div>        <div className="mb-2"><span onClick={goToProfile} className="font-semibold cursor-pointer hover:underline">{post.user?.username}</span> {post.caption}</div>

        <div>
          {post.comments && post.comments.map((c, idx) => (
            <div key={idx} className="text-sm text-gray-700"><span className="font-semibold">{c.user?.username}</span> {c.text}</div>
          ))}
        </div>

        <form onSubmit={async e=>{ e.preventDefault(); if(!comment) return; try{ await API.post(`/posts/${post._id}/comment`, { text: comment }); setComment(''); onRefresh && onRefresh() }catch(e){ console.error(e) } }} className="mt-2 flex gap-2">
          <input value={comment} onChange={e=>setComment(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Add a comment..." />
          <button className="px-3 bg-blue-500 text-white rounded">Post</button>
        </form>
      </div>
    </div>
  )
}
