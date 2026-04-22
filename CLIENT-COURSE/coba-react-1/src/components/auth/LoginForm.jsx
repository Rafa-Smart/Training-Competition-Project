import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../common/ErrorMessage';

const LoginForm = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    const result = await login(data);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            {...register('username', {
              required: 'Username is required',
            })}
            className="input-field"
            placeholder="Enter your username"
          />
          <ErrorMessage error={errors.username?.message} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            {...register('password', {
              required: 'Password is required',
            })}
            className="input-field"
            placeholder="Enter your password"
          />
          <ErrorMessage error={errors.password?.message} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;