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
  (error) => {
    return Promise.reject(error);
  },
);

app.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status == 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
