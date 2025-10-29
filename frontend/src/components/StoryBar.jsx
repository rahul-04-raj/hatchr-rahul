import React, { useState, useEffect } from 'react'
import API from '../lib/api'
import resolveMediaUrl from '../lib/media'
import { useImage } from '../hooks/useImage'

const StoryImage = ({ story }) => {
  const { loaded, error, imgSrc } = useImage(resolveMediaUrl(story.mediaUrl))
  
  return (
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 p-[2px]">
        <div className="w-full h-full bg-white rounded-full p-[2px]">
          {!loaded && !error && (
            <div className="w-full h-full rounded-full bg-gray-100 animate-pulse" />
          )}
          {error && (
            <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-xs text-gray-400">Error</span>
            </div>
          )}
          <img
            src={imgSrc}
            alt={`${story.user?.username}'s story`}
            className={`w-full h-full rounded-full object-cover ${!loaded ? 'opacity-0' : ''}`}
          />
        </div>
      </div>
    </div>
  )
}

export default function StoryBar(){
  const [stories, setStories] = useState([])
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(()=>{ load() }, [])

  async function load(){
    try{
      const res = await API.get('/posts/stories')
      setStories(res.data.stories || [])
    }catch(err){ console.error(err) }
  }

  async function uploadStory(e){
    e.preventDefault()
    if (!file) return
    setUploading(true)
    const fd = new FormData();
    fd.append('media', file)
    fd.append('isStory', 'true')
    try{
      await API.post('/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setFile(null)
      load()
    }catch(err){ 
      console.error(err)
      alert(err.response?.data?.message || 'Failed to upload story')
    }finally{
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="flex gap-4 mb-4 overflow-x-auto px-2 py-4 -mx-2">
        {stories.map(s => (
          <div key={s._id} className="flex flex-col items-center flex-shrink-0">
            <StoryImage story={s} />
            <div className="text-xs mt-2 text-gray-600">{s.user?.username}</div>
          </div>
        ))}
      </div>

      <form onSubmit={uploadStory} className="flex items-center gap-2">
        <input 
          type="file" 
          accept="image/*,video/*" 
          onChange={e=>setFile(e.target.files[0])} 
          disabled={uploading}
          className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <button 
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50" 
          disabled={uploading || !file}
        >
          {uploading ? 'Uploading...' : 'Add Story'}
        </button>
      </form>
    </div>
  )
}
