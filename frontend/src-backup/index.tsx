import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function App() {
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#2563eb', marginBottom: '20px' }}>
        VerifyCert
      </h1>
      <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '30px' }}>
        Decentralized Certificate Verification System
      </p>
      <div style={{ 
        backgroundColor: '#f3f4f6', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#374151', marginBottom: '15px' }}>
          Features
        </h2>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0,
          color: '#6b7280'
        }}>
          <li style={{ marginBottom: '10px' }}>✅ Issue tamper-proof certificates</li>
          <li style={{ marginBottom: '10px' }}>✅ Verify certificate authenticity</li>
          <li style={{ marginBottom: '10px' }}>✅ Blockchain-based security</li>
          <li style={{ marginBottom: '10px' }}>✅ QR code verification</li>
        </ul>
      </div>
      <p style={{ 
        fontSize: '14px', 
        color: '#9ca3af',
        borderTop: '1px solid #e5e7eb',
        paddingTop: '20px'
      }}>
        Build successful! Ready for deployment.
      </p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);