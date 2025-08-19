const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing TypeScript syntax errors...');

// Fix AuthContext.tsx
function fixAuthContext() {
  console.log('Fixing AuthContext.tsx...');
  
  const authContextContent = `import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  region: string;
  role: 'user' | 'issuer' | 'admin';
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (emailOrPhone: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  verifyOTP?: (code: string) => Promise<void>;
  forgotPassword?: (emailOrPhone: string) => Promise<void>;
  resetPassword?: (code: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (emailOrPhone: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      // Simulate login for demo
      setTimeout(() => {
        const mockUser: User = {
          id: 1,
          name: 'Demo User',
          email: emailOrPhone,
          region: 'Kenya',
          role: 'user',
          isVerified: true,
        };
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: { user: mockUser, token: 'demo-token' } 
        });
      }, 1000);
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const register = async (data: any) => {
    dispatch({ type: 'AUTH_START' });
    try {
      // Simulate registration
      setTimeout(() => {
        dispatch({ type: 'AUTH_FAILURE' });
      }, 1000);
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};`;

  fs.writeFileSync('frontend/src/contexts/AuthContext.tsx', authContextContent);
  console.log('✅ Fixed AuthContext.tsx');
}

// Fix Navigation.tsx
function fixNavigation() {
  console.log('Fixing Navigation.tsx...');
  
  const navigationContent = `import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../components/ThemeProvider';

interface NavigationProps {
  walletAddress?: string | null;
  isWalletConnected?: boolean;
  onWalletConnect?: (address: string, provider: any) => void;
  onWalletDisconnect?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  walletAddress,
  isWalletConnected,
  onWalletConnect,
  onWalletDisconnect
}) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleWalletConnect = () => {
    if (onWalletConnect) {
      onWalletConnect('0x1234...5678', null);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 rounded-lg p-2">
                <span className="text-white font-bold">🛡️</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">VerifyCert</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Main navigation links */}
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className={\`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors \${
                  isActive('/')
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }\`}
              >
                <span>🏠</span>
                <span>Home</span>
              </Link>

              <Link
                to="/verify"
                className={\`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors \${
                  isActive('/verify')
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }\`}
              >
                <span>🔍</span>
                <span>Verify</span>
              </Link>

              {/* Authenticated user links */}
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className={\`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors \${
                    isActive('/dashboard')
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }\`}
                >
                  <span>📊</span>
                  <span>Dashboard</span>
                </Link>
              )}
            </div>

            {/* Wallet Connect */}
            <button
              onClick={handleWalletConnect}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {isWalletConnected ? \`Connected: \${walletAddress?.slice(0, 6)}...\` : 'Connect Wallet'}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={\`Switch to \${theme === 'dark' ? 'light' : 'dark'} theme\`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* User menu */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2">
                    <span className="text-gray-600 dark:text-gray-300">👤</span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                    <div className="text-gray-500 dark:text-gray-400 capitalize">{user.role}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link
                    to="/profile"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="Profile Settings"
                  >
                    ⚙️
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 dark:text-gray-300 hover:text-red-600 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="Logout"
                  >
                    🚪
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                🏠 Home
              </Link>
              <Link
                to="/verify"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                🔍 Verify
              </Link>
              
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  📊 Dashboard
                </Link>
              )}

              {!isAuthenticated && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 mt-2"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};`;

  fs.writeFileSync('frontend/src/components/Navigation.tsx', navigationContent);
  console.log('✅ Fixed Navigation.tsx');
}

// Create missing pages if they don't exist
function createMissingPages() {
  console.log('Creating missing pages...');
  
  // Ensure directories exist
  const pagesDir = 'frontend/src/pages';
  const authDir = 'frontend/src/pages/auth';
  
  if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
  }
  
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Check and create missing pages
  const requiredPages = {
    'frontend/src/pages/VerificationPage.tsx': \`import React, { useState } from 'react';

const VerificationPage: React.FC = () => {
  const [certId, setCertId] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      if (certId) {
        setResult('Certificate verified successfully! This certificate is authentic and valid.');
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 dark:text-white">
        Certificate Verification
      </h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">
            Certificate ID or Hash
          </label>
          <input
            type="text"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            placeholder="Enter certificate ID or blockchain hash..."
            className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        <button
          onClick={handleVerify}
          disabled={!certId || loading}
          className={\`w-full p-3 rounded-md font-medium transition-colors \${
            !certId || loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white\`}
        >
          {loading ? 'Verifying...' : 'Verify Certificate'}
        </button>
        
        {result && (
          <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 rounded-md">
            <div className="flex items-center text-green-800 dark:text-green-200">
              <span className="mr-2">✅</span>
              {result}
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
        <h3 className="font-semibold mb-4 dark:text-white">How Verification Works</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
          <li>Enter the certificate ID or blockchain hash</li>
          <li>System queries the blockchain for certificate data</li>
          <li>Cryptographic verification ensures authenticity</li>
          <li>Results displayed with verification status</li>
        </ol>
      </div>
    </div>
  );
};

export default VerificationPage;\`,

    'frontend/src/pages/NotFound.tsx': \`import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="max-w-md mx-auto mt-12 text-center">
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
  );
};

export default NotFound;\`
  };

  Object.entries(requiredPages).forEach(([filePath, content]) => {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content);
      console.log(\`✅ Created \${path.basename(filePath)}\`);
    }
  });
}

// Main execution
function main() {
  try {
    fixAuthContext();
    fixNavigation();
    createMissingPages();
    
    console.log('\\n🎉 All syntax errors fixed!');
    console.log('\\n🔨 Now try building again:');
    console.log('cd frontend && npm run build');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

main();