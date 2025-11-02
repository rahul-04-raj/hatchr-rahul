import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import API from '../lib/api';
import EditProfileModal from '../components/EditProfileModal';
import ProjectCard from '../components/ProjectCard';
import { useAuth } from '../store/useAuth';
import { Twitter, Linkedin, Instagram } from 'lucide-react';
import Toast from '../components/Toast';

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [toast, setToast] = useState(null);
  const currentUser = useAuth(state => state.user);

  useEffect(() => {
    loadProfile();

    // Show toast if navigation state has a message
    if (location.state?.message) {
      setToast({ message: location.state.message, type: 'success' });
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [userRes, projectsRes] = await Promise.all([
        API.get(`/users/${username}`),
        API.get(`/projects/user/${username}`)
      ]);

      setUser(userRes.data.user);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const isOwnProfile = currentUser && (currentUser._id === user?._id || currentUser.username === user?.username);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div style={{ width: '100%', boxSizing: 'border-box', padding: '2rem 1rem' }}>
          <div className="animate-pulse" style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', width: '100%', minWidth: 0 }}>
            <div style={{ minWidth: '340px', maxWidth: '400px', flexShrink: 0 }}>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
            <div style={{ flexGrow: 1, width: '100%', minWidth: 0 }}>
              <div className="h-12 bg-gray-200 rounded-lg mb-8 w-80"></div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '2rem',
                width: '100%'
              }}>
                <div className="h-96 bg-gray-200 rounded-lg"></div>
                <div className="h-96 bg-gray-200 rounded-lg"></div>
                <div className="h-96 bg-gray-200 rounded-lg"></div>
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{ width: '100%', boxSizing: 'border-box', padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', width: '100%', minWidth: 0 }}>
          {/* Left Sidebar - User Profile */}
          <div style={{ minWidth: '340px', maxWidth: '400px', flexShrink: 0 }}>
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Username Badge */}
              <div className="bg-gray-100 rounded-lg px-4 py-2 text-center mb-4">
                <span className="text-sm text-gray-600">{user.username}</span>
              </div>

              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <img
                  src={user.avatar && user.avatar.trim() !== ''
                    ? user.avatar
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&size=128&background=fb923c&color=fff`
                  }
                  alt={user.username}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                  onError={(e) => {
                    console.error('Avatar failed to load:', e.target.src);
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&size=128&background=fb923c&color=fff`;
                  }}
                />
              </div>

              {/* Display Name */}
              <h1 className="text-center text-xl font-semibold mb-6">
                {user.name || 'Display Name'}
              </h1>

              {/* Stats */}
              <div className="flex justify-around mb-6 pb-6 border-b border-gray-200">
                <div className="text-center">
                  <div className="text-2xl mb-1">👑</div>
                  <div className="font-bold text-lg">{projects.length}</div>
                  <div className="text-xs text-gray-500">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="font-bold text-lg">{user.hatchPoints || 0}</div>
                  <div className="text-xs text-gray-500">Hatch Points</div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
                {user.bio || 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Consectetur adipiscing elit quisque faucibus ex sapien vitae.'}
              </p>

              {/* Social Links */}
              <div className="flex justify-center gap-4 mb-6">
                {user.socialLinks?.twitter && (
                  <a
                    href={user.socialLinks.twitter.startsWith('http') ? user.socialLinks.twitter : `https://twitter.com/${user.socialLinks.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-500 transition-colors"
                  >
                    <Twitter className="w-6 h-6" />
                  </a>
                )}
                {user.socialLinks?.linkedin && (
                  <a
                    href={user.socialLinks.linkedin.startsWith('http') ? user.socialLinks.linkedin : `https://linkedin.com/in/${user.socialLinks.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Linkedin className="w-6 h-6" />
                  </a>
                )}
                {user.socialLinks?.instagram && (
                  <a
                    href={user.socialLinks.instagram.startsWith('http') ? user.socialLinks.instagram : `https://instagram.com/${user.socialLinks.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-500 hover:text-pink-600 transition-colors"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                )}
              </div>

              {/* Edit Button */}
              {isOwnProfile && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="w-full bg-orange-400 hover:bg-orange-500 text-white py-2 px-4 rounded-lg transition-colors font-medium"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Right Content - Key Hatched Projects */}
          <div style={{ flexGrow: 1, width: '100%', minWidth: 0 }}>
            <h2 className="text-3xl font-bold mb-8">Key Hatched Projects</h2>

            {projects.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500">No projects yet</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '2rem',
                width: '100%',
                alignItems: 'stretch'
              }}>
                {projects.map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
