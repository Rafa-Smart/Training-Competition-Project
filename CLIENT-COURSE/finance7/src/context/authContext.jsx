import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [token, setToken] = useState();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const u = JSON.parse(localStorage.getItem("user"));
    const t = localStorage.getItem("token");
    setUser(u);
    setToken(t);
    setLoading(false);
  }, []);

  const loginUser = ({ token, data }) => {
    localStorage.setItem("user", JSON.stringify(data));
    localStorage.setItem("token", token);
    setUser(data);
    setToken(token);
  };
  const logout = async () => {
    try {
    } catch (e) {
      alert("gagal logout", e);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
    }
  };

  const value = {
    logout,
    loginUser,
    user,
    token,
    loading,
  };

  return <AuthContext.Provider value={value}></AuthContext.Provider>;
};

export const useAuth = useContext(AuthContext);
