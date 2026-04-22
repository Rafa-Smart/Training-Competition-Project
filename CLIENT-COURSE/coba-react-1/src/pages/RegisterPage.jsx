import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RegisterForm from '../components/auth/RegisterForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RegisterPage = () => {
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
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;