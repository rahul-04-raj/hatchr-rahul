import React, { useState } from 'react'
import API from '../lib/api'
import ImageUpload from './ImageUpload'

export default function PostModal({ onClose, onPosted }){
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  async function submit(e){
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setUploadProgress(0)
    
    const fd = new FormData()
    fd.append('media', file)
    fd.append('caption', caption)
    
    try{
      await API.post('/posts', fd, { 
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100
          setUploadProgress(Math.round(progress))
        }
      })
      onPosted && onPosted()
      onClose()
    }catch(err){
      console.error(err)
      alert(err.response?.data?.message || 'Upload failed')
    }finally{ 
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose}></div>
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl">
          <div className="border-b px-4 py-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold" id="modal-title">Create Post</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={submit} className="p-4">
            <ImageUpload 
              onFileSelect={setFile} 
              className="mb-4"
            />
            
            <textarea 
              className="w-full border rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Write a caption..." 
              value={caption} 
              onChange={e=>setCaption(e.target.value)}
              disabled={loading}
            />

            {loading && uploadProgress > 0 && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 text-center mt-1">Uploading: {uploadProgress}%</p>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-md"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md disabled:opacity-50"
                disabled={loading || !file}
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