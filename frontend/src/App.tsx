import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import Home from './pages/Home';
import IssuerDashboard from './pages/IssuerDashboard';
import CertificateViewer from './pages/CertificateViewer';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './components/ThemeProvider';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/issuer-dashboard" element={<IssuerDashboard />} />
                <Route path="/certificate/:id" element={<CertificateViewer />} />
                <Route path="/verify" element={<CertificateViewer />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;