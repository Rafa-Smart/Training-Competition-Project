


import app from './axios.js'

export const authApi = {
    register: (data) => app.post('/auth/register', data),
    login: (data) => app.post('/auth/login', data),
    logout: () => app.post('/auth/logout')
}