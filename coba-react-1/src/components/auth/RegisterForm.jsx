import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../common/ErrorMessage';

const RegisterForm = () => {
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      full_name: '',
      username: '',
      bio: '',
      password: '',
      confirmPassword: '',
      is_private: false,
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setFormErrors({});

    const { confirmPassword, ...userData } = data;

    const result = await registerUser(userData);
    
    if (!result.success) {
      setFormErrors(result.errors || {});
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            {...register('full_name', {
              required: 'Full name is required',
            })}
            className="input-field"
            placeholder="Enter your full name"
          />
          <ErrorMessage error={errors.full_name?.message || formErrors.full_name?.[0]} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username *
          </label>
          <input
            type="text"
            {...register('username', {
              required: 'Username is required',
              minLength: {
                value: 3,
                message: 'Username must be at least 3 characters',
              },
              pattern: {
                value: /^[a-zA-Z0-9._]+$/,
                message: 'Only letters, numbers, dots and underscores allowed',
              },
            })}
            className="input-field"
            placeholder="Choose a username"
          />
          <ErrorMessage error={errors.username?.message || formErrors.username?.[0]} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio *
          </label>
          <textarea
            {...register('bio', {
              required: 'Bio is required',
              maxLength: {
                value: 100,
                message: 'Bio cannot exceed 100 characters',
              },
            })}
            className="input-field"
            rows="3"
            placeholder="Tell us about yourself"
            maxLength={100}
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <ErrorMessage error={errors.bio?.message || formErrors.bio?.[0]} />
            <span>{watch('bio', '').length}/100</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <input
            type="password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
            className="input-field"
            placeholder="Enter password"
          />
          <ErrorMessage error={errors.password?.message || formErrors.password?.[0]} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password *
          </label>
          <input
            type="password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: value =>
                value === password || 'Passwords do not match',
            })}
            className="input-field"
            placeholder="Confirm password"
          />
          <ErrorMessage error={errors.confirmPassword?.message} />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_private"
            {...register('is_private')}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="is_private" className="ml-2 block text-sm text-gray-700">
            Make my account private
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;