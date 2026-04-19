import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../api/user";
import { showError, showSuccess } from "../utils/alert";

export default UserCard = ({ user, onFollow, showFollow }) => {
  const [isFollow, setIsFollow] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDelete(true);
      await userApi.followUser(user.username);
      onFollow();
      showSuccess("user brehasil di follow");
    } catch (error) {
      showError(error.response.data.message || "user gagal di follow");
    } finally {
      setIsDelete(false);
    }
  };

  return (
    <>
      <div className="card mb-2">
        {showFollow ? (
          <>
            <button>
              {isFollow ? (
                <>
                  <span className="spinner-border spinner-sm me-2"></span>{" "}
                  following...
                </>
              ) : (
                ""
              )}
            </button>
          </>
        ) : (
          <></>
        )}
        <div class="card-body p-2">
          <Link to={"/users/" + user.username} href="user-profile-private.html">
            {user.username}
          </Link>
        </div>
      </div>
    </>
  );
};
