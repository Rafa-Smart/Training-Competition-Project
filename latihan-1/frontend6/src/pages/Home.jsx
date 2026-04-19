import { useEffect, useState } from "react";
import { apiPost } from "../api/apiPost";
import { useAuth } from "../context/AuthContext";
import { ErrorAlert } from "../utils/sweetAlert";
import { useInFiniteScroll } from "../hooks/useInfiniteScroll";
import PostCard from "../components/PostCard";

export default Home = () => {
  const fetchPosts = async (size, page) => {
    try {
      const response = await apiPost.getAllPosts({ size, page });
      return response.data.posts || [];
    } catch (e) {
      ErrorAlert("gagal fetch posts");
      throw e;
    }
  };

  const { user } = useAuth();
  const [exploreUsers, setExploreUsers] = useState([]);
  const [followerRequests, setFollowerRequests] = useState([]);
  const [postsData, setPostsData] = useState([]);
  const [isLoadingFollowRequest, setIsLoadingFollowRequest] = useState(false);
  const [isLoadingExplore, setIsLoadingExplore] = useState(false);
  const { posts, isLoadingPosts } = useInFiniteScroll(fetchPosts, size, page);

  useEffect(() => {
    setPostsData(posts);
  }, [posts, isLoadingPosts]);

  return (
    <>
      {" "}
      <div className="container py-5">
        <div className="row justify-content-between">
          <div className="col-md-8">
            <h5 className="mb-3">News Feed</h5>

            {posts.length == 0 && isLoading ? (
              <>
                <span className="spinner-border spiner-sm me-2"></span> loading
                posts ....
              </>
            ) : (
              <>
                {posts.length > 0 && isLoding ? (
                  <>
                    {posts.map((post) => {
                      return (
                        <PostCard
                          key={post.id}
                          post={post}
                          onDelete={() =>
                            setPostsData(posts.filter((u) => u.id != post.id))
                          }
                          showDelete={post.user_id == user.id}
                        ></PostCard>
                      );
                    })}
                  </>
                ) : (
                  <></>
                )}
              </>
            )}
 
          </div>
          <div className="col-md-4">
            <div className="request-follow mb-4">
              <h6 className="mb-3">Follow Requests</h6>
              <div className="request-follow-list">
                <div className="card mb-2">
                  <div className="card-body d-flex align-items-center justify-content-between p-2">
                    <a href="user-profile-private.html">@laychristian92</a>
                    <a href className="btn btn-primary btn-sm">
                      Confirm
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="explore-people">
              <h6 className="mb-3">Explore People</h6>
              <div className="explore-people-list">
                <div className="card mb-2">
                  <div className="card-body p-2">
                    <a href="user-profile-private.html">@davidnaista</a>
                  </div>
                </div>
                <div className="card mb-2">
                  <div className="card-body p-2">
                    <a href="user-profile-private.html">@superipey</a>
                  </div>
                </div>
                <div className="card mb-2">
                  <div className="card-body p-2">
                    <a href="user-profile-private.html">@lukicenturi</a>
                  </div>
                </div>
                <div className="card mb-2">
                  <div className="card-body p-2">
                    <a href="user-profile-private.html">@_erik3010</a>
                  </div>
                </div>
                <div className="card mb-2">
                  <div className="card-body p-2">
                    <a href="user-profile-private.html">@asawgi</a>
                  </div>
                </div>
                <div className="card mb-2">
                  <div className="card-body p-2">
                    <a href="user-profile-private.html">@irfnmaulaa</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
