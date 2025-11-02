import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../lib/api'
import MultiMediaUpload from './MultiMediaUpload'
import ProjectModal from './ProjectModal'
import EditorJS from './EditorJS'

const postTypes = ['update', 'announcement', 'milestone', 'hatching'];

export default function PostModal({ onClose, onPosted, projectId = null, forcePostType = null, hatchingMode = false }) {
  const navigate = useNavigate()
  const [files, setFiles] = useState([])
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState(null)
  const [loading, setLoading] = useState(false)
  const editorRef = useRef(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(projectId || '')
  const [postType, setPostType] = useState(forcePostType || postTypes[0])
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(!projectId)
  const hasProjectId = !!projectId // Track if projectId was provided

  useEffect(() => {
    if (!projectId) {
      fetchProjects()
    } else {
      setLoadingProjects(false)
    }
  }, [])

  async function fetchProjects() {
    try {
      const res = await API.get('/projects/my')
      setProjects(res.data)
      if (res.data.length > 0) {
        setSelectedProject(res.data[0]._id)
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err)
    } finally {
      setLoadingProjects(false)
    }
  }

  async function submit(e) {
    e.preventDefault()
    if (!title.trim()) {
      alert('Please enter a title')
      return
    }
    if (!files || files.length === 0) {
      alert('Please select at least one media file')
      return
    }
    setLoading(true)
    setUploadProgress(0)

    if (!selectedProject) {
      alert('Please select or create a project first')
      setLoading(false)
      return
    }

    const fd = new FormData()
    // Append all files
    files.forEach(file => {
      fd.append('media', file)
    })
    fd.append('title', title.trim())
    // Ensure caption is a valid JSON string
    const captionData = caption || { blocks: [], version: "2.28.0" };
    fd.append('caption', JSON.stringify(captionData))
    fd.append('projectId', selectedProject)
    fd.append('type', postType)

    try {
      const response = await API.post('/posts', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // 60 second timeout
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100
          setUploadProgress(Math.round(progress))
        }
      })

      // Show points notification if available
      if (response.data.pointsAwarded) {
        console.log(`+${response.data.pointsAwarded} Hatch Points!`)
      }

      setTitle('')
      setCaption(null)
      setFiles([])

      // Close modal first
      onClose()

      // Call onPosted callback if provided (this closes parent modals)
      if (onPosted) {
        onPosted()
      }

      // Navigate to feed with success message after cleanup
      setTimeout(() => {
        navigate('/feed', {
          state: { message: hatchingMode ? 'Project hatched successfully! 🐣' : 'Post created successfully! 🎉' }
        })
      }, 150)
    } catch (err) {
      console.error('Upload error:', err)
      const errorMessage = err.code === 'ECONNABORTED'
        ? 'Upload timed out. Please try with fewer or smaller files.'
        : err.response?.data?.message || 'Upload failed. Please try again.'
      alert(errorMessage)
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={hatchingMode ? null : onClose}></div>
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl">
          <div className="border-b px-4 py-3 flex items-center justify-between bg-gradient-to-r from-orange-50 to-yellow-50">
            <div>
              <h3 className="text-lg font-semibold" id="modal-title">
                {hatchingMode ? '🐣 Hatch Your Project!' : 'Create Post'}
              </h3>
              {hatchingMode && (
                <p className="text-sm text-gray-600 mt-1">
                  Introduce your project to the community
                </p>
              )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!hatchingMode && showProjectModal && (
            <ProjectModal
              isOpen={showProjectModal}
              onClose={() => setShowProjectModal(false)}
              onSuccess={project => {
                fetchProjects()
                setSelectedProject(project._id)
                setShowProjectModal(false)
              }}
            />
          )}

          <form onSubmit={submit} className="p-4">
            {!hatchingMode && !hasProjectId && (
              <>
                {loadingProjects ? (
                  <div className="mb-4 text-center">Loading projects...</div>
                ) : projects.length === 0 ? (
                  <div className="mb-4 text-center">
                    <p className="text-gray-600 mb-2">No projects yet</p>
                    <button
                      type="button"
                      onClick={() => setShowProjectModal(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Create Your First Project
                    </button>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Select Project
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowProjectModal(true)}
                        className="text-sm text-blue-500 hover:text-blue-600"
                      >
                        Create New Project
                      </button>
                    </div>
                    <select
                      value={selectedProject}
                      onChange={e => setSelectedProject(e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                      required
                    >
                      {projects.map(project => (
                        <option key={project._id} value={project._id}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            <MultiMediaUpload
              onFilesSelect={setFiles}
              maxFiles={10}
            />

            <div className="mb-4 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Give your post a title..."
                disabled={loading}
                required
              />
            </div>

            {!hatchingMode && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Type
                </label>
                <select
                  value={postType}
                  onChange={e => setPostType(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {postTypes
                    .filter(type => {
                      // Hide 'hatching' option if projectId is provided (updates to existing project)
                      if (type === 'hatching' && hasProjectId) {
                        return false;
                      }
                      return true;
                    })
                    .map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <EditorJS
                data={caption}
                onChange={setCaption}
                editorRef={editorRef}
              />
              <div className="mt-1 text-xs text-gray-500">
                Use the toolbar to format your content with blocks
              </div>
            </div>

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
                disabled={loading || files.length === 0 || !title.trim()}
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