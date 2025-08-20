#!/usr/bin/env node

/**
 * EMERGENCY: Create a clean, working VerifyCert app
 * This will replace the broken files with minimal working versions
 */

const fs = require('fs');
const path = require('path');

console.log('🚨 EMERGENCY CLEAN APP CREATION');
console.log('================================');

// Create clean App.tsx
const cleanApp = `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import Home from './pages/Home';
import IssuerDashboard from './pages/IssuerDashboard';
import CertificateViewer from './pages/CertificateViewer';
import NotFound from './pages/NotFound';

// Components
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';

// Styles
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<IssuerDashboard />} />
              <Route path="/verify/:tokenId" element={<CertificateViewer />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;`;

// Create clean Home page
const cleanHome = `import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          VerifyCert
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
          Decentralized Certificate Verification System
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Secure, blockchain-based digital certificate issuance and verification on Polygon Amoy
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Issue Certificates
          </Link>
          <Link
            to="/verify/demo"
            className="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Verify Certificate
          </Link>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Secure</h3>
            <p className="text-gray-600 dark:text-gray-400">Blockchain-based immutable certificates</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Fast</h3>
            <p className="text-gray-600 dark:text-gray-400">Instant verification and issuance</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Global</h3>
            <p className="text-gray-600 dark:text-gray-400">Accessible worldwide, 24/7</p>
          </div>
        </div>
      </div>
    </div>
  );
}`;

// Create clean Navigation
const cleanNavigation = `import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                VerifyCert
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={\`px-3 py-2 rounded-md text-sm font-medium transition-colors \${
                isActive('/') 
                  ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                  : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }\`}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className={\`px-3 py-2 rounded-md text-sm font-medium transition-colors \${
                isActive('/dashboard') 
                  ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                  : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }\`}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}`;

// Create clean ErrorBoundary
const cleanErrorBoundary = `import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 text-center mb-4">
              We're sorry, but something unexpected happened.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;`;

// Create clean NotFound page
const cleanNotFound = `import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist.
          </p>
        </div>
        
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}`;

// Write the clean files
try {
  console.log('📝 Creating clean App.tsx...');
  fs.writeFileSync('frontend/src/App.tsx', cleanApp);
  
  console.log('📝 Creating clean Home.tsx...');
  if (!fs.existsSync('frontend/src/pages')) {
    fs.mkdirSync('frontend/src/pages', { recursive: true });
  }
  fs.writeFileSync('frontend/src/pages/Home.tsx', cleanHome);
  
  console.log('📝 Creating clean Navigation.tsx...');
  if (!fs.existsSync('frontend/src/components')) {
    fs.mkdirSync('frontend/src/components', { recursive: true });
  }
  fs.writeFileSync('frontend/src/components/Navigation.tsx', cleanNavigation);
  
  console.log('📝 Creating clean ErrorBoundary.tsx...');
  fs.writeFileSync('frontend/src/components/ErrorBoundary.tsx', cleanErrorBoundary);
  
  console.log('📝 Creating clean NotFound.tsx...');
  fs.writeFileSync('frontend/src/pages/NotFound.tsx', cleanNotFound);
  
  console.log('✅ Clean files created successfully!');
  console.log('\n🔧 Next steps:');
  console.log('1. cd frontend');
  console.log('2. npm run build');
  console.log('3. Test the build');
  
} catch (error) {
  console.error('❌ Error creating clean files:', error.message);
}