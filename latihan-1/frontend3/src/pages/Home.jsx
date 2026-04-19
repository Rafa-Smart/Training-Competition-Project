import React, { useState, useEffect, useCallback } from 'react';
import { postAPI, userAPI } from '../api';
import PostCard from '../components/PostCard';
import UserCard from '../components/UserCard';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [followRequests, setFollowRequests] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  const loadPosts = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const response = await postAPI.getPosts(page, 10);
      setPosts(prev => [...prev, ...response.posts]);
      setHasMore(response.posts.length > 0);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  const loadMoreCallback = useCallback(() => {
    loadPosts();
  }, [loadPosts]);

  useInfiniteScroll(loadMoreCallback);

  useEffect(() => {
    loadPosts();
    loadUsers();
    loadFollowRequests();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userAPI.getUsers();
      setUsers(response.users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadFollowRequests = async () => {
    try {
      const response = await userAPI.getFollowersSelf();
      if (user.is_private) {
        setFollowRequests(response.followers.filter(f => f.is_requested));
      }
    } catch (error) {
      console.error('Error loading follow requests:', error);
    }
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  const handleFollowChange = () => {
    loadUsers();
  };

  const handleAcceptRequest = async (username) => {
    try {
      await userAPI.acceptFollowRequest(username);
      setFollowRequests(prev => prev.filter(user => user.username !== username));
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="main-content">
          <h2>News Feed</h2>
          
          {posts.length === 0 ? (
            <p className="no-posts">No posts to show. Follow some users!</p>
          ) : (
            posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onDelete={handleDeletePost} 
              />
            ))
          )}
          
          {loading && <div className="loading">Loading more posts...</div>}
        </div>
        
        <div className="sidebar">
          {user.is_private && followRequests.length > 0 && (
            <div className="sidebar-section">
              <h3>Follow Requests</h3>
              {followRequests.map(user => (
                <div key={user.id} className="follow-request">
                  <span>@{user.username}</span>
                  <button 
                    onClick={() => handleAcceptRequest(user.username)}
                    className="btn-accept"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="sidebar-section">
            <h3>Explore People</h3>
            {users.length === 0 ? (
              <p>No users to explore</p>
            ) : (
              users.map(user => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  showFollowButton={true}
                  onFollowChange={handleFollowChange}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;