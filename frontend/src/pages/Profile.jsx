import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import API from '../lib/api'
import resolveMediaUrl from '../lib/media'
import { useImage } from '../hooks/useImage'
import PostView from '../components/PostView'
import { useAuth } from '../store/useAuth'

const ProfileImage = ({ user }) => {
  const { loaded, imgSrc } = useImage(user?.avatar || '/placeholder-avatar.png')
  return (
    <div className="w-20 h-20 relative">
      {!loaded ? (
        <div className="w-20 h-20 rounded-full bg-gray-100 animate-pulse" />
      ) : (
        <img src={imgSrc} alt={user?.username || 'avatar'} className="w-20 h-20 rounded-full object-cover" />
      )}
    </div>
  )
}

const MediaGridItem = ({ post, onClick }) => {
  const { loaded, error, imgSrc } = useImage(resolveMediaUrl(post.mediaUrl))
  return (
    <div 
      className="aspect-square relative group cursor-pointer bg-black"
      onClick={onClick}
    >
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400">
          Unable to load
        </div>
      )}
      <img 
        src={imgSrc} 
        alt={post.caption || 'post'} 
        className={`w-full h-full object-cover ${!loaded ? 'opacity-0' : ''}`}
      />
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
        <div className="flex items-center text-white gap-6">
          <span className="flex items-center gap-1">
            <span>❤️</span> {post.likes?.length || 0}
          </span>
          <span className="flex items-center gap-1">
            <span>💬</span> {post.comments?.length || 0}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Profile(){
  const { username } = useParams()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [selectedPost, setSelectedPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const currentUser = useAuth(state => state.user)
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 })

  useEffect(()=>{ load() }, [username])

  async function load(){
    setLoading(true)
    try{
      const res = await API.get(`/users/${username}`)
      const userData = res.data.user
      setUser(userData)
      
      // Check if current user is following this profile
      if (currentUser && userData.followers) {
        const isCurrentlyFollowing = userData.followers.some(f => 
          f._id === currentUser._id || f === currentUser._id
        )
        setIsFollowing(isCurrentlyFollowing)
      }

      // get user's posts
      const postsRes = await API.get('/posts')
      const userPosts = postsRes.data.posts.filter(p => p.user && p.user.username === username)
      setPosts(userPosts)
      setStats({
        posts: userPosts.length,
        followers: userData.followers?.length || 0,
        following: userData.following?.length || 0
      })
    }catch(err){ 
      console.error(err)
    }finally{
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto p-4 animate-pulse">
      <div className="bg-white p-8 rounded shadow mb-8">
        <div className="flex items-start gap-8">
          <div className="w-20 h-20 rounded-full bg-gray-200" />
          <div className="flex-1">
            <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(n => (
          <div key={n} className="aspect-square bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  )

  if (!user) return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white p-8 rounded shadow text-center">
        User not found
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white p-8 rounded shadow mb-8">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          <ProfileImage user={user} />
          
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-2xl font-semibold">{user.username}</h1>
              {currentUser && currentUser.username !== user.username && (
                <button 
                  onClick={async () => {
                    setFollowLoading(true)
                    try {
                      const res = await API.post(`/users/follow/${user._id}`)
                      if (res.data.success) {
                        // Update following state based on API response
                        const newFollowingState = res.data.following;
                        setIsFollowing(newFollowingState);
                        
                        // Update follower count based on the action
                        const countChange = newFollowingState ? 1 : -1;
                        setStats(prev => ({
                          ...prev,
                          followers: Math.max(0, prev.followers + countChange)
                        }));

                        // Update user object to reflect new follower state
                        setUser(prev => {
                          const updatedFollowers = newFollowingState
                            ? [...(prev.followers || []), currentUser]
                            : (prev.followers || []).filter(f => f._id !== currentUser._id);
                          
                          return {
                            ...prev,
                            followers: updatedFollowers
                          };
                        });
                      }
                    } catch (err) {
                      console.error(err)
                    } finally {
                      setFollowLoading(false)
                    }
                  }}
                  disabled={followLoading}
                  className={`px-6 py-2 rounded-lg transition group relative ${
                    isFollowing
                      ? 'bg-gray-200 hover:bg-red-500 hover:text-white text-black'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {followLoading 
                    ? 'Loading...' 
                    : isFollowing
                      ? (
                        <>
                          <span className="block group-hover:hidden">Following</span>
                          <span className="hidden group-hover:block">Unfollow</span>
                        </>
                      )
                      : 'Follow'
                  }
                </button>
              )}
            </div>
            
            <div className="flex gap-8 mb-4">
              <div>
                <span className="font-semibold">{stats.posts}</span> posts
              </div>
              <div>
                <span className="font-semibold">{stats.followers}</span> followers
              </div>
              <div>
                <span className="font-semibold">{stats.following}</span> following
              </div>
            </div>

            <div>
              <div className="font-semibold">{user.name}</div>
              {user.bio && <div className="text-gray-600 mt-1">{user.bio}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {posts.map(post => (
          <MediaGridItem 
            key={post._id} 
            post={post} 
            onClick={() => setSelectedPost(post)} 
          />
        ))}
      </div>

      {selectedPost && (
        <PostView 
          post={selectedPost} 
          onClose={() => setSelectedPost(null)}
          onUpdate={() => {
            load() // Reload posts to get updated likes/comments
            setSelectedPost(null)
          }}
        />
      )}
    </div>
  )
}
