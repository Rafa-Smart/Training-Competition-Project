import { createContext, use, useContext, useEffect, useState } from "react";
import { apiUser } from "../api/user";
import { authApi } from "../api/auth";
import { Navigate, useNavigate } from "react-router";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // disni kita ambil dulu suernyad ari local storage
  useEffect(() => {
    const userStore = localStorage.getItem("user");

    if(!userStore || userStore == undefined){
        navigate('/login')
        return ;
    }

    if (userStore) {
      // ini tuh mngemalkan string bukan obbjek, makanya harus di parse ke jsin
      setUser(JSON.parse(userStore));
    }
    
    setIsLoading(false);
  }, []);

  const login = async ({username, password}) => {
    try {
      const response = await authApi.login({ username, password });
      const { token, user: userData } = response.data;
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);

      // setUser(JSON.parse(userData));
      // gausah karena sudah json karena dari axios
      setUser(userData);
      return {
        success: true,
      };
    } catch (error) {
      console.log(error.response?.data?.message)
      return {
        // ini wajib pake || {}
        errors: error.response?.data?.errors || {},
        success: false,
        message: error.response?.data?.message || "login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);

      const { user: userResponse, token } = response.data;
      localStorage.setItem("token", token);

      localStorage.setItem("user", JSON.stringify(userResponse));
      setUser(userResponse);
      return { success: true };
    } catch (error) {
      return {
        errors: error.response.data.errors || {},
        success: false,
        message: error.response.data.message || "register failed",
      };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      return {
        success: false,
        errors: error.response.data.errors || "logout failed",
      };
    } finally {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const value = {
    logout,
    login,
    register,
    user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
