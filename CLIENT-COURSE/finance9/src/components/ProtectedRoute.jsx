import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({children}) => {
    const {user, loading} = useAuth();
    const navigate = useNavigate();
    if(loading) return <span className='loading'></span>
    if(!user)return <Navigate replace to='/login' ></Navigate>;
    return <>{children}</>
} 

export default ProtectedRoute;