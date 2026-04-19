import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPost } from '../api/post';
import { showError, showSuccess, showValidationErrors } from '../utils/alert';

const CreatePost = () => {
    const [caption, setCaption] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(files);
        if (errors.attachments) {
            setErrors({
                ...errors,
                attachments: null,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (attachments.length === 0) {
            showError('Please select at least one image');
            return;
        }

        const formData = new FormData();
        formData.append('caption', caption);
        attachments.forEach((file) => {
            formData.append('attachments[]', file);
        });

        try {
            setLoading(true);
            await createPost(formData);
            showSuccess('Post created successfully!');
            navigate('/');
        } catch (error) {
            if (error.response?.status === 422) {
                const errorData = error.response.data.errors;
                setErrors(errorData);
                showValidationErrors(errorData);
            } else {
                showError('Failed to create post. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <h1 style={styles.title}>Create New Post</h1>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label htmlFor="caption" style={styles.label}>
                            Caption *
                        </label>
                        <textarea
                            id="caption"
                            value={caption}
                            onChange={(e) => {
                                setCaption(e.target.value);
                                if (errors.caption) {
                                    setErrors({
                                        ...errors,
                                        caption: null,
                                    });
                                }
                            }}
                            style={styles.textarea}
                            rows="4"
                            required
                        />
                        {errors.caption && (
                            <span style={styles.error}>{errors.caption[0]}</span>
                        )}
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="attachments" style={styles.label}>
                            Images * (png, jpg, jpeg, webp, gif)
                        </label>
                        <input
                            type="file"
                            id="attachments"
                            multiple
                            accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                            onChange={handleFileChange}
                            style={styles.fileInput}
                        />
                        {errors.attachments && (
                            <span style={styles.error}>{errors.attachments[0]}</span>
                        )}
                        {attachments.length > 0 && (
                            <div style={styles.previewContainer}>
                                <p>Selected files: {attachments.length}</p>
                                <div style={styles.previewGrid}>
                                    {attachments.map((file, index) => (
                                        <div key={index} style={styles.previewItem}>
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${index + 1}`}
                                                style={styles.previewImage}
                                            />
                                            <span style={styles.fileName}>
                                                {file.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        style={styles.submitBtn}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Post'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 80px)',
        backgroundColor: '#f5f5f5',
        padding: '2rem',
    },
    formContainer: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '600px',
    },
    title: {
        textAlign: 'center',
        marginBottom: '2rem',
        color: '#333',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    formGroup: {
        marginBottom: '1.5rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: 'bold',
    },
    textarea: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
        fontFamily: 'inherit',
        resize: 'vertical',
    },
    fileInput: {
        width: '100%',
        padding: '0.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
    },
    error: {
        color: '#dc3545',
        fontSize: '0.875rem',
        marginTop: '0.25rem',
        display: 'block',
    },
    previewContainer: {
        marginTop: '1rem',
    },
    previewGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: '1rem',
        marginTop: '0.5rem',
    },
    previewItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    previewImage: {
        width: '100px',
        height: '100px',
        objectFit: 'cover',
        borderRadius: '4px',
        border: '1px solid #ddd',
    },
    fileName: {
        fontSize: '0.75rem',
        marginTop: '0.25rem',
        textAlign: 'center',
        wordBreak: 'break-all',
    },
    submitBtn: {
        backgroundColor: '#28a745',
        color: 'white',
        padding: '0.75rem',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
        marginTop: '1rem',
    },
};

export default CreatePost;