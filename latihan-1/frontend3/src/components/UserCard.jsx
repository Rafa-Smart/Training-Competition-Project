import React from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../api/user';
import { useAuth } from '../context/AuthContext';
import { showAlert } from '../utils/alert';

const UserCard = ({ user, showFollowButton = false, onFollowChange }) => {
  const { user: currentUser } = useAuth();

  const handleFollow = async () => {
    try {
      const response = await userAPI.followUser(user.username);
      showAlert('success', response.message);
      if (onFollowChange) onFollowChange();
    } catch (error) {
      showAlert('error', 'Error', error.response?.data?.message);
    }
  };

  const handleUnfollow = async () => {
    try {
      await userAPI.unfollowUser(user.username);
      showAlert('success', 'Unfollowed successfully');
      if (onFollowChange) onFollowChange();
    } catch (error) {
      showAlert('error', 'Error', error.response?.data?.message);
    }
  };

  return (
    <div className="user-card">
      <div className="user-info">
        <Link to={`/profile/${user.username}`}>
          <h4>{user.full_name}</h4>
          <p>@{user.username}</p>
        </Link>
        <p className="user-bio">{user.bio}</p>
      </div>
      
      {showFollowButton && currentUser && currentUser.id !== user.id && (
        <div className="user-actions">
          {user.is_requested ? (
            <button className="btn-requested">Requested</button>
          ) : (
            <button onClick={handleFollow} className="btn-follow">
              Follow
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserCard;