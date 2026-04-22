import api from './api';

export const userService = {
  async getUserProfile(username) {
    return api.get(`/users/${username}`);
  },

  async getUsersNotFollowed() {
    return api.get('/users');
  },

  async followUser(username) {
    return api.post(`/users/${username}/follow`);
  },

  async unfollowUser(username) {
    return api.delete(`/users/${username}/unfollow`);
  },

  async getFollowing() {
    return api.get('/following');
  },

  async getFollowers(username) {
    return api.get(`/users/${username}/followers`);
  },

  async acceptFollowRequest(username) {
    return api.put(`/users/${username}/accept`);
  },

  async getFollowRequests() {
    // We'll implement this by filtering followers with is_requested: true
    const response = await api.get('/following');
    return {
      data: {
        follow_requests: response.data.following.filter(user => user.is_requested)
      }
    };
  },
};