import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mt-4">Page not found</p>
        <p className="text-gray-500 mt-2">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-block mt-6 btn-primary"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;