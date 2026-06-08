import app from "./axios";

const authApi = {
    register:(data) => app.post('auth/register'),
    login:(data) => app.post('auth/login'),
    logout:() => app.post('auth/logout')
}

export {
    authApi
}