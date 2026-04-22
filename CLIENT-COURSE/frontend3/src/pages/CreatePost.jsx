import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../api/post';
import { showAlert } from '../utils/alert';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    caption: '',
    attachments: []
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      attachments: files
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('caption', formData.caption);
    
    formData.attachments.forEach((file, index) => {
      formDataToSend.append(`attachments[${index}]`, file);
    });

    try {
      await postAPI.createPost(formDataToSend);
      showAlert('success', 'Post created successfully!');
      navigate('/');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        showAlert('error', 'Error creating post');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-page">
      <div className="create-post-container">
        <h2>Create New Post</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Caption *</label>
            <textarea
              name="caption"
              value={formData.caption}
              onChange={handleChange}
              className={errors.caption ? 'error' : ''}
              rows="4"
              placeholder="What's on your mind?"
            />
            {errors.caption && (
              <div className="error-message">{errors.caption[0]}</div>
            )}
          </div>

          <div className="form-group">
            <label>Attachments * (Select multiple images)</label>
            <input
              type="file"
              onChange={handleFileChange}
              multiple
              accept="image/*"
              className={errors.attachments ? 'error' : ''}
            />
            {errors.attachments && (
              <div className="error-message">
                {errors.attachments[0] || 'Invalid file type'}
              </div>
            )}
            
            {formData.attachments.length > 0 && (
              <div className="selected-files">
                <p>Selected files: {formData.attachments.length}</p>
                <ul>
                  {formData.attachments.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;