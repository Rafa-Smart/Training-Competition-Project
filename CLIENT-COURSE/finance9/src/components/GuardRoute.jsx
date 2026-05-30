import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"

const GuardRoute = ({children}) => {
    const {user, loading} = useAuth();
    if(loading) return <span className='loading'></span>
    if(user)return <Navigate to='/' replace></Navigate>
    return <>{children}</>
}

export default GuardRoute;