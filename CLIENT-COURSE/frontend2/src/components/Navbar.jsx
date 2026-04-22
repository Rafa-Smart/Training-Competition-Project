import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../api/auth';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            logoutContext();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.leftSection}>
                <Link to="/" style={styles.logo}>SocialApp</Link>
                {user && (
                    <>
                        <Link to="/" style={styles.navLink}>Home</Link>
                        <Link to={`/profile/${user.username}`} style={styles.navLink}>Profile</Link>
                        <Link to="/create-post" style={styles.navLink}>Create Post</Link>
                    </>
                )}
            </div>
            <div style={styles.rightSection}>
                {user ? (
                    <>
                        <span style={styles.username}>Hello, {user.username}</span>
                        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={styles.navLink}>Login</Link>
                        <Link to="/register" style={styles.navLink}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

const styles = {
    navbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: '#333',
        color: 'white',
    },
    leftSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
    },
    rightSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    logo: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'white',
        textDecoration: 'none',
    },
    navLink: {
        color: 'white',
        textDecoration: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        transition: 'background-color 0.3s',
    },
    username: {
        marginRight: '1rem',
    },
    logoutBtn: {
        padding: '0.5rem 1rem',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

export default Navbar;