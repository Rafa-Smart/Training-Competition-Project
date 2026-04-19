import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { apiPost } from "../api/apiPost";
import { SuccessAlert } from "../utils/sweetAlert";

export default CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreate, setIsCreate] = useState(false);
  const [Errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [caption, setCaption] = useState();

  const handleChange = (e) => {
    if (e.target.files) {
      const filesData = e.target.files;
      setFiles(filesData);
      setPreviews(
        files.map((file) => {
          return {
            url: URL.createObjectURL(file),
            file_name: file.name,
          };
        }),
      );
      return;
    }

    setCaption(e.target.value);
  };

  const removePreview = (index) => {
    const newPreviews = [...previews];
    const newFiles = [...files];

    URL.revokeObjectURL(files[index].url);
    newPreviews.spile(index, 1);
    newPreviews.spile(index, 1);

    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreate(true);
    setErrors({});
    try {
      const formData = new FormData();

      formData.append("caption", caption);

      files.forEach((file) => {
        formData.append("attachments[]", file);
      });

      await apiPost.storePost(formData);

      navigate(-1);
      SuccessAlert('berhasil create post')
    } catch (e) {
      if (e.response?.data?.status == 422) {
        setErrors(e.response?.data?.errors || {});
      }
      ErrorAlert(error.response?.data?.message || "error create post");
    }

    setIsCreate(false);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between bg-transparent py-3">
              <h5 className="mb-0">Create new post</h5>
            </div>
            <div className="card-body">
              <form action="my-profile.html">
                <div className="mb-2">
                  <label htmlFor="caption">Caption</label>
                  <textarea
                    className="form-control"
                    name="caption"
                    id="caption"
                    cols={30}
                    rows={3}
                    defaultValue={""}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="attachments">Image(s)</label>
                  <input
                    type="file"
                    className="form-control"
                    id="attachments"
                    name="attachments"
                    multiple
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Share
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
