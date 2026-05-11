import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default Navbar = () => {
  const [user, logout] = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <header className="h-[80px] px-5 flex items-center justify-between">
  <div className="flex items-center gap-5">
    <a href="index.html">
      <h1 className="text-xl tracking-wide font-medium">
        Pintar<span className="font-bold text-green-500">Menabung</span>
      </h1>
    </a>
  </div>
  {'{'}user ? (
  <nav className="flex gap-3">
    <link to="/" />{'{'}user.name{'}'}
    <button onclick="{handleLogout}">Logout</button>
  </nav>
  ) : (
  <nav className="flex gap-3">
    <link to="/login" />Login
    <link to="/register" />Register
  </nav>
  ){'}'}
</header>

    </>
  );
};
