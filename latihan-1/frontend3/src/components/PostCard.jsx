import React from 'react';
import { postAPI } from '../api/post';
import { useAuth } from '../context/AuthContext';
import { showConfirm } from '../utils/alert';

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();

  const handleDelete = async () => {
    const result = await showConfirm('Delete Post', 'Are you sure you want to delete this post?');
    if (result.isConfirmed) {
      try {
        await postAPI.deletePost(post.id);
        onDelete(post.id);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-user">
          <strong>{post.user.full_name}</strong>
          <span>@{post.user.username}</span>
        </div>
        {user && user.id === post.user.id && (
          <button onClick={handleDelete} className="delete-btn">Delete</button>
        )}
      </div>
      
      <div className="post-content">
        <p className="post-caption">{post.caption}</p>
        
        <div className="post-images">
          {post.attachments.map((attachment) => (
            <div key={attachment.id} className="post-image">
              <img 
                src={`http://localhost:8000/storage/${attachment.storage_path}`} 
                alt="Post attachment" 
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="post-footer">
        <small>{formatDate(post.created_at)}</small>
      </div>
    </div>
  );
};

export default PostCard;