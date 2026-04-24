import axios from "axios";

export const app = axios.create({
  baseURL: "http://localhost:8000/api/v1/",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const reqIntercept =
  ((request) => {
    const token = localStorage.getItem("token");
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  },
  (error) => {
    Promise.reject(error);
  });

const resIntercept =
  ((response) => {
    return response;
  },
  (error) => {
    if (error.response?.status == 401) {
      localStorage.setItem("token", null);
      localStorage.setItem("user", null);
      window.location.href = "/";
    }
  });


  app.interceptors.request.use(reqIntercept)
  app.interceptors.response.use(resIntercept)