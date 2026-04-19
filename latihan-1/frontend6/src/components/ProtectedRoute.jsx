import { useNavigate } from "react-router";

export default ProtectedRoute = ({children}) => {

    const {user, isLoading} = useAuth();
    const navigate = useNavigate();


    if(!user || user == undefined){
        navigate('/login')
    }

    if(isLoading) {
        return <><span className="spinner-border spinner-sm"></span></>
    }

    return <>{children}</>
}