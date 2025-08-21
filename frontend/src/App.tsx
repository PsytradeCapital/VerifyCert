import React from 'react';

function App() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2563eb', marginBottom: '1rem' }}>VerifyCert</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        Decentralized Certificate Verification System
      </p>
      <div style={{ 
        backgroundColor: '#f8fafc', 
        padding: '2rem', 
        borderRadius: '8px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Features</h2>
        <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
          <li>✅ Issue tamper-proof certificates</li>
          <li>✅ Verify certificate authenticity</li>
          <li>✅ Blockchain-based security</li>
          <li>✅ QR code verification</li>
        </ul>
      </div>
    </div>
  );
}

export default App;