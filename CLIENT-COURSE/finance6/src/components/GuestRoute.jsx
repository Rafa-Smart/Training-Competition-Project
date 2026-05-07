export default GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <>loading...</>;
  if (user) return <Navigate to={"/"} replace></Navigate>;
  return <>{children}</>;
};
