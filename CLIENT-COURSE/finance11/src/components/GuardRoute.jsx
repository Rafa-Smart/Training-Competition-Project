import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext"

const GuardRoute = ({children}) => {
    const {user} = useAuth();
    if(user)return <Navigate to={'/'} replace></Navigate>
    return <>{children}</>
}

export default GuardRoute;