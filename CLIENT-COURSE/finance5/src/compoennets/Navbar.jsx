import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default Navbar = () => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async (e) => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <header className="h-[80px] px-5 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Link to="/">
            <h1 className="text-xl tracking-wide font-medium">
              Pintar<span className="font-bold text-green-500">Menabung</span>
            </h1>
          </Link>
        </div>
        {user ? (
          <nav className="flex gap-3">
            <Link to="/">{user.name}</Link>
            <p onClick={handleLogout}>Logout</p>
          </nav>
        ) : (
          <nav className="flex gap-3">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </nav>
        )}
      </header>
    </>
  );
};
