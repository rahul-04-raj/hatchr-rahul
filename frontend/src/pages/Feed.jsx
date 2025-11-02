import React, { useEffect, useState } from 'react'
import API from '../lib/api'
import PostCard from '../components/PostCard'
import PostModal from '../components/PostModal'

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await API.get('/posts')
      setPosts(res.data.posts || [])
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }


  async function onComment(postId, text) {
    try {
      await API.post(`/posts/${postId}/comment`, { text })
      load()
    } catch (err) { console.error(err) }
  }

  const [showModal, setShowModal] = useState(false)
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')

  async function createPost(e) {
    e.preventDefault()
    if (!file) return
    const fd = new FormData()
    fd.append('media', file)
    fd.append('caption', caption)
    try {
      await API.post('/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setFile(null); setCaption('')
      load()
    } catch (err) { console.error(err) }
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="mt-6">
        <div className="mb-4 flex justify-end">
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Create Post</button>
          {showModal && <PostModal onPosted={load} onClose={() => setShowModal(false)} />}
        </div>

        {loading ? <div>Loading...</div> : posts.map(p => (
          <PostCard key={p._id} post={p} onRefresh={load} />
        ))}
      </div>
    </div>
  )
}
