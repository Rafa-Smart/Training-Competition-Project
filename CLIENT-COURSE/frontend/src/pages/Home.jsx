import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { postApi, userApi } from "../api";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import UserCard from "../components/UserCard";
import FollowRequest from "../components/FollowRequest";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
// https://chat.deepseek.com/a/chat/s/e0c36e20-79c2-4c13-bc26-7a523fa7d6c4
const Home = () => {
  const { user } = useAuth();
  const [exploreUsers, setExploreUsers] = useState([]);
  const [followRequests, setFollowRequests] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  // Fetch posts with infinite scroll
  const fetchPosts = async (page, size) => {
    try {
      const response = await postApi.getPosts({ page, size });
      return response.data.posts || [];
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  };

  const { data: posts, loading: postsLoading } = useInfiniteScroll(
    fetchPosts,
    0,
    2
  );

  // Fetch explore users
  useEffect(() => {
    const loadExploreUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const response = await userApi.getUsers();
        setExploreUsers(response.data.users || []);
      } catch (error) {
        console.error("Error fetching explore users:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (user) {
      loadExploreUsers();
    }
  }, [user]);

  // Fetch follow requests for private accounts
  useEffect(() => {
    const loadFollowRequests = async () => {
      if (!user?.is_private) {
        setIsLoadingRequests(false);
        return;
      }

      setIsLoadingRequests(true);
      try {
        const response = await userApi.getFollowers();
        const followers = response.data.followers || [];
        const requests = followers.filter((f) => f.is_requested === true);
        setFollowRequests(requests);
      } catch (error) {
        console.error("Error fetching follow requests:", error);
      } finally {
        setIsLoadingRequests(false);
      }
    };

    if (user) {
      loadFollowRequests();
    }
  }, [user]);

  const handlePostDelete = (postId) => {
    // Remove deleted post from state
    // Note: This would be handled by parent component if needed
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* News Feed - Main Content */}
        <div className="col-lg-8">
          <h3 className="mb-4">News Feed</h3>

          {postsLoading && posts.length === 0 ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading posts...</span>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="alert alert-info">
              {posts}
              No posts yet. Follow some users or create your first post!
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={handlePostDelete}
                  showDelete={post.user?.id === user?.id}
                />
              ))}

              {postsLoading && posts.length > 0 && (
                <div className="text-center my-3">
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">
                      Loading more posts...
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Follow Requests Section */}
          {user?.is_private && followRequests.length > 0 && (
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Follow Requests</h5>
                {isLoadingRequests ? (
                  <div className="text-center">
                    <div
                      className="spinner-border spinner-border-sm text-primary"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {followRequests.map((follower) => (
                      <FollowRequest
                        key={follower.id}
                        follower={follower}
                        onUpdate={() => {
                          // Refresh follow requests

                          // nah ini tuh kenapa ktia menggunakan fungsi updater, karena kita ignin mendapatkna
                          // data followrequest yang sebelumnya, jadi kita bisa filter deh
                          setFollowRequests((prev) =>
                            prev.filter((f) => f.id !== follower.id)
                          );
                        }}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Explore People Section */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Explore People</h5>
              {isLoadingUsers ? (
                <div className="text-center">
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : exploreUsers.length === 0 ? (
                <p className="text-muted">No users to explore.</p>
              ) : (
                <>
                  {exploreUsers.slice(0, 5).map((exploreUser) => (
                    <UserCard
                      key={exploreUser.id}
                      user={exploreUser}
                      onFollowUpdate={() => {
                        // Remove followed user from explore list
                        setExploreUsers((prev) =>
                          prev.filter((u) => u.id !== exploreUser.id)
                        );
                      }}
                    />
                  ))}

                  {exploreUsers.length > 5 && (
                    <div className="text-center mt-2">
                      <Link
                        to="/explore"
                        className="btn btn-outline-primary btn-sm"
                      >
                        View All
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
