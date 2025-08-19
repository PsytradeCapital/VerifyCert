import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Profile</h2>
      {user && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
            <p className="text-lg dark:text-white">{user.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
            <p className="text-lg dark:text-white">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Role</label>
            <p className="text-lg dark:text-white capitalize">{user.role}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;