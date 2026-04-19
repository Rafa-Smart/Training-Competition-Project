// import { useState, useEffect } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import { userApi, postApi } from '../api';
// import { useAuth } from '../context/AuthContext';
// import PostCard from '../components/PostCard';
// import UserCard from '../components/UserCard';

// const Profile = () => {
//   const { username } = useParams();
//   const navigate = useNavigate();
//   const { user: currentUser } = useAuth();

//   const [profileUser, setProfileUser] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [followers, setFollowers] = useState([]);
//   const [following, setFollowing] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isFollowing, setIsFollowing] = useState(false);
//   const [isRequested, setIsRequested] = useState(false);
//   const [followLoading, setFollowLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState('posts');
//   useEffect(() => {
//     const loadProfile = async () => {
//       setIsLoading(true);
//       try {
//         const response = await userApi.getUserDetail(username);
//         const userData = response.data;
//         setProfileUser(userData);
//         setPosts(userData.posts || []);

//         // Check follow status
//         if (userData.following_status === 'following') {
//           setIsFollowing(true);
//           setIsRequested(false);
//         } else if (userData.following_status === 'requested') {
//           setIsFollowing(false);
//           setIsRequested(true);
//         } else {
//           setIsFollowing(false);
//           setIsRequested(false);
//         }

//         // Load followers
//         if (userData.followers_count > 0) {
//           const followersRes = await userApi.getFollowers(username);
//           setFollowers(followersRes.data.followers || []);
//         }

//         // Load following
//         if (userData.following_count > 0) {
//           const followingRes = await userApi.getFollowingOther(username);
//           console.log(followingRes)
//           console.log('plis liat')
//           console.log(followingRes.data.followings)
//           setFollowing(followingRes.data.followings || []);
//         }

//       } catch (error) {
//         console.error('Error loading profile:', error);
//         if (error.response?.status === 404) {
//           navigate('/not-found');
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadProfile();
//   }, [username, navigate]);

//   const handleFollow = async () => {
//     if (!currentUser) {
//       navigate('/login');
//       return;
//     }

//     setFollowLoading(true);
//     try {
//       await userApi.followUser(username);
//       setIsRequested(profileUser?.is_private);
//       setIsFollowing(!profileUser?.is_private);

//       // Update user data
//       if (profileUser) {
//         setProfileUser({
//           ...profileUser,
//           followers_count: profileUser.followers_count + 1
//         });
//       }
//     } catch (error) {
//       console.error('Follow error:', error);
//       alert(error.response?.data?.message || 'Failed to follow user');
//     } finally {
//       setFollowLoading(false);
//     }
//   };

//   const handleUnfollow = async () => {
//     setFollowLoading(true);
//     try {
//       await userApi.unfollowUser(username);
//       setIsFollowing(false);
//       setIsRequested(false);

//       // Update user data
//       if (profileUser) {
//         setProfileUser({
//           ...profileUser,
//           followers_count: profileUser.followers_count - 1
//         });
//       }
//     } catch (error) {
//       console.error('Unfollow error:', error);
//       alert(error.response?.data?.message || 'Failed to unfollow user');
//     } finally {
//       setFollowLoading(false);
//     }
//   };

//   const handlePostDelete = (postId) => {
//     setPosts(posts.filter(post => post.id !== postId));
//   };

//   const canViewPosts = !profileUser?.is_private ||
//                       profileUser?.following_status === 'following' ||
//                       profileUser?.is_your_account;

//   if (isLoading) {
//     return (
//       <div className="container mt-5">
//         <div className="row justify-content-center">
//           <div className="col-md-8 text-center">
//             <div className="spinner-border text-primary" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!profileUser) {
//     return null;
//   }

//   return (
//     <div className="container mt-4">
//       {/* Profile Header */}
//       <div className="card mb-4 shadow-sm">
//         <div className="card-body">
//           <div className="row">
//             <div className="col-md-3 text-center">
//               <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width: '100px', height: '100px' }}>
//                 <span className="text-white fw-bold display-6">
//                   {profileUser.username?.charAt(0).toUpperCase()}
//                 </span>
//               </div>
//             </div>

