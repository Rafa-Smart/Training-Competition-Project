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
  (error) => Promise.reject(error),
);

app.interceptors.response.use(
  (error) => {
    if (error?.response?.status == 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
  (response) => {
    return response;
  },
);
