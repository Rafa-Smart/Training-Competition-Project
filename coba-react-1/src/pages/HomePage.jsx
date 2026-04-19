import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/postService';
import { userService } from '../services/userService';
import PostCard from '../components/posts/PostCard';
import UserCard from '../components/users/UserCard';
import FollowRequests from '../components/users/FollowRequests';
import CreatePostModal from '../components/posts/CreatePostModal';
import InfiniteScroll from '../components/common/InfiniteScroll';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const HomePage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [postsRes, usersRes] = await Promise.all([
        postService.getPosts(0, 10),
        userService.getUsersNotFollowed()
      ]);

      setPosts(postsRes.data.posts || []);
      setUsers(usersRes.data.users || []);
      setHasMore((postsRes.data.posts || []).length === 10);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await postService.getPosts(nextPage, 7);
      const newPosts = response.data.posts || [];
      
      setPosts(prev => [...prev, ...newPosts]);
      setPage(nextPage);
      setHasMore(newPosts.length === 7);
    } catch (error) {
      toast.error('Failed to load more posts');
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  const handleFollowChange = (userId, isFollowing) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const handlePostCreated = () => {
    loadInitialData(); // Refresh posts
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content - Posts */}
      <div className="lg:col-span-2">
        <div className="card mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-medium">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex-1 text-left p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <span className="text-gray-500">What's on your mind?</span>
            </button>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">News Feed</h2>
        
        <InfiniteScroll
          onLoadMore={loadMorePosts}
          hasMore={hasMore}
          loading={loadingMore}
        >
          <div className="space-y-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={handlePostDelete}
                />
              ))
            ) : (
              <div className="card text-center py-12">
                <p className="text-gray-600">No posts yet. Follow some users or create your first post!</p>
              </div>
            )}
          </div>
        </InfiniteScroll>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Follow Requests */}
        <FollowRequests />

        {/* Explore People */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Explore People</h3>
          <div className="space-y-4">
            {users.length > 0 ? (
              users.slice(0, 5).map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onFollowChange={handleFollowChange}
                />
              ))
            ) : (
              <p className="text-gray-600 text-sm">No new users to follow.</p>
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handlePostCreated}
      />
    </div>
  );
};

export default HomePage;