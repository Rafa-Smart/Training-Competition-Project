import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default ProtectedRoute = ({ children }) => {
  const [user] = useAuth();
  const navigate = useNavigate();
  if (!user) navigate("/login");
  return <>{children}</>;
};
