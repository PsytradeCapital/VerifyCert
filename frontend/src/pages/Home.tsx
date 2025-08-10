import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import CertificateCard, { Certificate } from '../components/CertificateCard';
import PWAInstallTest from '../components/PWAInstallTest';

interface HomeProps {
  isWalletConnected: boolean;
  walletAddress?: string | null;
}

export default function Home({ isWalletConnected, walletAddress }: HomeProps) {
  const location = useLocation();

  // Show message if redirected from protected route
  useEffect(() => {
    if (location.state?.message) {
      toast.error(location.state.message);
      // Clear the state to prevent showing the message again
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-900">
        <div className="container-responsive py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              <span className="block">Secure Digital</span>
              <span className="block text-blue-600 dark:text-blue-400">Certificate Verification</span>
            </h1>
            <p className="mt-4 sm:mt-6 max-w-md sm:max-w-2xl lg:max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-gray-500 dark:text-gray-300 leading-relaxed">
              Issue and verify tamper-proof digital certificates using blockchain technology. 
              Built on Polygon for fast, secure, and cost-effective certificate management.
            </p>
            
            <div className="mt-6 sm:mt-8 lg:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto sm:justify-center">
              <div className="w-full sm:w-auto">
                {isWalletConnected ? (
                  <Link
                    to="/dashboard"
                    className="btn-responsive-lg w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <button
                    onClick={() => toast('Please connect your wallet to get started')}
                    className="btn-responsive-lg w-full sm:w-auto bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800 shadow-lg get-started-btn"
                  >
                    Get Started
                  </button>
                )}
              </div>
              <div className="w-full sm:w-auto">
                <Link
                  to="/verify"
                  className="btn-responsive-lg w-full sm:w-auto bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 shadow-lg"
                >
                  Verify Certificate
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PWA Install Test - Development Only */}
      <div className="py-8 bg-yellow-50 border-y border-yellow-200">
        <div className="container-responsive">
          <PWAInstallTest />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-responsive">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Why Choose VerifyCert?
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Blockchain-powered certificate verification with unmatched security and transparency
            </p>
          </div>

          <div className="grid-responsive-3">
            {/* Feature 1 */}
            <div className="card-responsive text-center">
              <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-blue-500 text-white mx-auto mb-4">
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">Tamper-Proof</h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300">
                Certificates stored immutably on the blockchain cannot be altered or forged
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-responsive text-center">
              <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-green-500 text-white mx-auto mb-4">
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">Instant V
              <p className="text-sm sm:text-base text-gray-500 d
                Verify certificate authenticity in seconds with QR code scanning
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-responsive text-center">
              <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-purple-500 text-white mx-auto mb-4">
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Global Access</h3>
              <p className="text-sm sm:text-base text-gray-500">
                Access and verify certificates from anywhere in the world, 24/7
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card-responsive text-center">
              <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-yellow-500 text-white mx-auto mb-4">
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Cost Effective</h3>
              <p className="text-sm sm:text-base text-gray-500">
                Low-cost certificate issuance and verification on Polygon network
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card-responsive text-center">
              <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-red-500 text-white mx-auto mb-4">
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Non-Transferable</h3>
              <p className="text-sm sm:text-base text-gray-500">
                Certificates are bound to recipients and cannot be transferred or sold
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card-responsive text-center">
              <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-indigo-500 text-white mx-auto mb-4">
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Easy Integration</h3>
              <p className="text-sm sm:text-base text-gray-500">
                Simple API and web interface for seamless integration with existing systems
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Certificate Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container-responsive">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Sample Certificate
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              See how your certificates will look with our professional design
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <CertificateCard 
              certificate={sampleCertificate}
              showQR={true}
              isPublicView={true}
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="container-responsive py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                <span className="block">Ready to get started?</span>
                <span className="block text-blue-200 mt-1">Connect your wallet today.</span>
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:flex-shrink-0">
              <div>
                {isWalletConnected ? (
                  <Link
                    to="/dashboard"
                    className="btn-responsive bg-white text-blue-600 hover:bg-blue-50 shadow-lg w-full sm:w-auto"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <button
                    onClick={() => toast('Please use the wallet connect button in the navigation')}
                    className="btn-responsive bg-white text-blue-600 hover:bg-blue-50 shadow-lg w-full sm:w-auto"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
              <div>
                <Link
                  to="/verify"
                  className="btn-responsive bg-blue-500 text-white hover:bg-blue-400 shadow-lg w-full sm:w-auto"
                >
                  Verify Certificate
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}