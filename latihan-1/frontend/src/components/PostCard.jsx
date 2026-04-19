import { useState } from 'react';
import { Link } from 'react-router-dom';
import { postApi } from '../api/post';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ post, onDelete, showDelete = false }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    setIsDeleting(true);
    try {
      await postApi.deletePost(post.id);
      onDelete?.(post.id);
    } catch (error) {
      console.error('Delete post error:', error);
      alert(error.response?.data?.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const apiBaseUrl = 'http://localhost:8000';
  const storageUrl = `${apiBaseUrl}/storage`;

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center">
            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>
              <span className="text-white fw-bold">
                {post.user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <Link 
                to={`/users/${post.user?.username}`} 
                className="text-decoration-none fw-bold text-dark"
              >
                {post.user?.full_name}
              </Link>
              <div className="text-muted small">@{post.user?.username}</div>
            </div>
          </div>
          <div className="text-muted small">{formatDate(post.created_at)}</div>
        </div>
        
        <p className="card-text mb-3">{post.caption}</p>
        
        {post.attachments && post.attachments.length > 0 && (
          <div className="mb-3">
            {post.attachments.map((attachment) => (
              <div key={attachment.id} className="mb-2">
                <img 
                  src={`${storageUrl}/${attachment.storage_path}`} 
                  alt="Post attachment" 
                  className="img-fluid rounded"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
              </div>
            ))}
          </div>
        )}
        
        {showDelete  && (
          <div className="d-flex justify-content-end">
            <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1"></span>
                  Deleting...
                </>
              ) : (
                <>
                  <i className="bi bi-trash me-1"></i>Delete
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;