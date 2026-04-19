import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/postService';
import { timeAgo, truncateText } from '../../utils/helpers';
import toast from 'react-hot-toast';

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isOwner = user?.id === post.user.id;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await postService.deletePost(post.id);
      toast.success('Post deleted successfully');
      if (onDelete) {
        onDelete(post.id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Link to={`/${post.user.username}`}>
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-medium">
              {post.user.username.charAt(0).toUpperCase()}
            </div>
          </Link>
          <div>
            <Link
              to={`/${post.user.username}`}
              className="font-medium text-gray-900 hover:text-primary-600"
            >
              {post.user.username}
            </Link>
            <p className="text-sm text-gray-500">{timeAgo(post.created_at)}</p>
          </div>
        </div>

        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {showConfirm && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Post'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-gray-800 mb-4">{post.caption}</p>

      {post.attachments && post.attachments.length > 0 && (
        <div className="mb-4">
          {post.attachments.map((attachment) => (
            <div key={attachment.id} className="mb-2">
              <img
                src={`http://localhost:8000/storage/${attachment.storage_path}`}
                alt="Post attachment"
                className="rounded-lg w-full h-auto max-h-96 object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>{post.comments_count || 0} comments</span>
          <span>{post.likes_count || 0} likes</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;