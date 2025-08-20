import React from 'react';
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

export default App;