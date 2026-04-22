import app from "./axios";


export const apiUser = {
    followUser: (username) => app.post(`/users/${username}/follow`),
    unFollowUser: (username) => app.delete(`/users/${username}/unfollow`),
    getFollowing: () => app.get("/following"),
    getFollower: () => app.get("/followers"),
    getFollowingOther: (username) => app.get(`/users/${username}/following`),
    getFollowerOther: (username) => app.get(`/users/${username}/followers`),
    getUsers: () => app.get('/users'),
    getDetailUsers: (username) => app.get(`/users/${username}`),
    acceptRequest: (username) => app.put(`/users/${username}/accept`)
}