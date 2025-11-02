import React, { useEffect, useState } from 'react'
import API from '../lib/api'
import PostCard from '../components/PostCard'
import TopInnovators from '../components/TopInnovators'
import TrendingProjects from '../components/TrendingProjects'

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('best')

  useEffect(() => {
    load()
  }, [activeFilter])

  async function load() {
    setLoading(true)
    try {
      const res = await API.get(`/posts?sort=${activeFilter}`)
      setPosts(res.data.posts || [])
    } catch (err) {
      console.error(err)
    } finally { 
      setLoading(false) 
    }
  }

  const filters = [
    { id: 'best', label: 'Best' },
    { id: 'new', label: 'New' },
    { id: 'upvotes', label: 'Upvotes' },
    { id: 'rising', label: 'Rising' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Layout Grid - Three Columns with Fixed Widths for Perfect Centering */}
      <div 
        className="main-layout hidden lg:grid"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '300px minmax(550px, 700px) 300px',
          gap: '2rem',
          alignItems: 'flex-start',
          justifyContent: 'center',
          marginTop: '2rem',
          paddingBottom: '2rem'
        }}
      >
        {/* Left Sidebar - Top Innovators */}
        <div className="left-sidebar">
          <div className="sticky top-6">
            <TopInnovators />
          </div>
        </div>

        {/* Center Feed Container - Perfectly Centered */}
        <div className="feed-container">
          {/* Filter Tabs */}
          <div className="bg-orange-100 rounded-lg p-3 mb-6 shadow-sm">
            <div className="flex gap-2 flex-wrap">
              {filters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-orange-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Posts */}
          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No posts yet. Be the first to post!</p>
            </div>
          ) : (
            posts.map(p => (
              <PostCard key={p._id} post={p} onRefresh={load} />
            ))
          )}
        </div>

        {/* Right Sidebar - Trending Projects */}
        <div className="right-sidebar">
          <div className="sticky top-6">
            <TrendingProjects />
          </div>
        </div>
      </div>

      {/* Mobile View - Show only feed */}
      <div className="lg:hidden px-4 py-6">
        {/* Filter Tabs */}
        <div className="bg-orange-100 rounded-lg p-3 mb-6 shadow-sm">
          <div className="flex gap-2 flex-wrap">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === filter.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-orange-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No posts yet. Be the first to post!</p>
          </div>
        ) : (
          posts.map(p => (
            <PostCard key={p._id} post={p} onRefresh={load} />
          ))
        )}
      </div>
    </div>
  )
}
