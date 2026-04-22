import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showConfirm } from '../utils/alert';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await showConfirm('Logout', 'Are you sure you want to logout?');
    if (result.isConfirmed) {
      logout();
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">Social App</Link>
        
        {user && (
          <div className="nav-menu">
            <Link to="/create-post" className="nav-link">Create Post</Link>
            <Link to={`/profile/${user.username}`} className="nav-link">
              {user.username}
            </Link>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;