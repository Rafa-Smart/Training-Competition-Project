import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({children}) => {
    const {user} = useAuth();
    if(!user)return <Navigate to={'/login'} replace></Navigate>
    return <>{children}</>
}

export default ProtectedRoute;