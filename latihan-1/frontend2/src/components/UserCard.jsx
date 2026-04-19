import React from 'react';
import { Link } from 'react-router-dom';

const UserCard = ({ user, showFollowButton = false, onFollow, onUnfollow, isRequested = false }) => {
    return (
        <div style={styles.card}>
            <Link to={`/profile/${user.username}`} style={styles.link}>
                <div style={styles.userInfo}>
                    <strong>{user.full_name}</strong>
                    <span>@{user.username}</span>
                    <p style={styles.bio}>{user.bio}</p>
                </div>
            </Link>
            {showFollowButton && (
                <div style={styles.actions}>
                    {isRequested ? (
                        <button style={styles.requestedBtn} disabled>
                            Requested
                        </button>
                    ) : user.following_status === 'following' ? (
                        <button onClick={() => onUnfollow(user.username)} style={styles.unfollowBtn}>
                            Unfollow
                        </button>
                    ) : (
                        <button onClick={() => onFollow(user.username)} style={styles.followBtn}>
                            Follow
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    card: {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '0.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    link: {
        textDecoration: 'none',
        color: 'inherit',
        flex: 1,
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    bio: {
        fontSize: '0.9rem',
        color: '#666',
        marginTop: '0.25rem',
    },
    actions: {
        marginLeft: '1rem',
    },
    followBtn: {
        padding: '0.25rem 0.75rem',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    unfollowBtn: {
        padding: '0.25rem 0.75rem',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    requestedBtn: {
        padding: '0.25rem 0.75rem',
        backgroundColor: '#ffc107',
        color: '#333',
        border: 'none',
        borderRadius: '4px',
        cursor: 'default',
    },
};

export default UserCard;