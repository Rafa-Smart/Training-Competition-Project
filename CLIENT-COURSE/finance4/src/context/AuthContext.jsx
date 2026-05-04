import { createContext, useContext, useEffect, useState } from "react";
import { data } from "react-router-dom";
import { authApi } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const dataUser = JSON.parse(localStorage.getItem("user")) || {};
    const dataToken = localStorage.getItem("token");
    if (dataToken && dataUser) {
      setUser(dataUser);
      setToken(dataToken);
    }
    setLoading(false);
  }, []);

  const loginUser = (data) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.log("gagal logout");
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  const value = {
    logout,
    loginUser,
    loading,
    user,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
