import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default GuestRoute = ({ children }) => {
  const [user] = useAuth();
  const navigate = useNavigate();
  if (user) navigate("/");
  return <>{children}</>;
};
