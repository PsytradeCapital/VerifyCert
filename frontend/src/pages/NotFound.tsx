import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Link 
          to="/" 
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;