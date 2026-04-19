import app from "./axios";

export const authApi = {
    login: (data) => app.post('/auth/login', data),
    register: (data) => app.post('/auth/register', data),
    logout: () => app.post('/auth/logout')
}