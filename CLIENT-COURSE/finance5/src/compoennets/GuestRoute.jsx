export default GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (user) navigate("/");
  if (loading) return <>loading...</>;

  return <>{children}</>;
};
