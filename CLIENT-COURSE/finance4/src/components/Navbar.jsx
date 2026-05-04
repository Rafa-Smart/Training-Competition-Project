import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {" "}
      <header class="h-[80px] px-5 flex items-center justify-between">
        <div class="flex items-center gap-5">
          <Link to={"/"}>
            <h1 class="text-xl tracking-wide font-medium">
              Pintar<span class="font-bold text-green-500">Menabung</span>
            </h1>
          </Link>
        </div>
        {user ? (
          <nav class="flex gap-3">
            <Link to={"/"}>{user.name}</Link>
            <Link onClick={handleLogout}>Logout</Link>
          </nav>
        ) : (
          <nav class="flex gap-3">
            <Link to={"/login"}>Login</Link>
            <Link to={"/register"}>Register</Link>
          </nav>
        )}
      </header>
    </>
  );
};
