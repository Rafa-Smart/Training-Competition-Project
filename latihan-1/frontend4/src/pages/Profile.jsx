import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { showError } from "../utils/alert";
import { apiUser } from "../api/user";
import PostCard from "../components/PostCard";
import UserCard from "../components/UserCard";

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState({});
  const [posts, setPosts] = useState([]);
  console.log(profileUser);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isRequested, setIsRequested] = useState(false);

  const [activeTab, setActiveTab] = useState("posts");
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);

  const [loadingProfile, setIsLoadingProfile] = useState(false);
  const [loadingList, setIsLoadingList] = useState(false);
  const [loadingFollow, setIsLoadingFollow] = useState(false);
  console.log(isRequested);
  useEffect(() => {
    loadProfile();
    loadFollowers();
    loadFollowing();

    // ini waji, jadi kenapa ketika saya klik username manapun
    // kan dia alangung ubha url, nah dia itu engga load lagi useEffecnya ini, jadi disini
    // kita harus selalu baca usernamnya di dependencies
  }, [username]);

  const loadProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const response = await apiUser.getDetailUsers(username);
      console.log(response.data);
      setProfileUser(response.data);
      const user = response.data;

      setPosts(user.posts || []);

      if (user.following_status == "following") {
        setIsFollowing(true);
        setIsRequested(false);
      } else if (user.following_status == "requested") {
        setIsFollowing(false);
        setIsRequested(true);
      } else {
        setIsFollowing(false);
        setIsRequested(false);
      }
    } catch (error) {
      showError("failed load profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadFollowing = async () => {
    setIsLoadingList(true);
    try {
      const response = await apiUser.getFollowingOther(username);
      setFollowing(response.data.followings || []);
    } finally {
      setIsLoadingList(false);
    }
  };
  const loadFollowers = async () => {
    setIsLoadingList(true);
    try {
      const response = await apiUser.getFollowerOther(username);
      setFollowers(response.data.followers || []);
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleFollow = async () => {
    setIsLoadingFollow(true);
    try {
      await apiUser.followUser(username);

      if (profileUser.is_private) {
        setIsRequested(true);
      } else {
        setIsFollowing(true);
      }

      setProfileUser({
        ...profileUser,
        followers_count: profileUser.followers_count + 1,
      });
    } catch (error) {
      showError(error.response.data.message || "failed follow user");
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const handleUnFollow = async () => {
    setIsLoadingFollow(true);
    try {
      await apiUser.unFollowUser(username);

      setIsFollowing(false);
      setIsRequested(false);
      setProfileUser({
        ...profileUser,
        followers_count: profileUser.followers_count - 1,
      });
    } catch (error) {
      showError(error.response.data.message || "failed follow user");
    } finally {
      setIsLoadingFollow(false);
    }
  };

  //   disini ktia cek apakah kita bisa lihat
  const canViewPosts = () => {
    if (!profileUser.is_private) return true;
    if (profileUser.is_your_account) return true;
    if (profileUser.following_status == "following") return true;
    return false;
  };

  if (loadingProfile) {
    return (
      <>
        <span className="spinner-border spinner-sm me-2"></span>
        loading...
      </>
    );
  }

  return (
    <>
      <div className="container py-5">
        <div className="px-5 py-4 bg-light mb-4 d-flex align-items-center justify-content-between">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              {console.log(profileUser.full_name)}
              <h5 className="mb-0">{profileUser.full_name || "ss"}</h5>
              <span>{profileUser.username}</span>
            </div>
            <small className="mb-0 text-muted">{profileUser.bio}</small>
          </div>
          <div>
            {/* ini yang buat follow atau tidak */}
            {profileUser.is_your_account && (
              <>
                <Link to="/create-post">
                  <button className="btn btn-primary w-100 mb-2">
                    Create Post
                  </button>
                </Link>
              </>
            )}

            {/* ini untuk yang sudha folow dan pengen tau konsodi follow / request / unfollow */}

            {/* jika sudah kita follow -> tampil button unfollow dan ketika di klik (lagi loading) maka
            tampil unfollowing  */}
            {isFollowing && (
              <button
                className="btn btn-danger w-100 mb-2"
                onClick={handleUnFollow}
                disabled={loadingFollow}
              >
                {loadingFollow ? (
                  <>
                    <spin className="spinner-border spinner-sm me-2"></spin>{" "}
                    unfollowing...
                  </>
                ) : (
                  "unfollow"
                )}
              </button>
            )}

            {/* jika itdka kita follow dan tidak request juga
            artinya sama sekali belum di follow */}
            {!isFollowing && !isRequested && !profileUser.is_your_account && (
              <button
                className="btn btn-success w-100 mb-2"
                onClick={handleFollow}
                disabled={loadingFollow}
              >
                {loadingFollow ? (
                  <>
                    <spin className="spinner-border spinner-sm me-2"></spin>{" "}
                    following...
                  </>
                ) : (
                  "follow"
                )}
              </button>
            )}

            {/* disni ketika user setelah klik button follow
            dan ternyata dia request, maka bukan tampil button follow
            tapi tampil button requested */}

            {isRequested && (
              <button

                className="btn btn-danger w-100 mb-2"
                onClick={handleUnFollow}
                disabled={true}
              >
                requested
              </button>
            )}

            <div className="d-flex gap-3">
              <div>
                <div className="profile-label">
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => {
                      setActiveTab("posts");
                    }}
                  >
                    <b>{profileUser.posts_count}</b> posts
                  </button>
                </div>
              </div>
              <div className="profile-dropdown">
                <div className="profile-label">
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => {
                      loadFollowers();
                      setActiveTab("followers");
                    }}
                  >
                    <b>{profileUser.followers_count}</b> followers
                  </button>
                </div>
                <div className="profile-list">
                  <div className="card">
                    <div className="card-body">
                      {followers.map((follow, index) => {
                        return (
                          <>
                            <div className="profile-user">
                              <Link to={`/users/${follow.username}`}>
                                {follow.username}
                              </Link>
                            </div>
                          </>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="profile-dropdown">
                <div className="profile-label">
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => {
                      setActiveTab("followings");
                      loadFollowing();
                    }}
                  >
                    <b>{profileUser.following_count}</b> following
                  </button>
                </div>
                <div className="profile-list">
                  <div className="card">
                    <div className="card-body">
                    {console.log({following})}
                      {following.map((follow, index) => {
                        return (
                          <>
                            <div className="profile-user">
                              <Link to={`/users/${follow.username}`}>
                                {follow.username}
                              </Link>
                            </div>
                          </>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row justify-content-center">
          {canViewPosts()? (
            <>
              {activeTab === "posts" &&   (
                <>
                  {console.log({ posts })}
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        showDelete={post.user_id == currentUser.id}
                        onDeleteUpdate={() => {
                          setPosts((prev) =>
                            prev.filter((f) => f.user_id !== currentUser.id)
                          );
                        }}
                      />
                    ))
                  ) : (
                    <div className="alert alert-info">no posts yet.</div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <div className="alert alert-danger">This Account is Private.</div>
            </>
          )}

          {/* follower */}

          {activeTab == "followers" &&
            (loadingList ? (
              <>
                <span className="spinner-border spinner-sm me-2"></span>
                loading...
              </>
            ) : (
              <>
                {followers.map((user) => (
                  <UserCard
                    user={user}
                    key={user.id}
                    showFollowButton={currentUser.id !== user.id}
                  ></UserCard>
                ))}
              </>
            ))}

          {/* following */}

          {activeTab == "followings" &&
            (loadingList ? (
              <>
                <span className="spinner-border spinner-sm me-2"></span>
                loading...
              </>
            ) : (
              <>
                {following.map((user) => (
                  <UserCard
                    user={user}
                    key={user.id}
                    showFollowButton={currentUser.id !== user.id}
                  ></UserCard>
                ))}
              </>
            ))}
        </div>
      </div>
    </>
  );
};

export default Profile;
