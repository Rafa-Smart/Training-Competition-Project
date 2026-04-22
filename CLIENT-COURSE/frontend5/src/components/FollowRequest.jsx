import { userApi } from "../api/user";
import { showError, showSuccess } from "../utils/alert";

export default FollowRequest = ({ follow, onAccept }) => {
  const [isAccept, setIsAccept] = useState();

  const handleAccept = async () => {
    try {
      setIsAccept(true);

      await userApi.acceptUser(follow.username);
      onAccept();
      showSuccess("berhasil terima user");
    } catch (error) {
      showError(error.response.data.message || "gagal accept");
    } finally {
      setIsAccept(false);
    }
  };

  return (
    <>
 

      <div className="card mb-2">
        <div className="card-body d-flex align-items-center justify-content-between p-2">
          <div class="card-body p-2">
            <Link
              to={"/users/" + user.username}
              href="user-profile-private.html"
            >
              {follow.username}
            </Link>
          </div>
          <button disabled={isAccept} onClick={handleAccept}>
            {isAccept ? (
              <>
                <span className="spinner-border spinner me-2"></span> confirm...
              </>
            ) : (
              "conrirm"
            )}
          </button>
        </div>
      </div>
    </>
  );
};
