import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import API from '../lib/api'
import PostCard from '../components/PostCard'
import resolveMediaUrl from '../lib/media'

export default function Profile(){
  const { username } = useParams()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])

  useEffect(()=>{ load() }, [username])

  async function load(){
    try{
      const res = await API.get(`/users/${username}`)
      setUser(res.data.user)
      // get user's posts
      const postsRes = await API.get('/posts')
      setPosts(postsRes.data.posts.filter(p => p.user && p.user.username === username))
    }catch(err){ console.error(err) }
  }

  if (!user) return <div>Loading...</div>

  return (
    <div>
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex items-center">
          <img src={user.avatar || '/placeholder-avatar.png'} alt="avatar" className="w-20 h-20 rounded-full mr-4" />
          <div>
            <h2 className="text-xl font-semibold">{user.username}</h2>
            <div className="text-sm text-gray-600">{user.name}</div>
            <div className="mt-2"><button className="px-3 py-1 bg-blue-500 text-white rounded">Follow</button></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {posts.map(p => (
          <img key={p._id} src={resolveMediaUrl(p.mediaUrl)} alt="post" className="w-full h-32 object-cover" />
        ))}
      </div>
    </div>
  )
}
