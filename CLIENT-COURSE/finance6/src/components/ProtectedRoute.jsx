import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if(loading) return<>loading...</>
  if(!user) return <Navigate to={'/login'} replace></Navigate>
  return <>{children}</>;
};
