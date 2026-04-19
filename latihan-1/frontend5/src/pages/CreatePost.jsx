import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { postApi } from "../api/post";
import { showError, showSuccess } from "../utils/alert";

export default CreatePost = () => {
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { user } = useAuth();

  const handleChange = (e) => {
    if (e.target.files) {
      const userFiles = Array.from(e.target.files);
      setFiles(userFiles);

      const userPreviews = userFiles.map((data) => {
        return {
          url: URL.createObjectURL(data.file),
          file: data.name,
        };
      });

      setPreviews(userPreviews);
    }

    setCaption(e.target.value);
  };

  const removeFile = (index) => {
    const newFlles = [...files];
    const newPreviews = [...previews];

    URL.revokeObjectURL(previews[index].url);

    newFlles.splice(index, 1);
    newPreviews.splice(index, 1);

    setFiles(newFlles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async () => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new Form();
      formData.append("caption", caption);
      files.forEach((data) => {
        formData.append("attachments[]", data);
      });

      await postApi.store(formData);
      navigate("/users/" + user.username);
      showSuccess("berhasil tambah post");
    } catch (e) {
      if (e.response?.data?.status == 422) {
        // rtinya error validasi aau datanya tidka bener

        showError(e.response?.data?.status || "gagal menambah post (validasi)");
      }
      showError(e.response?.data?.status || "gagal menambah post");
    } finally {
      setIsLoading(false);
    }
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
              <form onSubmit={handleSubmit}>
                {Object.values(errors)
                  .flat()
                  .map((error) => {
                    return (
                      <div
                        role="alert"
                        className="alert alert-danger alert-dismissible fade show"
                      >
                        {error}
                        {/* hrus button typenya, soalnya biar engga otomati ke submit, karena kalo gapake tylpe ini itu nanti akan otomatis ke submit */}
                        <button
                          className="btn btn-close"
                          type="button"
                          onClick={() => setErrors({})}
                        ></button>
                      </div>
                    );
                  })}
                <div className="mb-2">
                  <label htmlFor="caption">Caption</label>
                  <textarea
                    className="form-control"
                    name="caption"
                    id="caption"
                    cols={30}
                    rows={3}
                    defaultValue={""}
                    onChange={handleChange}
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
                    onChange={handleChange}
                  />
                </div>

                <div className="container gap-3">
                  <div className="row">
                    {previews &&
                      previews.length > 0 &&
                      previews.map((preview, index) => {
                        return (
                          <>
                            <div className="col-4">
                              <div className="d-flex justify-content-between">
                                <button
                                  className="btn btn-close btn-sm"
                                  type="button"
                                  onClick={() => removeFile(index)}
                                ></button>
                                <img
                                  src={preview.url}
                                  alt="image"
                                  className="img-thumbnail"
                                  style={{
                                    objectFit: "cover",
                                    borderRadius: 2,
                                  }}
                                />
                              </div>
                            </div>
                          </>
                        );
                      })}
                  </div>
                </div>

                <div className="d-flex justify-content-between">
                  <button
                    className="btn btn-danger"
                    onClick={() => navigate(-1)}
                  >
                    cancel
                  </button>
                  {
                    <button
                      disable={isLoading}
                      type="submit"
                      className="btn btn-primary"
                    >
                      {isLoading ? "Shared..." : "Share"}
                    </button>
                  }
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
