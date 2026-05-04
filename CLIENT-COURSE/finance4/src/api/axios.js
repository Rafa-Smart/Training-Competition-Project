import axios from "axios";

export const app = axios.create({
  baseURL: "http://localhost:8000/api/",
});

// const reqIntercept =
//   ((error) => {
//     return Promise.reject(error);
//   },
//   (request) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       request.headers.Authorization = `bearer ${token}`;
//     }
//     return request;
//   });

// const resIntercept =
//   ((error) => {
//     if (error?.response?.status == 401) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       window.location.href = "/login";
//     }
//   },
//   (response) => {
//     return response;
//   });

//   app.interceptors.request.use = reqIntercept;
//   app.interceptors.response.use = resIntercept;

// salah ya itu harusny use itu adlah fungsi yang di panggil bukan yang di assign

const reqInterceptSuccess = (request) => {
  const token = localStorage.getItem("token");
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
};
const reqInterceptError = (error) => {
  return Promise.reject(error);
};

const resInterceptSuccess =
  (
  (response) => {
    return response;
  });
const resInterceptError =
  ((error) => {
    if (error?.response?.status == 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  });

app.interceptors.request.use(reqInterceptSuccess, reqInterceptError);
app.interceptors.response.use(resInterceptSuccess,resInterceptError);
