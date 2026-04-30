import axios from "axios";


export const app = axios.create({
    baseURL:"http://localhost:8000/api",
    headers: {
        'Accept':"application/json",
        "Content-Type":"application/json"
    }
})

const interceptReq = ((request) => {
    const token = localStorage.getItem('token');
    if(token){
        request.headers.Authorization = 'Bearer '+token;
    }   
    return request;
}, (error) => {
    return Promise.reject(error)
})


const interceptRes = ((response) =>{
    return response
},(error)=>{
    if(error?.response?.status == 401){
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login'
    }
    return Promise.reject(error)
})


app.interceptors.request.use = interceptReq;
app.interceptors.response.use = interceptRes;