import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { postService } from '../../services/postService';
import PostCard from '../posts/PostCard';
import UserCard from './UserCard';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    loadUserProfile();
  }, [username]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, postsRes] = await Promise.all([
        userService.getUserProfile(username),
        postService.getPosts(0, 100) // Load all posts for now
      ]);

      setProfileUser(profileRes.data);
      // Filter posts for this user (backend should handle this)
      const userPosts = postsRes.data.posts?.filter(post => post.user.username === username) || [];
      setPosts(userPosts);

      // Load followers and following if user is not private or is followed
      if (!profileRes.data.is_private || 
          profileRes.data.following_status === 'following' ||
          profileRes.data.following_status === 'requested' ||
          isOwnProfile) {
        const [followersRes, followingRes] = await Promise.all([
          userService.getFollowers(username),
          userService.getFollowing()
        ]);
        
        setFollowers(followersRes.data.followers || []);
        setFollowing(followingRes.data.following || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load profile');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  const handleFollowChange = () => {
    loadUserProfile(); // Refresh profile data
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!profileUser) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
        <p className="text-gray-600 mt-2">The user you're looking for doesn't exist.</p>
      </div>
    );
  }

  const shouldShowPosts = !profileUser.is_private || 
                         profileUser.following_status === 'following' ||
                         profileUser.following_status === 'requested' ||
                         isOwnProfile;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-white font-medium text-3xl">
              {profileUser.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profileUser.full_name}</h1>
              <p className="text-gray-600">@{profileUser.username}</p>
              <p className="text-gray-800 mt-2">{profileUser.bio}</p>
              
              <div className="flex space-x-6 mt-4">
                <div>
                  <span className="font-bold">{profileUser.posts_count}</span>
                  <span className="text-gray-600 ml-1">posts</span>
                </div>
                <div>
                  <span className="font-bold">{profileUser.followers_count}</span>
                  <span className="text-gray-600 ml-1">followers</span>
                </div>
                <div>
                  <span className="font-bold">{profileUser.following_count}</span>
                  <span className="text-gray-600 ml-1">following</span>
                </div>
              </div>
            </div>
          </div>

          {!isOwnProfile && (
            <UserCard 
              user={profileUser} 
              showFollowButton={true}
              onFollowChange={handleFollowChange}
            />
          )}
        </div>

        {profileUser.is_private && profileUser.following_status === 'not-following' && !isOwnProfile && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium">Private Account</p>
            <p className="text-yellow-600 text-sm mt-1">
              This account is private. Follow to see their posts.
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['posts', 'followers', 'following'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'posts' && (
          <div>
            {shouldShowPosts ? (
              posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onDelete={handlePostDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No posts yet.</p>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">This account is private.</p>
                <p className="text-gray-500 text-sm mt-1">
                  Follow to see their posts.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="space-y-4">
            {followers.length > 0 ? (
              followers.map((follower) => (
                <UserCard key={follower.id} user={follower} showFollowButton={false} />
              ))
            ) : (
              <p className="text-gray-600 text-center py-8">No followers yet.</p>
            )}
          </div>
        )}

        {activeTab === 'following' && (
          <div className="space-y-4">
            {following.length > 0 ? (
              following.map((followed) => (
                <UserCard key={followed.id} user={followed} showFollowButton={false} />
              ))
            ) : (
              <p className="text-gray-600 text-center py-8">Not following anyone yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;