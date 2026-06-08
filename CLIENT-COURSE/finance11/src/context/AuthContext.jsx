import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setuser] = useState();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState();

  useEffect(() => {
    const dataUser = localStorage.getItem("user");
    const dataToken = localStorage.getItem("token");
    if (dataUser && dataToken) {
      setuser(JSON.parse(dataUser));
      setToken(dataToken);
    }
    setLoading(false);
  }, []);

  const loginUser = (userData, tokenData) => {
    if (!userData || !tokenData) console.log("data kosong");
    setUSer(userData);
    setToken(tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);
    window.location.href = "/";
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.log(e);
    } finally {
      setUSer(null);
      setToken(null);
      localStorage.setItem("user", null);
      localStorage.setItem("token", null);
      window.location.href = '/login'
    }
  };

  const value = {
    user, token, loading, loginUser, logout
  }
  return <AuthContext.Provider value={value}></AuthContext.Provider>
};
export default AuthProvider;

export const  useAuth = () => useContext(AuthContext);