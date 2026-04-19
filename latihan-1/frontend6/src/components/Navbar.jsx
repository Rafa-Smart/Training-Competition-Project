import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { ConfirmAlert, SuccessAlert } from "../utils/sweetAlert";

export default Navbar = () => {
  const { user, logOut } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    const response = await ConfirmAlert("logout?", "logout");
    if (response.isConfirmed) {
      await logOut();
      navigate("/login");
      SuccessAlert("berhaisl logout");
    }
    return;
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary fixed-top">
        <div className="container">
          <Link to={"/"} className="navbar-brand">
            Facegram
          </Link>
          {user ? (
            <>
              <div className="navbar-nav">
                <Link to={"/users/" + user.username} className="nav-link">
                  @tomsgat
                </Link>
                <button onClick={handleLogout}>Logout</button>
              </div>
            </>
          ) : (
            <>
              <div className="navbar-nav">
                <Link to={"/auth/register"} className="nav-link">
                  Register
                </Link>
                <Link to={"/auth/login"} className="nav-link">
                  Login
                </Link>
              </div>
            </>
          )}
        </div>
      </nav>
    </>
  );
};
