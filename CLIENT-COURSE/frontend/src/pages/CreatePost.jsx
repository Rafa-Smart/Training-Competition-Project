import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postApi } from '../api';
import { useAuth } from '../context/AuthContext';

// ini wwajib di baca https://chatgpt.com/c/69592318-1dbc-8323-911d-a89d3f692c4d

const CreatePost = () => {
  const [caption, setCaption] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    
    // Create previews
    const newPreviews = selectedFiles.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    setPreviews(newPreviews);
  };

  const removeFile = (index) => {
  //     5.1 Clone Array (WAJIB DI REACT)
  // const newFiles = [...files];
  // const newPreviews = [...previews];
  // Kenapa?
  // React tidak boleh mengubah state langsung
  // Harus pakai salinan

    // jadi kita itu btuh melakukna clone, karena pas di hapus nanti kita akna  taruh hasil
    // nya itu di setFIlesya dan setpreviews nya

    const newFiles = [...files];
    const newPreviews = [...previews];
    
    URL.revokeObjectURL(newPreviews[index].url);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const formData = new FormData();
    formData.append('caption', caption);
    files.forEach(file => {
      formData.append('attachments[]', file);
    });

    try {
      await postApi.createPost(formData);
      navigate(`/users/${user.username}`);
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        setErrors({ general: error.response?.data?.message || 'Failed to create post' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = caption.trim() !== '' && files.length > 0;

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Create New Post</h2>
              
              {errors.general && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {errors.general}
                  <button type="button" className="btn-close" onClick={() => setErrors({})}></button>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                {
                  Object.values(errors).flat().map((value, index) => {
                    return (
                      <div className='alert alert-dismissible fade show alert-danger'>
                        {value}
                        <button className='btn btn-close' type='button' onClick={() => setErrors({})} ></button>
                      </div>
                    )
                  })
                }


                <div className="mb-3">
                  <label htmlFor="caption" className="form-label">Caption *</label>
                  <textarea
                    className={`form-control ${errors.caption ? 'is-invalid' : ''}`}
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows="3"
                    required
                  />
                  {errors.caption && (
                    <div className="invalid-feedback">{errors.caption[0]}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="attachments" className="form-label">Attachments *</label>
                  <input
                    type="file"
                    className={`form-control ${errors.attachments ? 'is-invalid' : ''}`}
                    id="attachments"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleFileChange}
                    required={files.length === 0}
                  />
                  <div className="form-text">
                    Supported formats: JPG, JPEG, PNG, WEBP, GIF
                  </div>
                  {errors.attachments && (
                    <div className="invalid-feedback">{errors.attachments[0]}</div>
                  )}
                </div>
                
                {/* File Previews */}
                {previews.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label">Selected Files:</label>
                    <div className="row">
                      {previews.map((preview, index) => (
                        <div className="col-md-4 mb-2" key={index}>
                          <div className="card">
                            <img 
                              src={preview.url} 
                              alt={preview.name} 
                              className="card-img-top"
                              style={{ height: '150px', objectFit: 'cover' }}
                            />
                            <div className="card-body p-2">
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-truncate" title={preview.name}>
                                  {preview.name}
                                </small>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => removeFile(index)}
                                >
                                  <i className="bi bi-x"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="d-flex justify-content-between">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </button>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading || !isFormValid}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating...
                      </>
                    ) : (
                      'Create Post'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;