//             <div className="col-md-9">
//               <div className="d-flex justify-content-between align-items-start mb-3">
//                 <div>
//                   <h2 className="mb-1">{profileUser.full_name}</h2>
//                   <p className="text-muted">@{profileUser.username}</p>
//                 </div>

//                 {!profileUser.is_your_account && currentUser && (
//                   <div>
//                     {isFollowing ? (
//                       <button
//                         className="btn btn-outline-danger"
//                         onClick={handleUnfollow}
//                         disabled={followLoading}
//                       >
//                         {followLoading ? 'Unfollowing...' : 'Unfollow'}
//                       </button>
//                     ) : isRequested ? (
//                       <button className="btn btn-secondary" disabled>
//                         Requested
//                       </button>
//                     ) : (
//                       <button
//                         className="btn btn-primary"
//                         onClick={handleFollow}
//                         disabled={followLoading}
//                       >
//                         {followLoading ? 'Following...' : 'Follow'}
//                       </button>
//                     )}
//                   </div>
//                 )}

//                 {profileUser.is_your_account && (
//                   <Link to="/create-post" className="btn btn-primary">
//                     Create Post
//                   </Link>
//                 )}
//               </div>

//               <p className="mb-3">{profileUser.bio}</p>

//               <div className="row text-center mb-3">
//                 <div className="col">
//                   <strong>{posts.length}</strong>
//                   <div className="text-muted">Posts</div>
//                 </div>
//                 <div className="col">
//                   <strong>{profileUser.followers_count}</strong>
//                   <div className="text-muted">Followers</div>
//                 </div>
//                 <div className="col">
//                   <strong>{profileUser.following_count}</strong>
//                   <div className="text-muted">Following</div>
//                 </div>
//               </div>

//               {profileUser.is_private && !profileUser.is_your_account &&
//                !isFollowing && !isRequested && (
//                 <div className="alert alert-warning">
//                   <i className="bi bi-lock-fill me-2"></i>
//                   This account is private. Follow to see their posts.
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <ul className="nav nav-tabs mb-4">
//         <li className="nav-item">
//           <button
//             className={`nav-link ${activeTab === 'posts' ? 'active' : ''}`}
//             onClick={() => setActiveTab('posts')}
//           >
//             Posts
//           </button>
//         </li>
//         <li className="nav-item">
//           <button
//             className={`nav-link ${activeTab === 'followers' ? 'active' : ''}`}
//             onClick={() => setActiveTab('followers')}
//           >
//             Followers ({profileUser.followers_count})
//           </button>
//         </li>
//         <li className="nav-item">
//           <button
//             className={`nav-link ${activeTab === 'following' ? 'active' : ''}`}
//             onClick={() => setActiveTab('following')}
//           >
//             Following ({profileUser.following_count})
//           </button>
//         </li>
//       </ul>

//       {/* Tab Content */}
//       <div className="tab-content">
//         {activeTab === 'posts' && (
//           <div>
//             {!canViewPosts ? (
//               <div className="alert alert-info">
//                 <i className="bi bi-lock-fill me-2"></i>
//                 The account is private. Follow to see their posts.
//               </div>
//             ) : posts.length === 0 ? (
//               <div className="alert alert-info">
//                 No posts yet.
//               </div>
//             ) : (
//               <div className="row">
//                 {posts.map((post) => (
//                   <div className="col-12" key={post.id}>
//                     <PostCard
//                       post={post}
//                       onDelete={handlePostDelete}
//                       showDelete={profileUser.is_your_account}
//                     />
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'followers' && (
//           <div>
//             {followers.length === 0 ? (
//               <div className="alert alert-info">No followers yet.</div>
//             ) : (
//               <div className="row">
//                 {followers.map((follower) => (
//                   <div className="col-md-6 mb-3" key={follower.id}>
//                     <UserCard user={follower} showFollowButton={false} />
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'following' && (
//           <div>
//           {console.log('ini di bawah liat')}
//           {console.log(following.length)}
//           {console.log(following)}
//             {following.length === 0 ? (
//               <div className="alert alert-info">Not following anyone yet.</div>
//             ) : (
//               <div className="row">
//                 {following.map((followingUser) => (

//                   <div className="col-md-6 mb-3" key={followingUser.id}>
//               {console.log('coba liat lagi ya')}
//               {console.log(following)}
//                     <UserCard user={followingUser} />
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Profile;

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { userApi } from "../api";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import UserCard from "../components/UserCard";

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // ===== STATE UTAMA =====
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);

  // ===== STATE FOLLOW =====
  const [isFollowing, setIsFollowing] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // ===== STATE TAB =====
  const [activeTab, setActiveTab] = useState("posts");
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);

  // ===== LOADING =====
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingList, setLoadingList] = useState(false);

  // =========================
  // LOAD PROFILE
  // =========================
  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    setLoadingProfile(true);

    try {
      const res = await userApi.getUserDetail(username);
      const user = res.data;

      setProfileUser(user);
      setPosts(user.posts || []);

      if (user.following_status === "following") {
        setIsFollowing(true);
        setIsRequested(false);
      } else if (user.following_status === "requested") {
        setIsFollowing(false);
        setIsRequested(true);
      } else {
        setIsFollowing(false);
        setIsRequested(false);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        navigate("/not-found");
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  // =========================
  // LOAD FOLLOWERS
  // =========================
  const loadFollowers = async () => {
    setLoadingList(true);
    try {
      const res = await userApi.getFollowers(username);
      setFollowers(res.data.followers || []);
    } finally {
      setLoadingList(false);
    }
  };

  // =========================
  // LOAD FOLLOWINGS
  // =========================
  const loadFollowings = async () => {
    setLoadingList(true);
    try {
      const res = await userApi.getFollowingOther(username);
      setFollowings(res.data.followings || []);
    } finally {
      setLoadingList(false);
    }
  };

  // =========================
  // FOLLOW
  // =========================
  const handleFollow = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setFollowLoading(true);

    try {
      await userApi.followUser(username);

      if (profileUser.is_private) {
        setIsRequested(true);
      } else {
        setIsFollowing(true);
      }

      // nah disni kebalikannya, jadi ang bia nambah itu hanya ektika orang yang belum follow

      // /itu yang atas salah

      setProfileUser({
        ...profileUser,
        followers_count: profileUser.followers_count + 1,
      });
    } finally {
      setFollowLoading(false);
    }
  };

  // =========================
  // UNFOLLOW
  // =========================
  const handleUnfollow = async () => {
    setFollowLoading(true);

    try {
      await userApi.unfollowUser(username);
      setIsFollowing(false);
      setIsRequested(false);

      // nah disni kit harus sudha jadi following dia dulu
      // agar ektiak kitpas requested lalu kita unfollow, dia tidak akna di kurang
      // karenaakita msih status request, belum following

      // nah ini

      // itu salah semua ya, mening ktia bedakan aja hadnlenya, karena kenaa request itu ketika kita klik dia akn kurang
      // /karena dia pake handle unfollow yang kurangi follow

      setProfileUser({
        ...profileUser,
        followers_count: profileUser.followers_count - 1,
      });
    } finally {
      setFollowLoading(false);
    }
  };

  // disini ktia buat ketik batal untuk request

  function handleUnRequest() {
    setIsRequested(false);
  }

  // =========================
  // VIEW PERMISSION
  // =========================
  const canViewPosts = () => {
    if (!profileUser.is_private) return true;
    if (profileUser.is_your_account) return true;
    if (profileUser.following_status === "following") return true;
    return false;
  };

  // =========================
  // RENDER
  // =========================
  if (loadingProfile) {
    return (
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* ===== PROFILE HEADER ===== */}
      <div className="card mb-4">
        <div className="card-body d-flex justify-content-between">
          <div>
            <h3>{profileUser.full_name}</h3>
            <p>@{profileUser.username}</p>
            <p>{profileUser.bio}</p>

            <div className="d-flex gap-3">
              <span>{posts.length} Posts</span>
              <span>{profileUser.followers_count} Followers</span>
              <span>{profileUser.following_count} Following</span>
            </div>
          </div>

          {/* OKE KITA BELUM BERHAISL UNTUK MEMBUAT FITUR UNREQUEST
        JADI KALO MAU UN REQUEST HARU BUT DULU DI BACKENDNY, KITA HAPUS KOLOM
        FOLOWS YANG KITA ITU REQUEST  */}

          {!profileUser.is_your_account && (
            <div>
              {/* jadi ini tuh, kalo kita sudah pernah follow
            nah berati dia defualtnya itu follow, karena folowloading ini pasti false, keculi di klik
            dan ketika di klik maka dia kan otomatis akan menjadi unfollow */}
              {isFollowing && (
                <button
                  className="btn btn-danger"
                  onClick={handleUnfollow}
                  disabled={followLoading}
                >
                  {followLoading ? "Unfollowing..." : "Unfollow"}
                </button>
              )}

              {/* ini ketika kita tidak follow dan juga ketika kita mau follow tidak rewuested
              defaultnya itu requested api tapi ketika kita klik lagi, itukan akna menjadi unfolow */}

              {isRequested && (
                <button className="btn btn-secondary" disabled>
                  requested
                </button>
              )}

              {/* ini ketika kita tidk follow dan juga tidak request, defaultya itu berati dia adalah
              follow, karena belum kita follow */}

              {!isFollowing && !isRequested && (
                <button
                  className="btn btn-primary"
                  onClick={handleFollow}
                  disabled={followLoading}
                >
                  {followLoading ? "Following..." : "Follow"}
                </button>
              )}
            </div>
          )}

          {profileUser.is_your_account && (
            <Link to="/create-post">
              <button className="btn btn-primary">Create Post</button>
            </Link>
          )}
        </div>
      </div>

      {/* ===== TAB ===== */}
      <div className="mb-3 d-flex">
        <button
          onClick={() => setActiveTab("posts")}
          className={`btn btn-outline-primary p-1 me-2 nav-link ${
            activeTab == "posts" ? "active" : ""
          }`}
        >
          Posts
        </button>

        <button
          onClick={() => {
            setActiveTab("followers");
            loadFollowers();
          }}
          className={`btn btn-outline-primary p-2 me-2 nav-link ${
            activeTab == "followers" ? "active" : ""
          }`}
        >
          Followers
        </button>

        <button
          onClick={() => {
            setActiveTab("following");
            loadFollowings();
          }}
          className={`btn btn-outline-primary p-1 me-2 nav-link ${
            activeTab == "following" ? "active" : ""
          }`}
        >
          Following
        </button>
      </div>

      {/* ===== CONTENT ===== */}
      {activeTab === "posts" && (
        <>
          {!canViewPosts() && (
            <div className="alert alert-warning">Private Account</div>
          )}
          {canViewPosts() &&
            posts.map((post) => {
              console.log(post);
               return <PostCard key={post.id} post={post} showDelete={post.user_id == currentUser.id} />;
            })}
        </>
      )}

      {activeTab === "followers" &&
        (loadingList ? (
          <div>Loading...</div>
        ) : (
          followers.map((user) => <UserCard key={user.id} user={user} />)
        ))}

      {activeTab === "following" &&
        (loadingList ? (
          <div>Loading...</div>
        ) : (
          followings.map((user) => <UserCard key={user.id} user={user} />)
        ))}
    </div>
  );
};

export default Profile;
