import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    password: '',
    is_private: false
  });
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    const result = await register(formData);
    if (result.success) {
      navigate('/');
    } else if (result.error?.errors) {
      setErrors(result.error.errors);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Register</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className={errors.full_name ? 'error' : ''}
            />
            {errors.full_name && (
              <div className="error-message">{errors.full_name[0]}</div>
            )}
          </div>

          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
            />
            {errors.username && (
              <div className="error-message">{errors.username[0]}</div>
            )}
          </div>

          <div className="form-group">
            <label>Bio * (max 100 chars)</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              maxLength={100}
              className={errors.bio ? 'error' : ''}
            />
            <small>{formData.bio.length}/100</small>
            {errors.bio && (
              <div className="error-message">{errors.bio[0]}</div>
            )}
          </div>

          <div className="form-group">
            <label>Password * (min 6 chars)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && (
              <div className="error-message">{errors.password[0]}</div>
            )}
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_private"
                checked={formData.is_private}
                onChange={handleChange}
              />
              Private Account
            </label>
          </div>

          <button type="submit" className="btn-primary">
            Register
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;    