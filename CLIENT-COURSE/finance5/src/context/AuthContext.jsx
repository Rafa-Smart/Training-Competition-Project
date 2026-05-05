import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = () => {
  const [user, setUser] = useState();
  const [token, setToken] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("user")) || {});
    setToken(localStorage.getItem("token") || "");
    setLoading(false);
  }, []);

  const loginUser = (userData, tokenData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);
    setUser(userData);
    setToken(tokenData);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      alert(e);
      console.log("error");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser({});
      setToken("");
    }
  };

  const value = {
    loginUser,
    logout,
    user,
    token,
    loading,
  };

  return <AuthContext.Provider value={value}></AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
