import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProjectGrid({ projects }) {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
                <div
                    key={project._id}
                    onClick={() => navigate(`/project/${project._id}`)}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                    {/* Project Cover Image */}
                    <div className="aspect-video bg-gray-100 relative">
                        {project.coverImage ? (
                            <img
                                src={project.coverImage}
                                alt={project.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M13.5 21v-7.5a.75.75 0 01.75-.75h6.75a.75.75 0 01.75.75v7.5a.75.75 0 01-.75.75h-6.75a.75.75 0 01-.75-.75zM4.5 3h15a1.5 1.5 0 011.5 1.5v3.75a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V4.5A1.5 1.5 0 014.5 3z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Project Info */}
                    <div className="p-4">
                        <div className="mb-2">
                            <h3 className="font-semibold text-lg truncate">{project.title}</h3>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {project.description || 'No description provided'}
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                                {project.postCount || 0} posts
                            </div>
                            <div>{new Date(project.updatedAt).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}