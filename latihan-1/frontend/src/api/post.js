import api from './axios';

export const postApi = {
  // For multipart/form-data
  createPost: (formData) => {
    return api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  getPosts: (params = {}) => {
    const { page = 0, size = 10 } = params;

    // jadi disni itu ktia tmbhakan si page dan juga sizenya ini daialan
    // parameter objeknya si axios
    return api.get('/posts', { params: { page, size } });
  },
  
  deletePost: (id) => api.delete(`/posts/${id}`)
};