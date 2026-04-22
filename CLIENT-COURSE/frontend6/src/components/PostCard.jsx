import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiPost } from "../api/apiPost";
import { ErrorAlert, SuccessAlert } from "../utils/sweetAlert";

export default PostCard = ({ post, onDelete, showDelete }) => {
  const { user } = useAuth();

  const [isDelete, setIsDelete] = useState(false);

  const handleDelete = async () => {
    setIsDelete(true);
    try {
      await apiPost.destroyPost(post.id);
      onDelete();
      SuccessAlert("berhasil hapus post");
    } catch (e) {
      ErrorAlert("gagal mmenghapus post");
    }
    setIsDelete(false);
  };

  const BASE_URL_STORAGE = "http://localhost/storage/";
  return (
    <>
      <div className="card mb-4">
        <div className="card-header d-flex align-items-center justify-content-between bg-transparent py-3">
          {showDelete && (
            <button
              disable={isDelete}
              className="btn btn-danger"
              onClick={handleDelete}
            >
              {isDelete ? "deleting..." : "delete"}
            </button>
          )}
          <h6 className="mb-0">{post.users.username}</h6>
          <small className="text-muted">5 days ago</small>
        </div>
        <div className="card-body">
          <div className="card-images mb-2">
            {post.attachments.map((file) => {
              return (
                <>
                  <img
                    src={BASE_URL_STORAGE + file.storage_path}
                    alt="image"
                    className="w-100"
                  />
                </>
              );
            })}
          </div>
          <p className="mb-0 text-muted">
            <b>
              <Link to={"/users/" + user.username}>{user.username}</Link>
            </b>{" "}
            {post.caption}
          </p>
        </div>
      </div>
    </>
  );
};
