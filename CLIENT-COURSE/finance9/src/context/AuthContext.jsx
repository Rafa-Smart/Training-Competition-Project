import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext();

const AuthProvider = ({children}) => {
    const [user, setUser] = useState();
    const [token, setToken] = useState();
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     setUser(JSON.parse(localStorage.getItem('user')) || null);
    //     setToken(localStorage.getItem('token') || '')  
    //     setLoading(false)
    // },[]);
    useEffect(() => {
                const dataUser = JSON.parse(localStorage.getItem('user'));
        const dataToken = localStorage.getItem('token');
        if(dataToken && dataUser){
            setUser(dataUser);
            setToken(dataToken)  
        }
        setLoading(false)
    },[]);


    const loginUser = (data, tokenValue) => {
        setUser(data);
        setToken(tokenValue);
        localStorage.setItem('user', JSON.stringify(data))
        localStorage.setItem('token', tokenValue)
    }

    const logout = async () => {
        try {
            await authApi.logout();
        }catch(e){
            alert(JSON.stringify(e))
            
        }finally{
            localStorage.setItem('token', null)
            localStorage.setItem('user', null)
            setUser(null)
            setToken(null)
        }
    }

    const value = {
        user, token, loginUser, logout, loading
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 

export default AuthProvider;
const useAuth = () => {
    return useContext(AuthContext)
}

export {useAuth}