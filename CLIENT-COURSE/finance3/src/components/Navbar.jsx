import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default Navbar = () => {
  const [logoutUser, user] = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
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
     {
        user ?  <nav className="flex gap-3">
        <Link to="/">{user.name}</Link>
        <button onClick={handleLogout} className="btn">Logout</button>
      </nav>: <nav className="flex gap-3">
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </nav> 
     }
    </header>
  );
};
