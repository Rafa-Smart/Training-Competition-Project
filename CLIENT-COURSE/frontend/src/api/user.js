import api from './axios';

export const userApi = {
  getUsers: () => api.get('/users'),
  getUserDetail: (username) => api.get(`/users/${username}`),
  followUser: (username) => api.post(`/users/${username}/follow`),
  unfollowUser: (username) => api.delete(`/users/${username}/unfollow`),
  acceptFollowRequest: (username) => api.put(`/users/${username}/accept`),
  getFollowers: (username) => {
    if (username) {
      return api.get(`/users/${username}/followers`);
    }
    return api.get('/followers');
  },
  getFollowing: () => api.get('/following'),
  getFollowingOther: (username) => api.get(`/users/${username}/following`)
};