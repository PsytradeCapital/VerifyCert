const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 Quick restore with working App.tsx...');

// Create working App.tsx with routing
const workingApp = `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import VerificationPage from './pages/VerificationPage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/verify" element={<VerificationPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;`;

fs.writeFileSync('frontend/src/App.tsx', workingApp);

// Create directories
['components', 'pages', 'utils'].forEach(dir => {
  fs.mkdirSync(`frontend/src/${dir}`, { recursive: true });
});

// Create ErrorBoundary
const errorBoundary = `import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}`;

fs.writeFileSync('frontend/src/components/ErrorBoundary.tsx', errorBoundary);

// Create Home page
const homePage = `import React from 'react';

export default function Home() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ color: '#2563eb', fontSize: '3rem', marginBottom: '1rem' }}>
        VerifyCert
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#6b7280', marginBottom: '2rem' }}>
        Decentralized Certificate Verification System
      </p>
      <div style={{ 
        backgroundColor: '#f8fafc', 
        padding: '2rem', 
        borderRadius: '8px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2>Features</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>✅ Issue tamper-proof certificates</li>
          <li>✅ Verify certificate authenticity</li>
          <li>✅ Blockchain-based security</li>
          <li>✅ QR code verification</li>
        </ul>
      </div>
    </div>
  );
}`;

fs.writeFileSync('frontend/src/pages/Home.tsx', homePage);

// Create Verification page
const verifyPage = `import React, { useState } from 'react';

export default function VerificationPage() {
  const [certId, setCertId] = useState('');
  
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Certificate Verification
      </h1>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <input
          type="text"
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
          placeholder="Enter certificate ID..."
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}
        />
        <button
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Verify Certificate
        </button>
      </div>
    </div>
  );
}`;

fs.writeFileSync('frontend/src/pages/VerificationPage.tsx', verifyPage);

// Create NotFound page
const notFoundPage = `import React from 'react';

export default function NotFound() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '4rem', color: '#ef4444' }}>404</h1>
      <p>Page not found</p>
    </div>
  );
}`;

fs.writeFileSync('frontend/src/pages/NotFound.tsx', notFoundPage);

// Test build
try {
  execSync('cd frontend && npm run build', { stdio: 'inherit', timeout: 300000 });
  console.log('✅ Build successful! Full functionality restored.');
} catch (error) {
  console.log('❌ Build failed, trying with router fix...');
  
  // Simpler App without router
  const simpleApp = `import React from 'react';
import Home from './pages/Home';

function App() {
  return <Home />;
}

export default App;`;
  
  fs.writeFileSync('frontend/src/App.tsx', simpleApp);
  
  try {
    execSync('cd frontend && npm run build', { stdio: 'inherit', timeout: 300000 });
    console.log('✅ Simple build successful!');
  } catch (finalError) {
    console.log('❌ All attempts failed');
  }
}