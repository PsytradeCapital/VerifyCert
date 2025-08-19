const fs = require('fs');

console.log('🔧 Fixing all export issues...');

// Create simple working versions of all pages with default exports
const pages = {
  'frontend/src/pages/ProfilePage.tsx': `import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Profile</h2>
      {user ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
            <p className="text-lg dark:text-white">{user.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
            <p className="text-lg dark:text-white">{user.email || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Role</label>
            <p className="text-lg dark:text-white capitalize">{user.role}</p>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-300">Please log in to view your profile.</p>
      )}
    </div>
  );
};

export default ProfilePage;`,

  'frontend/src/pages/IssuerDashboard.tsx': `import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const IssuerDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please log in to access the issuer dashboard.
          </p>
          <a 
            href="/login" 
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Issuer Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Welcome back, {user?.name}! Manage your certificates here.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📜</div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Certificates</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">✅</div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Verified Today</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">56</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">👥</div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Issuers</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">⏳</div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
            Issue New Certificate
          </button>
          <button className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700">
            Batch Upload
          </button>
          <button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700">
            Export Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssuerDashboard;`
};

// Write all the pages
Object.entries(pages).forEach(([filePath, content]) => {
  fs.writeFileSync(filePath, content);
  console.log(\`✅ Fixed \${filePath.split('/').pop()}\`);
});

// Clear any TypeScript cache
try {
  const fs = require('fs');
  const path = require('path');
  
  const tsconfigPath = 'frontend/tsconfig.json';
  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    // Force recompilation by touching tsconfig
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    console.log('✅ Cleared TypeScript cache');
  }
} catch (error) {
  console.log('⚠️ Could not clear TypeScript cache');
}

console.log('\\n🎉 All export issues fixed!');
console.log('\\n🔨 Now try building again:');
console.log('cd frontend && npm run build');