import { useEffect, useState } from "react";
import { postApi } from "../api/post";
import { showError } from "../utils/alert";
import { useAuth } from "../context/AuthContext";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import { userApi } from "../api/user";
import PostCard from "../components/PostCard";
import FollowRequest from "../components/FollowRequest";
import UserCard from "../components/UserCard";

export default Home = () => {
  const fetchPosts = async (size, page) => {
    try {
      const response = await postApi.getAll({ size, page });
      return response.data.posts || [];
    } catch (error) {
      showError("gagla fetchh post");
    }
  };
  const { user } = useAuth();
  const [postsuser, setPostsUser] = useState([]);
  const [exploreUsers, setExploreUsers] = useState([]);
  const [followerRequest, setFollowerRequests] = useState([]);
  const [isLoadingExploreUsers, setIsLoadingExploreUsers] = useState(false);
  const [isLoadingFollowerRequest, setIsLoadingFollowerRequest] =
    useState(false);

  const { posts, isLoading } = useInfiniteScroll(fetchPosts, 10, 0);

  useEffect(() => {
    const loadExploreUsers = async () => {
      setIsLoadingExploreUsers(true);
      try {
        const response = await userApi.getUser();

        setExploreUsers(response.data.users || []);
      } catch (e) {
        showError("gagal nampiin users");
      } finally {
        setIsLoadingExploreUsers(false);
      }
    };
    if (user) {
      loadExploreUsers();
    }
  }, []);

  useEffect(() => {
    setPostsUser(postsuser);
  }, [posts, isLoading]);

  useEffect(() => {
    const loadRequestUsers = async () => {
      if (!user.is_private) {
        setFollowerRequests([]);
        return;
      }

      setIsLoadingFollowerRequest(true);
      try {
        const response = await userApi.getFollowers();
        setFollowerRequests(
          response.data.followers.map((follow) => {
            return follow.is_requested != true;
          }),
        );
      } catch (e) {
        showError("agal ambil data follow");
      } finally {
        setIsLoadingFollowerRequest(false);
      }
    };

    if (user) {
      loadRequestUsers();
    }
  }, []);

  return (
    <>
      <div className="container py-5">
        <div className="row justify-content-between">
          <div className="col-md-8">
            <h5 className="mb-3">News Feed</h5>

            {postsuser.length == 0 && isLoading ? (
              <center>
                <span className="spinner-border spinner-sm me-2"></span> load
                postsuser...
              </center>
            ) : // jadi kalo masih kosong berati ga ada
            postsuser.length == 0 ? (
              <>
                <center>no postsuser</center>
              </>
            ) : (
              <>
                {postsuser.map((post) => {
                  return (
                    <PostCard
                      key={post.user_id}
                      post={post}
                      showDelete={post.user_id == user.id}
                      onDeletPost={() => {
                        setPostsUser((postsuser) => {
                          return postsuser.filter((p) => p.id != post.id);
                        });
                      }}
                    ></PostCard>
                  );
                })}

                {postsuser.length > 0 && isLoading && (
                  <>
                    <span className="spinner-border spinner-sm me-2"></span>
                    load posts...
                  </>
                )}
              </>
            )}
          </div>
          <div className="col-md-4">
            <div className="request-follow mb-4">
              <h6 className="mb-3">Follow Requests</h6>

              {isLoadingFollowerRequest ? (
                <>
                  <span className="spinner-border spinner-sm me-2"></span>{" "}
                  loading follow request
                </>
              ) : !user.is_private ? (
                <>
                  {exploreUsers.length == 0 ? (
                    <>
                      <h6 className="mb-3">No Follow Request</h6>
                    </>
                  ) : (
                    <>
                      {followerRequest.map((data) => {
                        return (
                          <FollowRequest
                            follow={data}
                            onAccept={() => {
                              setFollowerRequests((po) => {
                                followerRequest.map((p) => {
                                  return p.id != data.id;
                                });
                              });
                            }}
                            key={data.id}
                          ></FollowRequest>
                        );
                      })}
                    </>
                  )}
                </>
              ) : (
                <>
                  <h6 className="mb-3">Your Account is Public</h6>
                </>
              )}
            </div>
            <div className="explore-people">
              <h6 className="mb-3">Explore People</h6>
              <div className="explore-people-list">
                {isLoadingExploreUsers ? (
                  <>
                    <span className="spinner-border spinner-sm me-2"></span>
                    loading esplore users
                  </>
                ) : (
                  <>
                    {
                      (exploreUsers.length = 0 ? (
                        <>kosong</>
                      ) : (
                        <>
                          {exploreUsers.map((i) => {
                            return (
                              <UserCard
                                key={user.id}
                                user={i}
                                onFollow={() => {
                                  setExploreUsers((e) => {
                                    return exploreUsers.filter(
                                      (u) => i.id != u.id,
                                    );
                                  });
                                }}
                              ></UserCard>
                            );
                          })}
                        </>
                      ))
                    }
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
