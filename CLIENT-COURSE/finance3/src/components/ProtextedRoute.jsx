import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"

export default ProtectedRoute = ({children}) => {

    const [user, isLoading] = useAuth();
    const navigate = useNavigate();

    if(isLoading){
        return <div style={{textAlign:'center'}}>Loading...</div>
    }

    if(!user){
      <Navigate to='/login' replace></Navigate>
    }

    return <>{children}</>
}