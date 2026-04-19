import { Children, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiAuth } from "../api/apiAuth";

export const useAuth = useContext({});

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  useEffect(() => {
    setIsLoading(true);
    const userData = localStorage.getItem("user");

    if (!userData || user == undefined) {
      navigate("/login");
    }

    setUser(JSON.parse(userData));
    setIsLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      const response = await apiAuth.register(userData);

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      return {
        success: true,
      };
    } catch (e) {
      return {
        message: e.response.data.message || "gagal register",
        errors: e.response.data.errors || "error register",
        success: false,
      };
    }
  };
  const login = async (username, password) => {
    try {
      const response = await apiAuth.login({ username, password });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      return {
        success: true,
      };
    } catch (e) {
      return {
        message: e.response.data.message || "gagal login",
        errors: e.response.data.errors || "error login",
        success: false,
      };
    }
  };

  const logOut = async () => {
    try {
      const response = await apiAuth.logout();

      const success = response.data.message;

      if (success) {
        return {
          success: true,
        };
      }
    } catch (e) {
      return {
        message: e.response.data.message || "gagal logout",
        errors: e.response.data.errors || "error logout",
        success: false,
      };
    } finally {
      localStorage.setItem("token", null);
      localStorage.setItem("user", null);

      setUser(null);
    }
  };

  const value = {
    register,
    login,
    logOut,
    isLoading,
    user,
  };

  return (
    <AuthProvider.provider value={value}>{children}</AuthProvider.provider>
  );
};
