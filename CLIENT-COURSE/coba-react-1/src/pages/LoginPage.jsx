import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

const LoginPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="w-full max-w-lg">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;