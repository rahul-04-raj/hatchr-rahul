import React, { useState, useEffect } from 'react';
import API from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function FollowersModal({ userId, type, onClose }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const nav = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, [userId, type]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const endpoint = type === 'followers' ? `/users/${userId}/followers` : `/users/${userId}/following`;
            const res = await API.get(endpoint);
            if (res.data.success) {
                setUsers(res.data[type] || []);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (username) => {
        onClose();
        nav(`/profile/${username}`);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {type === 'followers' ? 'Followers' : 'Following'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* User List */}
                <div className="overflow-y-auto flex-1 p-4">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No {type} yet
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {users.map((user) => (
                                <div
                                    key={user._id}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                                    onClick={() => handleUserClick(user.username)}
                                >
                                    <img
                                        src={user.avatar || '/placeholder-avatar.png'}
                                        alt={user.username}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-900 dark:text-white truncate">
                                            {user.name}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            @{user.username}
                                        </div>
                                        {user.bio && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                                {user.bio}
                                            </div>
                                        )}
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
