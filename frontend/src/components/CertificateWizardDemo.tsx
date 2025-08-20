import React, { useState } from 'react';
import { CertificateWizard, CertificateFormData } from './ui';
import toast from 'react-hot-toast';

export default function CertificateWizardDemo(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [walletAddress] = useState('0x742d35Cc6634C0532925a3b8D4C9db96590c6C87');

  const handleSubmit = async (data: CertificateFormData) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Certificate data:', data);
    toast.success('Certificate issued successfully!');
    
    setIsLoading(false);
  };

  const handleCancel = () => {
    toast('Certificate issuance cancelled');
  };

  const toggleConnection = () => {
    setIsConnected(!isConnected);
    toast(isConnected ? 'Wallet disconnected' : 'Wallet connected');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Certificate Wizard Demo
          </h1>
          <p className="text-gray-600 mb-6">
            Experience the step-by-step certificate issuance process
          </p>
          
          {/* Demo Controls */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={toggleConnection}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isConnected
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
            >
              {isConnected ? '🟢 Wallet Connected' : '🔴 Wallet Disconnected'}
            </button>
            
            <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
              Loading: {isLoading ? 'ON' : 'OFF'}
            </div>
          </div>
        </div>

        <CertificateWizard
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          isConnected={isConnected}
          walletAddress={isConnected ? walletAddress : null}
          className="max-w-3xl mx-auto"
        />
      </div>
    </div>
  );
}