import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const userData = JSON.parse(localStorage.getItem("user")) || {};
    const token = localStorage.getItem("token");
    if (userData && token) {
      setToken(token);
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const loginUser = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", JSON.stringify(token));
    setUser(userData);
    setToken(token);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      alert("gagal logout", e);
    } finally {
      setUser({});
      setToken("");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const value = {
    loginUser,
    logout,
    loading,
    user,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
