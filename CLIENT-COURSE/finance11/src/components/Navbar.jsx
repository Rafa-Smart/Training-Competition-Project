import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
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
          <Link to="/">Hi {user.username}</Link>
          <a onClick={handleLogout}>Logout</a>
        </nav>
      ) : (
        <nav className="flex gap-3">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      )}
    </header>
  );
};
export default Navbar;
