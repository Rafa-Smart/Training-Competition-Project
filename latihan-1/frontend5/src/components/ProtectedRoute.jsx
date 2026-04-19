import { Children } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

export default  ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
//   const navigate = useNavigate();
  if (!user || user == undefined) {
    // navigate("/login");
    <Navigate to={"/login"} replace></Navigate>
    return;
  }

  if (isLoading) {
    return (
      <>
        <span className="spinner-border spinner-sm me-2"></span>
      </>
    );
  }
  return <>{children}</>;
};
