import { app } from "./axios";

export const authApi = {
    register:(data)=> app.post('auth/register', data),
    login:(data)=> app.post('auth/login', data),
    logout:()=> app.post('auth/logout'),
}