import axios from 'axios';


const app = axios.create({
    baseURL:'http://localhost:8000/api/v1',
    headers:{
        "Content-Type":'application/json',
        'Accept':"application/json"
    }
})


app.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response?.status == 401){
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            window.location.href = '/login'
        }
    return Promise.reject(error);
    }
)


app.interceptors.request.use(
    (req) => {
        const token = localStorage.getItem("token");
        if(token){
            req.headers.Authorization = `Bearer ${token}`
        }
        return req
    },
    (error) => Promise.reject(error)

)

export default app;