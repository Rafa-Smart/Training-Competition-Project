import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (!user) navigate("/login");
  if (loading) return <>loading...</>;

  return <>{children}</>;
};
