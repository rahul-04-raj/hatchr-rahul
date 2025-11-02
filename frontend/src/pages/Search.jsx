import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../lib/api';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  const [results, setResults] = useState({ all: [], projects: [], posts: [], users: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'projects', label: 'Projects' },
    { id: 'posts', label: 'Posts' },
    { id: 'users', label: 'Users' }
  ];

  useEffect(() => {
    const q = searchParams.get('q');
    const tab = searchParams.get('tab') || 'all';
    if (q) {
      setQuery(q);
      setActiveTab(tab);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery) {
      setResults({ all: [], projects: [], posts: [], users: [] });
      return;
    }

    setLoading(true);
    try {
      const [projectsRes, postsRes, usersRes] = await Promise.all([
        API.get('/projects/search', { params: { q: searchQuery } }),
        API.get('/posts/search', { params: { q: searchQuery } }),
        API.get('/users/search/all', { params: { q: searchQuery } })
      ]);

      const allResults = [
        ...projectsRes.data.map(item => ({ ...item, type: 'project' })),
        ...postsRes.data.map(item => ({ ...item, type: 'post' })),
        ...usersRes.data.map(item => ({ ...item, type: 'user' }))
      ];

      setResults({
        all: allResults,
        projects: projectsRes.data,
        posts: postsRes.data,
        users: usersRes.data
      });
    } catch (error) {
      console.error('Search error:', error);
      setResults({ all: [], projects: [], posts: [], users: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query, tab: activeTab });
    }
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (query) {
      setSearchParams({ q: query, tab: tabId });
    }
  };

  const getCurrentResults = () => {
    return results[activeTab] || [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, posts, and users..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Search
            </button>
          </form>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-6 py-2 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="max-w-3xl mx-auto p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Searching...</p>
          </div>
        ) : getCurrentResults().length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {getCurrentResults().length} result{getCurrentResults().length !== 1 ? 's' : ''} found
            </p>
            <div className="space-y-3">
              {getCurrentResults().map((item, idx) => {
                // Determine item type based on active tab or item.type property
                let itemType;
                if (activeTab === 'all') {
                  itemType = item.type;
                } else if (activeTab === 'projects') {
                  itemType = 'project';
                } else if (activeTab === 'posts') {
                  itemType = 'post';
                } else if (activeTab === 'users') {
                  itemType = 'user';
                }
                
                if (itemType === 'project') {
                  return (
                    <div
                      key={item._id}
                      onClick={() => navigate(`/project/${item._id}`)}
                      className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4">
                        {item.coverImage && (
                          <img
                            src={item.coverImage}
                            alt={item.title}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{item.title}</h3>
                              {item.description && (
                                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-2">
                              {item.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {item.user?.avatar && (
                              <img
                                src={item.user.avatar}
                                alt={item.user.username}
                                className="w-5 h-5 rounded-full"
                              />
                            )}
                            <span className="text-sm text-gray-700">
                              @{item.user?.username}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                if (itemType === 'post') {
                  return (
                    <div
                      key={item._id}
                      onClick={() => navigate(`/post/${item._id}`)}
                      className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4">
                        {item.media && item.media[0] && (
                          <img
                            src={item.media[0].url}
                            alt="Post"
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {item.user?.avatar && (
                              <img
                                src={item.user.avatar}
                                alt={item.user.username}
                                className="w-6 h-6 rounded-full"
                              />
                            )}
                            <span className="font-semibold text-sm">
                              @{item.user?.username}
                            </span>
                            {item.user?.name && (
                              <span className="text-gray-600 text-sm">
                                {item.user.name}
                              </span>
                            )}
                          </div>
                          {item.title && (
                            <h3 className="font-bold text-gray-900 mb-1">
                              {item.title}
                            </h3>
                          )}
                          {item.caption && (
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {item.caption}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>↑ {item.upvoteCount || 0}</span>
                            <span>💬 {item.comments?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                if (itemType === 'user') {
                  return (
                    <div
                      key={item._id}
                      onClick={() => navigate(`/profile/${item.username}`)}
                      className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.username}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 text-xl">
                              {item.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-gray-600 text-sm">@{item.username}</p>
                          {item.bio && (
                            <p className="text-gray-600 text-sm mt-1 line-clamp-1">
                              {item.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        ) : query ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="mt-4 text-gray-600">No results found</p>
            <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="mt-4 text-gray-600">Search for anything</p>
            <p className="text-sm text-gray-500 mt-1">
              Find projects, posts, and users
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
