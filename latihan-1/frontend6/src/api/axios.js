import axios from "axios";

export const app = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: {
    Accepted: "application/json",
    "Content-Type": "application/json",
  },
});

const interceptorReq =
  ((request) => {
    const token = localStorage.getitem("token");
    if (token) {
      request.headers.Authorization = "Bearer " + token;
    }
    return request;
  },
  (error) => Promise.reject(error));
const interceptorRes =
  ((response) => {
    return response;
  },
  (error) => {
    if (error.response?.status == 401) {
      localStorage.setItem("token", null);
      localStorage.setItem("user", null);
      window.location.href = "/login";
    }
  });

app.interceptors.request.use(interceptorReq);
app.interceptors.response.use(interceptorRes);
