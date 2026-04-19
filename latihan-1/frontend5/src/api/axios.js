import axios from "axios";

const app = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// fnction untuk intercept si responsenya sebleum sampe sini

const interceptResponse =
  ((response) => {
    return response;
  },
  (error) => {
    // nh ini jika error 401

    if (error.response?.status == 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  });

// fungsi untuk intercept request

const interceptRequest =
  ((request) => {
    const token = localStorage.getItem("token");
    if (token) {
      request.headers.Authorization = "Bearer " + token;
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  });

app.interceptors.response.use(interceptResponse);
app.interceptRequest.request.use(interceptRequest);

export default app;
