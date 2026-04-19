import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  // const navigate = useNavigate() guasah
  const { user, isLoading } = useAuth();
  {
    /* ini jika loaing dimana pun yang pake route ini*/
  }

  if (isLoading) {
    return (
      <>
        <span className="spinner-border spinner-sm me-2"></span>
      </>
    );
  }

  if (!user || user == undefined) {
    console.log("test");
    <Navigate to={"/login"} replace></Navigate>;
  }

  return <>{children}</>;
};
export default ProtectedRoute