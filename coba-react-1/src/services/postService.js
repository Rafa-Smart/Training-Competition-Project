import api from './api';

export const postService = {
  async createPost(formData) {
    return api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async getPosts(page = 0, size = 10) {
    return api.get('/posts', {
      params: { page, size },
    });
  },

  async deletePost(id) {
    return api.delete(`/posts/${id}`);
  },
};