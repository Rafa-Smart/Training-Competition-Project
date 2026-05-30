import axios from "axios";

const app = axios.create({
  baseURL: "http://localhost:8000/api/",
  headers: {
    Accept: "application/json",
  },
});

app.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err),
);

app.interceptors.response.use(
  (response) => {
    return response;
  },
  (err) => {
    const isAuthRequest = err.config?.url?.includes("auth/login");
    if (err?.response?.status == 401 && !isAuthRequest) {
      console.log(err.response.data);
      localStorage.setItem("user", null);
      localStorage.setItem("token", null);
      window.location.href = "/";
    }
    return Promise.reject(err);
  },
);

export { app };
