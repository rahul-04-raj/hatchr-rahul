import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../lib/api';

export default function TopInnovators() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTopUsers();
  }, []);

  async function loadTopUsers() {
    try {
      const res = await API.get('/users/top-innovators');
      console.log('Top innovators response:', res.data);
      setUsers(res.data.users || []); // Access the users array from response
    } catch (err) {
      console.error('Failed to load top innovators:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="bg-orange-100 px-4 py-3 rounded-t-lg -mx-4 -mt-4 mb-4">
          <h2 className="text-sm font-semibold text-gray-800">Top Innovators this week</h2>
        </div>
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="bg-orange-100 px-4 py-3 rounded-t-lg">
        <h2 className="text-sm font-semibold text-gray-800">Top Innovators this week</h2>
      </div>
      <div className="p-4">
        {users.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">
            No innovators yet
          </div>
        ) : (
          <ol className="space-y-3">
            {users.map((user, index) => (
              <li 
                key={user._id}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={() => navigate(`/profile/${user.username}`)}
              >
                <span className="text-sm font-medium text-gray-600 w-6">
                  {index + 1}.
                </span>
                <span className="flex-1 text-sm font-medium text-gray-800">
                  {user.username}
                </span>
                <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-semibold">
                  {user.hatchPoints || 0}
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
