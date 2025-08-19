import React from 'react';

const SignupPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Sign Up</h2>
      <form>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Name</label>
          <input type="text" className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Email</label>
          <input type="email" className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Password</label>
          <input type="password" className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignupPage;