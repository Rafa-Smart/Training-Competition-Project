import api from './axios';

export const getUsersNotFollowed = () => api.get('/users');
export const getDetailUser = (username) => api.get(`/users/${username}`);
export const followUser = (username) => api.post(`/users/${username}/follow`);
export const unfollowUser = (username) => api.delete(`/users/${username}/unfollow`);
export const acceptFollowRequest = (username) => api.put(`/users/${username}/accept`);
export const getFollowersSelf = () => api.get('/followers');
export const getFollowingSelf = () => api.get('/following');
export const getFollowersOther = (username) => api.get(`/users/${username}/followers`); 