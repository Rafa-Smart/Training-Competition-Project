import axiosInstance from './axios';

export const postAPI = {
  createPost: async (formData) => {
    const response = await axiosInstance.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getPosts: async (page = 0, size = 10) => {
    const response = await axiosInstance.get('/posts', {
      params: { page, size }
    });
    return response.data;
  },

  deletePost: async (id) => {
    const response = await axiosInstance.delete(`/posts/${id}`);
    return response;
  }
};