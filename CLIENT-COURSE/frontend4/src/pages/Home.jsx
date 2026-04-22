import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { showError } from "../utils/alert";
import { apiPost } from "../api/post";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import { apiUser } from "../api/user";
import PostCard from "../components/PostCard";
import FollowRequest from "../components/FollowRequest";
import UserCard from "../components/UserCard";

// /ini harus taruh di luar komponen
// agar tidka selalu di load ulang
const fetchPosts = async (page, sizePage) => {
  try {
    const response = await apiPost.get({ page, sizePage });
    console.log(response);
    return response.data.posts || [];
  } catch (error) {
    console.log(error);
    showError("failed to fetch posts");
  }
};
const Home = () => {
  const { user } = useAuth();
  const [exploreUsers, setExploreUsers] = useState([]);
  const [followRequestUsers, setFollowRequestUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [postsData, setPostsData] = useState([]);

  //   jangjan di taruh di sini, tpai taruh loadingnya itu dari si useInfiniteScroll
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  const { items: posts, loading: postsLoading } = useInfiniteScroll(
    fetchPosts,
    0,
    10,
  );

  useEffect(() => {
    setPostsData(posts);
    console.log(postsData);
  }, [posts, postsLoading]);

  useEffect(() => {
    // fetchPosts()
    const loadExploreUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const response = await apiUser.getUsers();
        setExploreUsers(response.data.users || []);
      } catch (error) {
        console.log(error);
        showError("failed to fetch explore users");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (user) {
      loadExploreUsers();
    }
  }, [user]);

  useEffect(() => {
    const loadFollowRequestUsers = async () => {
      if (!user.is_private) {
        setIsLoadingRequests(false);
        return;
      }

      setIsLoadingRequests(true);
      try {
        const response = await apiUser.getFollower();
        const followRequest = response.data.followers || [];
        const request = followRequest.filter((f) => f.is_requested == true);

        setFollowRequestUsers(request);
      } catch (error) {
        showError("failed to fetch explore users");
      } finally {
        setIsLoadingRequests(false);
      }
    };

    if (user) {
      loadFollowRequestUsers();
    }
  }, [user]);

  return (
    <>
      {" "}
      <div className="container py-5">
        <div className="row justify-content-between">
          <div className="col-md-8">
            <h5 className="mb-3">News Feed</h5>

            {postsLoading && posts.length == 0 ? (
              <>
                <span className="spinner-border spinner-sm me-2"></span>
                load posts...
              </>
            ) : // dinsii kita cek lagi apakah masih 0, jika iya tampilkan ini
            posts.length === 0 ? (
              <>
                <div className="alert alert-info">
                  No posts yet. Follow some users or create your first post!
                </div>
              </>
            ) : (
              <>
                {postsData.map((post, index) => {
                  return (
                    <PostCard
                      key={post.id}
                      post={post}
                      showDelete={post.user_id == user.id}
                      onDeleteUpdate={() => {
                        setPostsData((prevDataPost) =>
                          prevDataPost.filter(
                            (data, index) => post.id != data.id,
                          ),
                        );
                      }}
                    ></PostCard>
                  );
                })}
                
                {/* disini kita cek lagi, apakah masih loading DAN
               sudah lebih dari 0 postsnya artinya load ulang */}

                {postsLoading && posts.length > 0 && (
                  <>
                    <span className="spinner-border spinner-sm me-2"></span>
                    load posts...
                  </>
                )}
              </>
            )}
          </div>
          <div className="col-md-4">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">Follow Requests</h5>
                {isLoadingRequests ? (
                  <div className="text-center">
                    <span className="spinner-border spinner-sm me-2"></span>
                    Loading follow requests...
                  </div>
                ) : user.is_private ? (
                  followRequestUsers.length > 0 ? (
                    followRequestUsers.map((follow) => (
                      <FollowRequest
                        key={follow.id}
                        follower={follow}
                        onUpdateFollowRequest={() => {
                          setFollowRequestUsers((prevData) =>
                            prevData.filter((item) => item.id !== follow.id),
                          );
                        }}
                      />
                    ))
                  ) : (
                    <p className="text-muted mb-0">No follow requests.</p>
                  )
                ) : (
                  <p className="text-muted mb-0">Your account is public.</p>
                )}
              </div>
            </div>

            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">Explore Users</h5>
                {isLoadingUsers ? (
                  <>
                    <span className="spinner-border spinner-sm me-2"></span>
                    load explore users...
                  </>
                ) : exploreUsers.length === 0 ? (
                  <>
                    <p className="text-muted">No users to explore.</p>
                  </>
                ) : (
                  <>
                    {exploreUsers.map((exploreUser) => (
                      <UserCard
                        key={exploreUser.id}
                        user={exploreUser}
                        onFollowUpdate={() => {
                          // Remove followed user from explore list
                          // jadi nanti dari si card user, tinggal pake aja atau tinggal
                          // jalaka saja nanti dia akn jalankan si ini
                          setExploreUsers((prev) =>
                            prev.filter((u) => u.id !== exploreUser.id),
                          );
                        }}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
