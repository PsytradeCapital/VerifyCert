import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import WalletConnect from './components/WalletConnect';
import CertificateCard, { Certificate } from './components/CertificateCard';
import './App.css';

function App() {
  const handleWalletConnect = (address: string, provider: any) => {
    console.log('Wallet connected:', address);
  };

  const handleWalletDisconnect = () => {
    console.log('Wallet disconnected');
  };

  // Sample certificate for demonstration
  const sampleCertificate: Certificate = {
    tokenId: '123',
    issuer: '0x1234567890123456789012345678901234567890',
    recipient: '0x0987654321098765432109876543210987654321',
    recipientName: 'John Doe',
    courseName: 'Blockchain Development Fundamentals',
    institutionName: 'Tech University',
    issueDate: Math.floor(Date.now() / 1000) - 86400, // Yesterday
    isValid: true,
    qrCodeURL: 'https://via.placeholder.com/150x150/2563eb/ffffff?text=QR',
    verificationURL: 'https://verifycert.com/verify/123',
  };

  return (
    <Router>
      <div className="App">
        <header className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">VerifyCert</h1>
              <p className="text-blue-100">Blockchain Certificate Verification System</p>
            </div>
            <WalletConnect 
              onConnect={handleWalletConnect}
              onDisconnect={handleWalletDisconnect}
              requiredNetwork="polygon-mumbai"
            />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-xl mb-4">Welcome to VerifyCert</h2>
            <p className="text-gray-600">
              Secure, verifiable digital certificates powered by blockchain technology.
            </p>
          </div>
          
          {/* Sample Certificate Display */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">Sample Certificate</h3>
            <CertificateCard 
              certificate={sampleCertificate}
              showQR={true}
              isPublicView={false}
            />
          </div>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;