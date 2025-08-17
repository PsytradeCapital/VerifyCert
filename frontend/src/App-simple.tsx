import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Simple components only
import Home from './pages/Home';
import Verify from './pages/Verify';
import NotFound from './pages/NotFound';

// Basic CSS
import './App.css';
import './index.css';

function App() {
  console.log('App component rendering...');
  
  return (
    <div className="App min-h-screen bg-white">
      <Router>
        <header className="bg-blue-600 text-white p-4">
          <h1 className="text-xl font-bold">VerifyCert</h1>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home isWalletConnected={false} walletAddress={null} /> />
            <Route path="/verify" element={<Verify /> />
            <Route path="*" element={<NotFound /> />
          </Routes>
        </main>
        
        <Toaster position="top-right" />
      </Router>
    </div>
  );

export default App;