import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../api/auth';
import { showError, showValidationErrors } from '../utils/alert';

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        bio: '',
        username: '',
        password: '',
        is_private: false,
    });
    const [errors, setErrors] = useState({});
    const { user, login } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            navigate(`/profile/${user.username}`);
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await register(formData);
            const { token, user: userData } = response.data;
            loginContext(token, userData);
            navigate('/');
        } catch (error) {
            if (error.response?.status === 422) {
                const errorData = error.response.data.errors;
                setErrors(errorData);
                showValidationErrors(errorData);
            } else {
                showError('Registration failed. Please try again.');
            }
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <h1 style={styles.title}>Register</h1>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label htmlFor="full_name" style={styles.label}>
                            Full Name *
                        </label>
                        <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                        {errors.full_name && (
                            <span style={styles.error}>{errors.full_name[0]}</span>
                        )}
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="bio" style={styles.label}>
                            Bio * (max 100 chars)
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            style={styles.textarea}
                            maxLength={100}
                            required
                        />
                        {errors.bio && (
                            <span style={styles.error}>{errors.bio[0]}</span>
                        )}
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="username" style={styles.label}>
                            Username * (min 3 chars)
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            style={styles.input}
                            minLength={3}
                            required
                        />
                        {errors.username && (
                            <span style={styles.error}>{errors.username[0]}</span>
                        )}
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="password" style={styles.label}>
                            Password * (min 6 chars)
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            style={styles.input}
                            minLength={6}
                            required
                        />
                        {errors.password && (
                            <span style={styles.error}>{errors.password[0]}</span>
                        )}
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="is_private"
                                checked={formData.is_private}
                                onChange={handleChange}
                                style={styles.checkbox}
                            />
                            Private Account
                        </label>
                    </div>
                    <button type="submit" style={styles.submitBtn}>
                        Register
                    </button>
                </form>
                <p style={styles.loginLink}>
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 80px)',
        backgroundColor: '#f5f5f5',
    },
    formContainer: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px',
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
        marginBottom: '1rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        padding: '0.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
    },
    textarea: {
        width: '100%',
        padding: '0.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
        minHeight: '80px',
        resize: 'vertical',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    checkbox: {
        marginRight: '0.5rem',
    },
    error: {
        color: '#dc3545',
        fontSize: '0.875rem',
        marginTop: '0.25rem',
        display: 'block',
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
    loginLink: {
        textAlign: 'center',
        marginTop: '1rem',
    },
};

export default Register;