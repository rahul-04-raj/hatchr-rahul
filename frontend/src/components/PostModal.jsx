import React, { useState } from 'react'
import API from '../lib/api'

export default function PostModal({ onClose, onPosted }){
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e){
    e.preventDefault()
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append('media', file)
    fd.append('caption', caption)
    try{
      await API.post('/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onPosted && onPosted()
      onClose()
    }catch(err){
      console.error(err)
      alert(err.response?.data?.message || 'Upload failed')
    }finally{ setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose}></div>
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl">
          <div className="border-b px-4 py-3">
            <h3 className="text-lg font-semibold" id="modal-title">Create Post</h3>
          </div>
          <form onSubmit={submit} className="p-4">
            <div className="mb-4">
              <input 
                type="file" 
                accept="image/*,video/*" 
                onChange={e=>setFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <textarea 
              className="w-full border rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Write a caption..." 
              value={caption} 
              onChange={e=>setCaption(e.target.value)} 
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-md">
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Posting...' : 'Share'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
