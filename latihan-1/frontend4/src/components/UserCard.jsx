import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate,Link } from "react-router-dom";
import { showError, showSuccess } from "../utils/alert";
import { apiUser } from "../api/user";

const UserCard = ({
  user: userData,
  showFollowButton = true,
  onFollowUpdate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user: currentUser } = useAuth();

  const navigate = useNavigate();

  const handleFollow = async () => {
    setIsLoading(true);

    try {
      await apiUser.followUser(userData.username);
      onFollowUpdate();
      showSuccess("success follow");
    } catch (error) {
      showError(error.response.data.message || "error follow");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="explore-people">
        <div className="explore-people-list">
          <div className="card mb-2">
            <div className="card-body p-2 d-flex justify-content-between">
              <Link to={"/users/" + userData.username}>
                {userData.username}
              </Link>
              {showFollowButton && (
                <button disabled={isLoading} className="btn btn-success" onClick={handleFollow}>
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-sm me 2"></span>
                    </>
                  ) : (
                    "follow"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


export default UserCard;