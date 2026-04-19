import { Children, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { authApi } from "../api/auth";

export const useAuth = useContext({});

const AuthProvider = () => {
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/loign");
      return;
    }

    setUser(JSON.parse(userData));

    setIsLoading(false);
  }, []);

  const register = async (email, password) => {
    try {
      const response = await authApi.register({ email, password });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        // dapet dari sini ya
        //             throw new HttpResponseException(
        //     response()->json([
        //         'message' => 'invalid field',
        //         'errors' => $validator->errors(),
        //     ])
        // );
        success: false,
        errors: error.response.data.errors || {},
        message: error.response.data.message || "gagal register",
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response.data.message || "ga bisa login",
        errors: error.response.data.errors || {},
      };
    }
  };

  const logout = async () => {
    try{
        const response = await authApi.logout();
        return {
            success:true
        }
    }catch(error){
        return {
            message:error.response.data.message ||'ga bisa logout',
            errors:error.response.data.errors || {},
            success:false
        }
    }finally{
        setUser(null);
        localStorage.setItem('user', null)
        localStorage.setItem('token', null)
    }
  }

    const value = {
        login,
        register,
        logout,
        user,
        isLoading
    }

    return <AuthProvider.Provider value={value}> {children}</AuthProvider.Provider>
};
