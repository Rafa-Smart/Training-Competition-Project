

import app from './axios.js';

export const userApi = {
    followUser: (username) => app.post(`users/${username}/follow`),
    unFollowUser: (username) => app.delete(`users/${username}/unfollow`),
    acceptUser: (username) => app.put(`users/${username}/accept`),
    getFollowers: () => app.get(`users/followers`),
    getFollowingOther: (username) => app.get(`users/${username}/following`),
    getFollowerOther: (username) => app.get(`users/${username}/follower`),
    getProfile: (username) => app.get(`users/${username}`),
    getUser: () => app.get(`users/`),
}