import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../api/user";
import { showError } from "../utils/alert";
import PostCard from "../components/PostCard";
import FollowRequest from "../components/FollowRequest";
import UserCard from "../components/UserCard";

export default Profile = () => {
  const [profile, setProfile] = useState({});
  const navigate = useNavigate();
  const { user } = useAuth();
  const params = useParams();

  const [posts, setPosts] = useState([]);
  const [followerUsers, setFollowerUsers] = useState([]);
  const [FollowingUsers, setFollowingUsers] = useState([]);
  const [isRequested, setIsRequested] = useState(false);
  const [isFollowing, setIsFolowing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingFolowUnfollow, setIsLoadingFolowUnfollow] = useState(false);

  useEffect(() => {
    loadProfile();
    loadFollower();
    loadFollowing();
  }, [params.username]);

  const loadProfile = async () => {
    isLoadingProfile(true);
    try {
      const response = await userApi.getProfile(params.username);
      setProfile(response.data);
      setPosts(response.data.posts);
      if (response.data.following_status == "following") {
        setIsFolowing(true);
        setIsRequested(false);
      } else if (response.data.following_status == "requested") {
        setIsFolowing(false);
        setIsRequested(true);
      } else {
        setIsFolowing(false);
        setIsRequested(false);
      }
    } catch (e) {
      showError(e.response.data.message || "gagal load profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  //   post gausah karena dari user post

  //   const loadPosts = () => {
  //     try {
  //     } catch (e) {
  //     } finally {
  //     }
  //   };

  const loadFollower = async () => {
    isLoadingList(true);
    try {
      const response = await userApi.getFollowerOther(params.username);
      setFollowerUsers(response.data);
    } catch (e) {
      showError(e.response.data.message || "gagal load follower");
    } finally {
      isLoadingList(false);
    }
  };

  const loadFollowing = async () => {
    isLoadingProfile(true);
    try {
      const response = await userApi.getFollowingOther(params.username);
      setFollowingUsers(response.data);
    } catch (e) {
      showError(e.response.data.message || "gagal load following");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleUnFollow = async () => {
    setIsLoadingFolowUnfollow(true);
    try {
      const response = await userApi.unFollowUser(params.username);
    } catch (e) {
      showError("gagal");
    } finally {
      setIsLoadingFolowUnfollow(false);
    }
  };

  const handleFollow = async () => {
    setIsLoadingFolowUnfollow(true);
    try {
      const response = await userApi.followUser(params.username);
    } catch (e) {
      showError("gagal");
    } finally {
      setIsLoadingFolowUnfollow(false);
    }
  };

  const canViewPost = () => {
    if (!profileUser.is_private) return true;
    if (profileUser.is_your_account) return true;
    if (profileUser.following_status == "following") return true;
    return false;
  };

  if (isLoadingProfile) {
    return (
      <>
        <center>
          <span className="spinner-border spinner-sm me-2"></span>
        </center>
      </>
    );
  }

  return (
    <>
      <div className="container py-5">
        <div className="px-5 py-4 bg-light mb-4 d-flex align-items-center justify-content-between">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <h5 className="mb-0">{profile.full_name}</h5>
              <span>{profile.username}</span>
            </div>
            <small className="mb-0 text-muted">{profile.bio}</small>
          </div>
          <div>
            {profile.is_your_account ? (
              <>
                <Link
                  to={"/create-post"}
                  className="btn btn-primary w-100 mb-2"
                >
                  + Create new post
                </Link>
              </>
            ) : (
              <>
                {" "}
                {isFollowing && (
                  <>
                    <button
                      disable={isLoadingFolowUnfollow}
                      onClick={handleFollow}
                    >
                      {" "}
                      {isLoadingFolowUnfollow
                        ? "unFollowing..."
                        : "unfollow"}{" "}
                    </button>
                  </>
                )}
                {!isFollowing &&
                  !isRequested &&
                  !profileUser.is_your_account && (
                    <>
                      <button
                        disable={isLoadingFolowUnfollow}
                        onClick={handleFollow}
                      >
                        {" "}
                        {isLoadingFolowUnfollow
                          ? "following..."
                          : "follow"}{" "}
                      </button>
                    </>
                  )}
                {!isRequested && (
                  <>
                    <button disabled>requested</button>
                  </>
                )}
              </>
            )}
            <div className="d-flex gap-3">
              <div>
                <div
                  className="profile-label"
                  onClick={() => setActiveTab("posts")}
                >
                  <b>{posts.length}</b> posts
                </div>
              </div>
              <div className="profile-dropdown">
                <div
                  className="profile-label"
                  onClick={() => setActiveTab("follower")}
                >
                  <b>{followerUsers.length}</b> followers
                </div>
                <div className="profile-list">
                  <div className="card">
                    <div className="card-body">
                      <div className="profile-user">
                        {isLoadingList ? (
                          <>
                            <span className="spinner-border spinner-sm me-2"></span>
                          </>
                        ) : (
                          <>
                            {followerUsers.map((data) => {
                              return (
                                <Link to={"/users/" + data.username}>
                                  {data.username}
                                </Link>
                              );
                            })}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="profile-dropdown">
                <div
                  className="profile-label"
                  onClick={() => setActiveTab("following")}
                >
                  <b>{FollowingUsers.length}</b> following
                </div>
                <div className="profile-list">
                  <div className="card">
                    <div className="card-body">
                      <div className="profile-user">
                        {isLoadingList ? (
                          <>
                            <span className="spinner-border spinner-sm me-2"></span>
                          </>
                        ) : (
                          <>
                            {followerUsers.map((data) => {
                              return (
                                <Link to={"/users/" + data.username}>
                                  {data.username}
                                </Link>
                              );
                            })}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          {canViewPost() ? (
            <>
              {activeTab == "posts" &&
                (posts.length > 0 ? (
                  <>
                    {posts.map((post) => {
                      return (
                        <PostCard
                          onDeletPost={() =>
                            setPosts(
                              posts.filter((data) => data.user_id != user.id),
                            )
                          }
                          post={post}
                          key={post.id}
                          showDelete={post.user_id == user.id}
                        ></PostCard>
                      );
                    })}
                  </>
                ) : (
                  <>
                    <center>
                      <h1>kosong dan belumm ada post</h1>
                    </center>
                  </>
                ))}
            </>
          ) : (
            <>
              <center>
                <h1>akun ini private</h1>
              </center>
            </>
          )}

          {activeTab == "posts" &&
            (posts.length > 0 ? (
              <>
                {posts.map((post) => {
                  return (
                    <PostCard
                      onDeletPost={() =>
                        setPosts(
                          posts.filter((data) => data.user_id != user.id),
                        )
                      }
                      post={post}
                      key={post.id}
                      showDelete={post.user_id == user.id}
                    ></PostCard>
                  );
                })}
              </>
            ) : (
              <>
                <center>
                  <h1>kosong dan belumm ada post</h1>
                </center>
              </>
            ))}

          {activeTab == "follower" && (
            <>
              {isLoadingList ? (
                <>
                  <span className="spinner-border spinner-sm me-2"></span>{" "}
                  loadng...
                </>
              ) : (
                <>
                  {followerUsers.map((data) => (
                    <UserCard
                      key={data.id}
                      onFollow={() =>
                        setFollowerUsers(
                          FollowingUsers.map((u) => data.id != u.id),
                        )
                      }
                      showFollow={data.id == user.id}
                      user={data}
                    ></UserCard>
                  ))}
                </>
              )}
            </>
          )}
          {activeTab == "follower" && (
            <>
              {isLoadingList ? (
                <>
                  <span className="spinner-border spinner-sm me-2"></span>{" "}
                  loadng...
                </>
              ) : (
                <>
                  {FollowingUsers.map((data) => (
                    <UserCard
                      key={data.id}
                      onFollow={() =>
                        setFollowerUsers(
                          FollowingUsers.map((u) => data.id != u.id),
                        )
                      }
                      showFollow={data.id == user.id}
                      user={data}
                    ></UserCard>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
