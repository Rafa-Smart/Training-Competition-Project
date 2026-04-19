import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { showConfirm, showSuccess } from "../utils/alert.js";
export default Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const response = await showConfirm("logout?", "logout");
    if (response.isConfirmed) {
      await logout();
      navigate("/login");
      showSuccess("logout berhasil");
    }

    return;
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary fixed-top">
      <div className="container">
        <Link to={"/users/" + user.username} className="navbar-brand">
          Facegram
        </Link>
        {user ? (
          <div className="navbar-nav">
            <Link to={"/users/" + user.username} className="nav-link">
              {user.username}
            </Link>
            <Link onClick={handleLogout} className="nav-link">
              Logout
            </Link>
          </div>
        ) : (
          <div className="navbar-nav">
            <Link to={"/auth/register"} className="nav-link">
              register
            </Link>
            <Link to={"/auth/login"} className="nav-link">
              login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
