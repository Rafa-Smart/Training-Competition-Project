import { data } from "react-router-dom";
import { app } from "./axios";

export const authApi = {
  register: (data) => app.post("auth/register", data),
  login: (data) => app.post("auth/login"),
  logout: () => app.post("auth/logout"),
};
