import axiosInstance from './axios';

export const userAPI = {
  getUsers: async () => {
    const response = await axiosInstance.get('/users');
    return response.data;
  },

  getUserDetail: async (username) => {
    const response = await axiosInstance.get(`/users/${username}`);
    return response.data;
  },

  followUser: async (username) => {
    const response = await axiosInstance.post(`/users/${username}/follow`);
    return response.data;
  },

  unfollowUser: async (username) => {
    const response = await axiosInstance.delete(`/users/${username}/unfollow`);
    return response;
  },

  acceptFollowRequest: async (username) => {
    const response = await axiosInstance.put(`/users/${username}/accept`);
    return response.data;
  },

  getFollowers: async (username) => {
    const response = await axiosInstance.get(`/users/${username}/followers`);
    return response.data;
  },

  getFollowing: async () => {
    const response = await axiosInstance.get('/following');
    return response.data;
  },

  getFollowersSelf: async () => {
    const response = await axiosInstance.get('/followers');
    return response.data;
  }
};