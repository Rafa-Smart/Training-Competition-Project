import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import UserCard from '../components/UserCard';
import { getPosts } from '../api/post';
import { getUsersNotFollowed, getFollowersSelf, followUser, acceptFollowRequest } from '../api/user';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

const Home = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [followRequests, setFollowRequests] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadPosts = useCallback(async (pageNum) => {
        try {
            setLoading(true);
            const response = await getPosts({ page: pageNum, size: 10 });
            const newPosts = response.data.posts;
            
            if (newPosts.length === 0) {
                setHasMore(false);
            } else {
                setPosts(prev => [...prev, ...newPosts]);
            }
        } catch (error) {
            console.error('Failed to load posts:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadPosts(nextPage);
        }
    }, [loading, hasMore, page, loadPosts]);

    useInfiniteScroll(loadMore);

    useEffect(() => {
        loadPosts(0);
        loadUsers();
        if (user?.is_private) {
            loadFollowRequests();
        }
    }, []);

    const loadUsers = async () => {
        try {
            const response = await getUsersNotFollowed();
            setUsers(response.data.users || []);
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    const loadFollowRequests = async () => {
        try {
            const response = await getFollowersSelf();
            const requests = response.data.followers?.filter(f => f.is_requested) || [];
            setFollowRequests(requests);
        } catch (error) {
            console.error('Failed to load follow requests:', error);
        }
    };

    const handleFollow = async (username) => {
        try {
            await followUser(username);
            setUsers(users.filter(u => u.username !== username));
        } catch (error) {
            console.error('Failed to follow user:', error);
        }
    };

    const handleAccept = async (username) => {
        try {
            await acceptFollowRequest(username);
            setFollowRequests(followRequests.filter(req => req.username !== username));
        } catch (error) {
            console.error('Failed to accept follow request:', error);
        }
    };

    const handleDeletePost = (postId) => {
        setPosts(posts.filter(post => post.id !== postId));
    };

    return (
        <div style={styles.container}>
            <div style={styles.mainContent}>
                <h2>News Feed</h2>
                {posts.length === 0 && !loading ? (
                    <p>No posts to show. Follow some users to see their posts!</p>
                ) : (
                    posts.map((post) => (
                        <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
                    ))
                )}
                {loading && <p>Loading more posts...</p>}
            </div>
            
            <div style={styles.sidebar}>
                <div style={styles.section}>
                    <h3>Explore People</h3>
                    {users.length === 0 ? (
                        <p>No users to explore</p>
                    ) : (
                        users.map((user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                showFollowButton={true}
                                onFollow={handleFollow}
                            />
                        ))
                    )}
                </div>

                {user?.is_private && followRequests.length > 0 && (
                    <div style={styles.section}>
                        <h3>Follow Requests</h3>
                        {followRequests.map((request) => (
                            <div key={request.id} style={styles.requestCard}>
                                <UserCard user={request} />
                                <button
                                    onClick={() => handleAccept(request.username)}
                                    style={styles.acceptBtn}
                                >
                                    Accept
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        gap: '2rem',
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    mainContent: {
        flex: 2,
    },
    sidebar: {
        flex: 1,
    },
    section: {
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    requestCard: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.5rem',
    },
    acceptBtn: {
        padding: '0.25rem 0.75rem',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

export default Home;