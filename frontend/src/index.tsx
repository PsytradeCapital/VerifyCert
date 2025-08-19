import React from 'react';
import { createRoot } from 'react-dom/client';

const App = () => (
  <div style={{
    padding: '50px',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  }}>
    <h1 style={{ color: '#1e40af', fontSize: '3rem', marginBottom: '1rem' }}>
      VerifyCert
    </h1>
    <p style={{ color: '#64748b', fontSize: '1.2rem', marginBottom: '2rem' }}>
      Decentralized Certificate Verification System
    </p>
    <div style={{
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h2 style={{ color: '#374151', marginBottom: '1rem' }}>
        Build Successful! 🎉
      </h2>
      <p style={{ color: '#6b7280' }}>
        Your VerifyCert application is ready for deployment.
      </p>
    </div>
  </div>
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);