import React from 'react';
import { useAuth } from '../context/AuthContext';
import { deletePost } from '../api/post';

const PostCard = ({ post, onDelete }) => {
    const { user } = useAuth();

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await deletePost(post.id);
                onDelete(post.id);
            } catch (error) {
                alert('Failed to delete post');
            }
        }
    };

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <div style={styles.userInfo}>
                    <strong>{post.user?.username || 'Unknown User'}</strong>
                    <span style={styles.date}>
                        {new Date(post.created_at).toLocaleDateString()}
                    </span>
                </div>
                {user?.id === post.user?.id && (
                    <button onClick={handleDelete} style={styles.deleteBtn}>
                        Delete
                    </button>
                )}
            </div>
            <p style={styles.caption}>{post.caption}</p>
            <div style={styles.attachments}>
                {post.attachments?.map((attachment) => (
                    <img
                        key={attachment.id}
                        src={`http://localhost:8000/storage/${attachment.storage_path}`}
                        alt="Post attachment"
                        style={styles.image}
                    />
                ))}
            </div>
        </div>
    );
};

const styles = {
    card: {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem',
        backgroundColor: 'white',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    date: {
        fontSize: '0.8rem',
        color: '#666',
    },
    caption: {
        marginBottom: '1rem',
    },
    attachments: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
    },
    image: {
        maxWidth: '200px',
        maxHeight: '200px',
        borderRadius: '4px',
    },
    deleteBtn: {
        padding: '0.25rem 0.5rem',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

export default PostCard;