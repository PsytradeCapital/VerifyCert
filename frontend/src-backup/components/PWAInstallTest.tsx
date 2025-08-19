import React from 'react';
import { usePWAInstallation } from '../hooks/useServiceWorker';

const PWAInstallTest: React.FC = () => {
  const { 
    canInstall, 
    isInstalled, 
    installPWA, 
    installationState,
    isMobile,
    isIOSSafari,
    showIOSInstructions 
  } = usePWAInstallation();

  const handleInstall = async () => {
    const success = await installPWA();
    console.log('Install result:', success);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">PWA Install Status</h3>
      <div className="space-y-2 text-sm">
        <div>Can Install: {canInstall ? 'Yes' : 'No'}</div>
        <div>Is Installed: {isInstalled ? 'Yes' : 'No'}</div>
        <div>Installation State: {installationState}</div>
        <div>Is Mobile: {isMobile ? 'Yes' : 'No'}</div>
        <div>Is iOS Safari: {isIOSSafari ? 'Yes' : 'No'}</div>
        <div>Show iOS Instructions: {showIOSInstructions ? 'Yes' : 'No'}</div>
      </div>
      
      {canInstall && !isInstalled && (
        <button
          onClick={handleInstall}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Install PWA
        </button>
      )}
    </div>
  );
};

export default PWAInstallTest;