import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { showConfirm, showError, showSuccess } from "../utils/alert";
import { postApi } from "../api/post";
export default PostCard = ({ post, onDeletPost, showDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  const handleDelete = async (id) => {
    const response = await showConfirm("delete?", "delete");
    if (response.isConfirmed) {
      try {
        setIsDeleting(true);
        await postApi.delete(id);
        onDeletPost();
        await showSuccess("hapus berhasil");
      } catch (err) {
        showError("gagal hapus post");
      } finally {
        setIsDeleting(false);
      }
    }

    return;
  };

  const STORAGE = "http://localohst:8000/storage/";

  return (
<div className="col-md-4">
      <div className="card mb-4">
        <div className="card-body">
          <div className="card-images mb-2">
            {post.attachments.map((data) => {
              return (
                <img
                  src={STORAGE + data.storage_path}
                  alt="image"
                  className="w-100"
                />
              );
            })}
          </div>
          <Link to={"/users/" + post.users.username}>
            {post.users.username}
          </Link>
          <p className="mb-0 text-muted">{post.caption}</p>
          <button>
            {isDeleting ? (
              <>
                <span className="spinner-border spinner-sm me-2"></span>{" "}
                deleting...
              </>
            ) : (
              "delete"
            )}
          </button>
        </div>
</div>
    </div>
  );
};
