import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"

export default Navbar = () => {

    const {user, logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        await logout();
        navigate('/login')
    }

    return <> 
    <header className="h-[80px] px-5 flex items-center justify-between">
  <div className="flex items-center gap-5">
    <Link to={'/'}>
      <h1 className="text-xl tracking-wide font-medium">Pintar<span className="font-bold text-green-500">Menabung</span></h1>
    </Link>
  </div>
  {
    user ? <nav className="flex gap-3">
    <Link to={'/register'}>Register</Link>
    <Link to={'/login'}>Login</Link>
  </nav>:<nav className="flex gap-3">
    <Link to={'/'}>{user.name}</Link>
    <Link to={'/logout'}>Logout</Link>
  </nav>
  }
</header>
</>
}
