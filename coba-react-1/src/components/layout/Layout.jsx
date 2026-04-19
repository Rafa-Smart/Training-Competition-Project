import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    const pageTitle = getPageTitle(location.pathname);
    document.title = `${pageTitle} | SocialMedia`;
  }, [location]);

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'Home';
      case '/login':
        return 'Login';
      case '/register':
        return 'Register';
      case '/posts/create':
        return 'Create Post';
      default:
        if (pathname.startsWith('/')) {
          const username = pathname.substring(1);
          return `${username}'s Profile`;
        }
        return 'SocialMedia';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </div>
  );
};

export default Layout;