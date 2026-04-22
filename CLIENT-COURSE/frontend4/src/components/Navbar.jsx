import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth";
import { showConfirm, showSuccess } from "../utils/alert";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {

    const res = await showConfirm('logout?', "logout");
    if(!res.isConfirmed){
      return 
    }

    // await authApi.logout();

    // ktia harus pake yang context
    await logout();
    navigate("/login");
    showSuccess("logout success");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary fixed-top">
        <div className="container">
          <Link className="navbar-brand" to="/">
            Facegram
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {user ? (
                <>
                  <li className="nav-item">
                    <Link to={"/create-post"} className="nav-link">
                      Create Post
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to={`/users/${user.username}`} className="nav-link">
                      {user.username}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link to={"/login"} className="nav-link">
                     login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to={`/register`} className="nav-link">
                      register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};


export default Navbar