import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="bg-blue-600 text-white p-4">
          <h1 className="text-2xl font-bold">VerifyCert</h1>
          <p className="text-blue-100">Blockchain Certificate Verification System</p>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-xl mb-4">Welcome to VerifyCert</h2>
            <p className="text-gray-600">
              Secure, verifiable digital certificates powered by blockchain technology.
            </p>
          </div>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;