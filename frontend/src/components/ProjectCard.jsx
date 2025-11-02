import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/project/${project._id}`)}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Project Cover Image */}
      <div 
        className="w-full bg-gray-200 relative overflow-hidden"
        style={{ height: '200px', flexShrink: 0 }}
      >
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-orange-50 to-yellow-50">
            <svg className="w-20 h-20 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
        )}
        
        {/* Post Count Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
          {project.posts?.length || 0} {project.posts?.length === 1 ? 'post' : 'posts'}
        </div>
      </div>

      {/* Project Info */}
      <div className="p-4 flex-grow flex flex-col">
        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2" style={{ minHeight: '3.5rem' }}>
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow" style={{ minHeight: '2.5rem' }}>
          {project.description || 'No description'}
        </p>

        {/* Category Badge */}
        {project.category && (
          <div className="mt-auto">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
              {project.category}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
