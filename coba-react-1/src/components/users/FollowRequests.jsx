import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

const FollowRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.is_private) {
      loadFollowRequests();
    }
  }, [user]);

  const loadFollowRequests = async () => {
    try {
      const response = await userService.getFollowRequests();
      setRequests(response.data.follow_requests || []);
    } catch (error) {
      console.error('Failed to load follow requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (username) => {
    try {
      await userService.acceptFollowRequest(username);
      setRequests(requests.filter(req => req.username !== username));
      toast.success('Follow request accepted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept request');
    }
  };

  if (!user?.is_private || loading) {
    return null;
  }

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="card mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Follow Requests</h3>
      <div className="space-y-3">
        {requests.map((request) => (
          <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-medium">
                {request.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{request.username}</p>
                <p className="text-sm text-gray-500">{request.full_name}</p>
              </div>
            </div>
            <button
              onClick={() => handleAccept(request.username)}
              className="btn-primary text-sm px-3 py-1"
            >
              Accept
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowRequests;