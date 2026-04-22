import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

const UserCard = ({ user, showFollowButton = true, onFollowChange }) => {
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(user.following_status === 'following');
  const [isLoading, setIsLoading] = useState(false);
  const [isRequested, setIsRequested] = useState(user.following_status === 'requested');

  const isOwnProfile = currentUser?.id === user.id;

  const handleFollow = async () => {
    if (isOwnProfile) return;
    
    setIsLoading(true);
    try {
      if (isFollowing || isRequested) {
        await userService.unfollowUser(user.username);
        setIsFollowing(false);
        setIsRequested(false);
        toast.success('Unfollowed successfully');
      } else {
        const response = await userService.followUser(user.username);
        if (response.data.status === 'following') {
          setIsFollowing(true);
          setIsRequested(false);
        } else {
          setIsRequested(true);
        }
        toast.success(response.data.message);
      }
      
      if (onFollowChange) {
        onFollowChange(user.id, !isFollowing && !isRequested);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getFollowButtonText = () => {
    if (isFollowing) return 'Following';
    if (isRequested) return 'Requested';
    return 'Follow';
  };

  return (
    <div className="card flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link to={`/${user.username}`}>
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-medium text-lg">
            {user.username.charAt(0).toUpperCase()}
          </div>
        </Link>
        <div>
          <Link
            to={`/${user.username}`}
            className="font-medium text-gray-900 hover:text-primary-600"
          >
            {user.username}
          </Link>
          <p className="text-sm text-gray-500">{user.full_name}</p>
          <p className="text-sm text-gray-600 mt-1 truncate">{user.bio}</p>
        </div>
      </div>

      {showFollowButton && !isOwnProfile && (
        <button
          onClick={handleFollow}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
            isFollowing
              ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              : isRequested
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              : 'btn-primary'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? 'Processing...' : getFollowButtonText()}
        </button>
      )}
    </div>
  );
};

export default UserCard;