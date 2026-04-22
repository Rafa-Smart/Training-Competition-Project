import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Form, useNavigate } from "react-router-dom";
import { showError, showSuccess } from "../utils/alert";
import { apiPost } from "../api/post";

const CreatePost = () => {
  const [caption, setCaption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  previews.forEach((file, index) => {
    console.log(file.name);
    console.log(file.url);
  });
  const handleChangeFile = async (e) => {
    const filesUser = Array.from(e.target.files);
    setFiles(filesUser);

    // disini baru sekalian kita buat untuk previewnya
    // nanti mah ini diakhir aja

    const newPreviews = filesUser.map((file, index) => {
      return {
        name: file.name,
        url: URL.createObjectURL(file),
      };
    });

    setPreviews(newPreviews);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    const newPreviews = [...previews];

    URL.revokeObjectURL(newPreviews[index].url);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    setFiles(newFiles);
    setPreviews(newPreviews);
    console.log("tst");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const formData = new FormData();
    formData.append("caption", caption);
    files.forEach((data, index) => {
      formData.append("attachments[]", data);
    });

    try {
      await apiPost.create(formData);
      navigate(`/users/${user.username}`);
      showSuccess("success create post")
    } catch (error) {
      // console.log({data})
      if (error.response?.data?.status == 422) {
        setErrors(error.response?.data?.errors || "error create post");
      }
      showError(error.response?.data?.message || "error create post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between bg-transparent py-3">
                <h5 className="mb-0">Create new post</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {errors &&
                    Object.values(errors)
                      .flat()
                      .map((error, index) => {
                        return (
                          <>
                            <div
                              className="alert alert-danger alert-dismissible fade show"
                              role="alert"
                            >
                              {error}
                              <button
                                className="btn btn-close"
                                type="button"
                                onClick={() => setErrors({})}
                              ></button>
                            </div>
                          </>
                        );
                      })}
                  <div className="mb-2">
                    <label htmlFor="caption">Caption</label>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
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
                      accept="image/jpg,image/png,image/webp,image/jpeg,image/gif"
                      type="file"
                      className="form-control"
                      id="attachments"
                      name="attachments"
                      required={files.length === 0}
                      onChange={handleChangeFile}
                      multiple
                    />
                  </div>
                  <br></br>
                  <div className="container gap-3">
                  <div className="row">
                    {previews &&
                      previews.length > 0 &&
                      previews.map((file, index) => {
                      
                        return (
                          <>
                            <div key={file} className=" col-4">
                              <div className="d-flex justify-content-between">
                                <small>{file.name.slice(0, 10)}</small>
                                <button
                                  className="btn-close btn-sm btn"
                                  type="button"
                                  onClick={() => removeFile(index)}
                                ></button>
                              </div>
                              <img
                                src={file.url}
                                alt="image"
                                className="img-thumbnail"
                                style={{ objectFit: "cover", borderRadius: 2 }}
                              />
                            </div>
                          </>
                        );
                      })}
                      </div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <button
                      onClick={() => navigate(-1)}
                      className="btn btn-danger"
                    >
                      cancel
                    </button>
                    <button
                      disabled={isLoading}
                      type="submit"
                      className="btn btn-primary w-100"
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-sm me-2"></span>
                          
                        </>
                      ) : (
                        "create post"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePost;
