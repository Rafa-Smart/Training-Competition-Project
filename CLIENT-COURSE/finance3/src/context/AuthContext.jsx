// pertam kita baut dulu contextnya

import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext(null);

// bau kita baut ka komponentnya
// yang nanti komponenini akna di pake di dalam route ya jadi semua route akna ada didamn ini
export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userFromLocal = JSON.parse(localStorage.getItem("user"));
    const tokenFromLocal = localStorage.getItem("token");
    if (userFromLocal && tokenFromLocal) {
      setUser(userFromLocal);
      setToken(tokenFromLocal);
    }
    setIsLoading(false);
  }, []);

  //   /in th hanya seprti fngsi yang menyimpan data lgin ya
  // jadi fungsi login api dari laravelnya itu engga di panggil disini jadinya gauah pake async
  const loginUser = (data) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
  };

  const logoutUser = async () => {
    // nah disni karean dia lansung panggil ungsi api dari laravel maka
    // kita akan pake async
    // ini tuh untuk yang logout gausah namplin errnrya ya jadi yang cumanampilin erronay itu hanya register dan login aja
    // https://chatgpt.com/c/69f2cddf-6d94-83a1-8fc0-3c40dc144927
    // tuh baca di akhirnya aja

    try {
      await authApi.logout();
    } catch (e) {
      alert("gagal logout");
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const value = [
    loginUser,
    logoutUser,
    isLoading,
    user,
    token
  ]

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider> 
};

export const useAuth = () =>{
    return useContext(AuthContext);
}
