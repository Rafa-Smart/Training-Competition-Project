import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI, postAPI } from '../api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { showAlert } from '../utils/alert';

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profileData = await userAPI.getUserDetail(username);
      setProfile(profileData);
      
      // Only load posts if user is public or we're following them
      if (!profileData.is_private || 
          profileData.following_status === 'following' || 
          profileData.is_your_account) {
        // Note: You might need to create a separate endpoint for user's posts
        // For now, we'll show a message
        setPosts([]);
      }

      // Load followers
      const followersData = await userAPI.getFollowers(username);
      setFollowers(followersData.followers);

    } catch (error) {
      console.error('Error loading profile:', error);
      if (error.response?.status === 404) {
        showAlert('error', 'User not found');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      await userAPI.followUser(username);
      loadProfile();
    } catch (error) {
      showAlert('error', 'Error', error.response?.data?.message);
    }
  };

  const handleUnfollow = async () => {
    try {
      await userAPI.unfollowUser(username);
      loadProfile();
    } catch (error) {
      showAlert('error', 'Error', error.response?.data?.message);
    }
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="error">Profile not found</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-info">
          <h2>{profile.full_name}</h2>
          <p className="username">@{profile.username}</p>
          <p className="bio">{profile.bio}</p>
          
          <div className="profile-stats">
            <div className="stat">
              <strong>{profile.posts_count}</strong>
              <span>Posts</span>
            </div>
            <div className="stat">
              <strong>{profile.followers_count}</strong>
              <span>Followers</span>
            </div>
            <div className="stat">
              <strong>{profile.following_count}</strong>
              <span>Following</span>
            </div>
          </div>
        </div>
        
        {!profile.is_your_account && (
          <div className="profile-actions">
            {profile.following_status === 'following' && (
              <button onClick={handleUnfollow} className="btn-unfollow">
                Unfollow
              </button>
            )}
            {profile.following_status === 'requested' && (
              <button className="btn-requested">Requested</button>
            )}
            {profile.following_status === 'not-following' && (
              <button onClick={handleFollow} className="btn-follow">
                Follow
              </button>
            )}
          </div>
        )}
      </div>

      <div className="profile-content">
        <h3>Posts</h3>
        
        {profile.is_private && profile.following_status === 'not-following' ? (
          <div className="private-account">
            <p>The account is private</p>
          </div>
        ) : posts.length === 0 ? (
          <p className="no-posts">No posts yet</p>
        ) : (
          <div className="posts-grid">
            {posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onDelete={handleDeletePost} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;