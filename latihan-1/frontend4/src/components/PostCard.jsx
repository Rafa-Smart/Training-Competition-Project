import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { showConfirm, showError } from "../utils/alert";
import { apiPost } from "../api/post";
import { Link } from "react-router";

const PostCard = ({ post, showDelete, onDeleteUpdate }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  const handleDelete = async () => {
    const res = showConfirm("are you sure?", "delete post");
    if (res.isConfirmed) {
      console.log("ga kepanggil");
      return;
    }
    console.log("kepanggil delete");
    try {
      setIsDeleting(true);
      await apiPost.delete(post.id);
      onDeleteUpdate()
    } catch (error) {
      showError(error.response.data.message || "error delete post");
    } finally {
      setIsDeleting(false);
    }
  };
  const apiBaseUrl = "http://localhost:8000";
  const storageUrl = `${apiBaseUrl}/storage`;

  return (
    <>
      <div className="card mb-4">
        <div className="card-header d-flex align-items-center justify-content-between bg-transparent py-3">
          <h6 className="mb-0">{post.username}</h6>
          <small className="text-muted">5 days ago</small>
          {showDelete && (
            <>
            {console.log({showDelete})}
              <div>
                {/* tambahin is deleting disable biat nanti ga ke login lagi hahaha */}
                <button
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="btn btn-danger"
                >
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
            </>
          )}
        </div>
        <div className="card-body">
          <div className="card-images mb-2">
            {post.attachments.map((file, index) => {
              return (
                <>
                  <div key={index+2} className="w-100 d-flex justify-content-center">
                    <img
                      src={"http://localhost:8000/storage/" + file.storage_path}
                      alt="image"
                      className="w-80"
                    />
                  </div>
                </>
              );
            })}
          </div>
          <p className="mb-0 text-muted">
            <b>
              <Link to={`/users/${post.username}`}>{post.username}</Link>
            </b>{" "}
            {post.caption}
          </p>
        </div>
      </div>
    </>
  );
};
export default PostCard;
// <>
//   <div className="card mb-4">
//     <div className="card-header d-flex align-items-center justify-content-between bg-transparent py-3">
//       <h6 className="mb-0">{post.user.username}</h6>
//       <small className="text-muted">5 days ago</small>
//     </div>
// {
//     showDelete && (
//         <>
//             <div>
//                 <button onClick={handleDelete} className="btn btn-danger">
//                     {
//                         isDeleting ? <>
//                             <span className="spinner-border spinner-sm me-2"></span> deleting...
//                         </> : "delete"
//                     }
//                 </button>
//             </div>
//         </>
//     )
// }
//     <div className="card-body">
//       <div className="card-images mb-2">
//         {post.attachments &&
//           post.attachments.length > 0 &&
//           post.attachments.map((data, index) => {
//             return (
//               <>
//                 <img
//                   src={`${storageUrl}/${data.storage_path}`}
//                   alt="image"
//                   class="w-100"
//                 />
//               </>
//             );
//           })}
//       </div>
//       <p className="mb-0 text-muted">
//         <b>
//           <Link to={`/users/${post.user.username}`}>
//             post.user.username
//           </Link>
//         </b>
//         <p>{post.caption}</p>
//       </p>
//     </div>
//   </div>
// </>
