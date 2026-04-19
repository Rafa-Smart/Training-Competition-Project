import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import UserCard from '../components/UserCard';
import { getDetailUser, followUser, unfollowUser, getFollowersOther, getFollowingsOther } from '../api/user';

const Profile = () => {
    const { username } = useParams();
    const { user: currentUser } = useAuth();
    const [profileUser, setProfileUser] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [followings, setFollowings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts');
    const [tabLoading, setTabLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadUserData();
    }, [username]);

    const loadUserData = async () => {
        try {
            setLoading(true);
            const response = await getDetailUser(username);
            const userData = response.data;
            setProfileUser(userData);
            
            // Selalu load followers jika akun tidak private atau kita sudah follow atau ini akun kita sendiri
            const canViewFollowers = !userData.is_private || 
                                   userData.following_status === 'following' || 
                                   userData.following_status === 'requested' || 
                                   userData.is_your_account;
            
            if (canViewFollowers) {
                await loadFollowers();
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
            if (error.response?.status === 404) {
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadFollowers = async () => {
        try {
            const response = await getFollowersOther(username);
            setFollowers(response.data.followers || []);
        } catch (error) {
            console.error('Failed to load followers:', error);
        }
    };

    const loadFollowings = async () => {
        try {
            setTabLoading(true);
            const response = await getFollowingsOther(username);
            setFollowings(response.data.following || []);
        } catch (error) {
            console.error('Failed to load followings:', error);
        } finally {
            setTabLoading(false);
        }
    };

    const handleTabChange = async (tab) => {
        setActiveTab(tab);
        
        if (tab === 'followers') {
            if (followers.length === 0) {
                await loadFollowers();
            }
        } else if (tab === 'following') {
            if (followings.length === 0) {
                await loadFollowings();
            }
        }
    };

    const handleFollow = async () => {
        try {
            await followUser(username);
            await loadUserData(); // Reload semua data termasuk followers
        } catch (error) {
            console.error('Failed to follow user:', error);
            if (error.response?.status === 422 && error.response.data.message === 'You are already followed') {
                // Jika sudah follow, tetap reload data untuk update status
                await loadUserData();
            }
        }
    };

    const handleUnfollow = async () => {
        try {
            await unfollowUser(username);
            await loadUserData(); // Reload semua data termasuk followers
        } catch (error) {
            console.error('Failed to unfollow user:', error);
        }
    };

    const handleDeletePost = (postId) => {
        setProfileUser(prev => ({
            ...prev,
            posts: prev.posts.filter(post => post.id !== postId),
            posts_count: prev.posts_count - 1,
        }));
    };

    if (loading) {
        return <div style={styles.loading}>Loading...</div>;
    }

    if (!profileUser) {
        return <div style={styles.notFound}>User not found</div>;
    }

    const isOwnAccount = profileUser.is_your_account;
    const canViewPosts = !profileUser.is_private || 
                         profileUser.following_status === 'following' || 
                         profileUser.following_status === 'requested' || 
                         isOwnAccount;
    
    // Bisa melihat followers jika:
    // 1. Akun tidak private, ATAU
    // 2. Kita sudah follow (following/requested), ATAU
    // 3. Ini akun kita sendiri
    const canViewFollowers = !profileUser.is_private || 
                            profileUser.following_status === 'following' || 
                            profileUser.following_status === 'requested' || 
                            isOwnAccount;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.userInfo}>
                    <h1>{profileUser.full_name}</h1>
                    <p style={styles.username}>@{profileUser.username}</p>
                    <p style={styles.bio}>{profileUser.bio}</p>
                    
                    <div style={styles.stats}>
                        <div style={styles.stat}>
                            <strong>{profileUser.posts_count}</strong>
                            <span>Posts</span>
                        </div>
                        <div style={styles.stat}>
                            <strong>{profileUser.followers_count}</strong>
                            <span>Followers</span>
                        </div>
                        <div style={styles.stat}>
                            <strong>{profileUser.following_count}</strong>
                            <span>Following</span>
                        </div>
                    </div>

                    {!isOwnAccount && (
                        <div style={styles.followActions}>
                            {profileUser.following_status === 'not-following' && (
                                <button onClick={handleFollow} style={styles.followBtn}>
                                    {profileUser.is_private ? 'Request to Follow' : 'Follow'}
                                </button>
                            )}
                            {profileUser.following_status === 'requested' && (
                                <button style={styles.requestedBtn} disabled>
                                    Requested
                                </button>
                            )}
                            {profileUser.following_status === 'following' && (
                                <button onClick={handleUnfollow} style={styles.unfollowBtn}>
                                    Unfollow
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div style={styles.tabs}>
                <button
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'posts' ? styles.activeTab : {}),
                    }}
                    onClick={() => handleTabChange('posts')}
                >
                    Posts
                </button>
                {canViewFollowers && (
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'followers' ? styles.activeTab : {}),
                        }}
                        onClick={() => handleTabChange('followers')}
                    >
                        Followers
                    </button>
                )}
                <button
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'following' ? styles.activeTab : {}),
                    }}
                    onClick={() => handleTabChange('following')}
                >
                    Following
                </button>
            </div>

            <div style={styles.content}>
                {activeTab === 'posts' ? (
                    canViewPosts ? (
                        profileUser.posts?.length > 0 ? (
                            profileUser.posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onDelete={handleDeletePost}
                                />
                            ))
                        ) : (
                            <p style={styles.emptyMessage}>No posts yet</p>
                        )
                    ) : (
                        <div style={styles.privateMessage}>
                            <h3>This account is private</h3>
                            <p>Follow to see their posts</p>
                        </div>
                    )
                ) : activeTab === 'followers' ? (
                    <div style={styles.followList}>
                        {tabLoading ? (
                            <p>Loading followers...</p>
                        ) : followers.length > 0 ? (
                            followers.map((follower) => (
                                <UserCard 
                                    key={follower.id} 
                                    user={follower}
                                    showFollowButton={!follower.is_your_account && currentUser?.id !== follower.id}
                                    onFollow={() => {}}
                                    onUnfollow={() => {}}
                                />
                            ))
                        ) : (
                            <p style={styles.emptyMessage}>No followers yet</p>
                        )}
                    </div>
                ) : (
                    <div style={styles.followList}>
                        {tabLoading ? (
                            <p>Loading followings...</p>
                        ) : followings.length > 0 ? (
                            followings.map((following) => (
                                <UserCard 
                                    key={following.id} 
                                    user={following}
                                    showFollowButton={!following.is_your_account && currentUser?.id !== following.id}
                                    onFollow={() => {}}
                                    onUnfollow={() => {}}
                                />
                            ))
                        ) : (
                            <p style={styles.emptyMessage}>Not following anyone yet</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
    },
    loading: {
        textAlign: 'center',
        padding: '2rem',
    },
    notFound: {
        textAlign: 'center',
        padding: '2rem',
        color: '#dc3545',
    },
    header: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    userInfo: {
        textAlign: 'center',
    },
    username: {
        color: '#666',
        marginBottom: '1rem',
        fontSize: '1.1rem',
    },
    bio: {
        marginBottom: '2rem',
        fontSize: '1rem',
        color: '#555',
    },
    stats: {
        display: 'flex',
        justifyContent: 'center',
        gap: '3rem',
        marginBottom: '2rem',
    },
    stat: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
    },
    statStrong: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    statSpan: {
        fontSize: '0.9rem',
        color: '#666',
    },
    followActions: {
        marginTop: '1rem',
    },
    followBtn: {
        padding: '0.5rem 2rem',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
        minWidth: '150px',
    },
    unfollowBtn: {
        padding: '0.5rem 2rem',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
        minWidth: '150px',
    },
    requestedBtn: {
        padding: '0.5rem 2rem',
        backgroundColor: '#ffc107',
        color: '#333',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'default',
        minWidth: '150px',
    },
    tabs: {
        display: 'flex',
        borderBottom: '1px solid #ddd',
        marginBottom: '1rem',
    },
    tab: {
        padding: '1rem 2rem',
        backgroundColor: 'transparent',
        border: 'none',
        fontSize: '1rem',
        cursor: 'pointer',
        borderBottom: '3px solid transparent',
        transition: 'all 0.3s',
    },
    activeTab: {
        borderBottomColor: '#007bff',
        fontWeight: 'bold',
        color: '#007bff',
    },
    content: {
        minHeight: '200px',
    },
    privateMessage: {
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    followList: {
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    emptyMessage: {
        textAlign: 'center',
        padding: '2rem',
        color: '#666',
    },
};

export default Profile;