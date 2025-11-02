import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../lib/api';

export default function TrendingProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTrendingProjects();
  }, []);

  async function loadTrendingProjects() {
    try {
      const res = await API.get('/projects/trending');
      console.log('Trending projects response:', res.data);
      setProjects(res.data.projects || []); // Access the projects array from response
    } catch (err) {
      console.error('Failed to load trending projects:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="bg-orange-100 px-4 py-3 rounded-t-lg -mx-4 -mt-4 mb-4">
          <h2 className="text-sm font-semibold text-gray-800">Trending Projects</h2>
        </div>
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="bg-orange-100 px-4 py-3 rounded-t-lg">
        <h2 className="text-sm font-semibold text-gray-800">Trending Projects</h2>
      </div>
      <div className="p-4">
        {projects.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">
            No trending projects yet
          </div>
        ) : (
          <ol className="space-y-3">
            {projects.map((project, index) => (
              <li 
                key={project._id}
                className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={() => navigate(`/project/${project._id}`)}
              >
                <span className="text-sm font-medium text-gray-600 w-6 mt-0.5">
                  {index + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {project.title}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <span>• by {project.user?.username}</span>
                  </div>
                </div>
                <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0">
                  {project.score || 0}
                  <span className="text-orange-500">🔥</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
