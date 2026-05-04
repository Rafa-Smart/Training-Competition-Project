import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"

export default PRotectedRoute  = ({children}) => {

    const {user, loading} = useAuth();
    const navigate = useNavigate();

    if(loading) return<>loading...</>

    if(!user) {
        navigate('/login');
        return
    }


    return children
}