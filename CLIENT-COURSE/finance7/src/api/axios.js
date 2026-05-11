import axios from "axios";

export const app = axios.create({
  baseURL: "http://localhost:8000/api/",
});

app.interceptors.request.use(
  (request) => {
    const token = localStorage.getItem("token");
    if (token) {
      request.headers.Authorization = "Bearer " + token;
    }
    return request;
  },
  (err) => Promise.reject(err),
);

app.interceptors.response.use(
  (response) => response,
  (err) => {
    if (err.response?.status == 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(err);
  },
);
