import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js"

export default GuestRoute = ({children}) => {

    const [user, isLoading]  =useAuth();
    const navigate = useNavigate();
    if(isLoading) return <div style={{textAlign:"center"}}>loading....</div>
    if(user) navigate('/');

    return <>{children}</>
}