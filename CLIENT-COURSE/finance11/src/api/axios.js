import axios from "axios";

const app = axios.create({
    baseURL:'http://localhost:8000/api/',
    headers:{
        'Content-Type':"application/json",
        "Accept":"application/json"
    }
})

app.interceptors.request.use((config) =>{
    const token = localStorage.getItem('token');
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
}, (error) => {
    return Promise.reject(error)
})

app.interceptors.response.use((response) => {
    return response;
}, (error) => {
    const isLogin = error?.url?.includes('auth/login');

    if(error?.response?.status == 401 && !isLogin){
        localStorage.setItem('user', null)
        localStorage.setItem('token', null)
        window.location.href = '/'
    }
    return Promise.reject(error)
})

export default app;