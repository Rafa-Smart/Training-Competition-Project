import api from './axios';

export const createPost = (formData) => {
    return api.post('/posts', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const deletePost = (id) => api.delete(`/posts/${id}`);
export const getPosts = (params = {}) => api.get('/posts', { params });