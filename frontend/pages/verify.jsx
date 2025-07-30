import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QrCodeIcon, MagnifyingGlassIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import CertificateCard from '../components/CertificateCard';
import QRScanner from '../components/QRScanner';

const VerifyPage = () => {
  const { hash } = useParams();
  const navigate = useNavigate();
  
  const [verificationMethod, setVerificationMethod] = useState('hash'); // 'hash', 'qr', 'upload'
  const [certificateHash, setCertificateHash] = useState(hash || '');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  // Auto-verify if hash is provided in URL
  useEffect(() => {
    if (hash && hash.length > 0) {
      setCertificateHash(hash);
      handleVerification(hash);
    }
  }, [hash]);

  const handleVerification = async (hashToVerify = certificateHash) => {
    if (!hashToVerify || hashToVerify.trim().length === 0) {
      setError('Please enter a certificate hash or scan a QR code');
      return;
    }

    setLoading(true);
    setError('');
    setCertificate(null);

    try {
      const response = await fetch(`/api/certificates/verify/${hashToVerify.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      if (data.success) {
        setCertificate(data.data);
        // Update URL without causing a page reload
        if (window.location.pathname !== `/verify/${hashToVerify}`) {
          window.history.pushState(null, '', `/verify/${hashToVerify}`);
        }
      } else {
        setError(data.message || 'Certificate not found');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (result) => {
    try {
      // Extract hash from URL if it's a full verification URL
      let extractedHash = result;
      if (result.includes('/verify/')) {
        const urlParts = result.split('/verify/');
        extractedHash = urlParts[urlParts.length - 1];
      }
      
      setCertificateHash(extractedHash);
      setShowScanner(false);
      handleVerification(extractedHash);
    } catch (err) {
      setError('Invalid QR code format');
      setShowScanner(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // In a real implementation, you would:
    // 1. Read the file content
    // 2. Extract certificate hash from the file metadata or content
    // 3. Verify the certificate
    
    setError('File upload verification is not yet implemented');
  };

  const handleShare = async (url) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Certificate Verification',
          text: `Verify this certificate: ${certificate.courseName}`,
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Verification URL copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleDownload = (cert) => {
    // Generate a simple certificate report
    const reportData = {
      certificate: cert,
      verificationDate: new Date().toISOString(),
      verificationUrl: window.location.href
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${cert.tokenId}-verification.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetVerification = () => {
    setCertificate(null);
    setCertificateHash('');
    setError('');
    navigate('/verify');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Certificate Verification
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Verify the authenticity of digital certificates issued on the blockchain. 
            Enter a certificate hash, scan a QR code, or upload a certificate file.
          </p>
        </div>

        {/* Verification Methods */}
        {!certificate && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <button
                onClick={() => setVerificationMethod('hash')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  verificationMethod === 'hash'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Enter Hash
              </button>
              
              <button
                onClick={() => setVerificationMethod('qr')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  verificationMethod === 'qr'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <QrCodeIcon className="h-5 w-5 mr-2" />
                Scan QR Code
              </button>
              
              <button
                onClick={() => setVerificationMethod('upload')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  verificationMethod === 'upload'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Upload File
              </button>
            </div>

            {/* Hash Input Method */}
            {verificationMethod === 'hash' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="certificateHash" className="block text-sm font-medium text-gray-700 mb-2">
                    Certificate Hash
                  </label>
                  <input
                    type="text"
                    id="certificateHash"
                    value={certificateHash}
                    onChange={(e) => setCertificateHash(e.target.value)}
                    placeholder="Enter certificate hash (e.g., 0x1234...)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => handleVerification()}
                  disabled={loading || !certificateHash.trim()}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify Certificate'}
                </button>
              </div>
            )}

            {/* QR Scanner Method */}
            {verificationMethod === 'qr' && (
              <div className="text-center space-y-4">
                {!showScanner ? (
                  <button
                    onClick={() => setShowScanner(true)}
                    className="bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                  >
                    Start QR Scanner
                  </button>
                ) : (
                  <div className="space-y-4">
                    <QRScanner
                      onScan={handleQRScan}
                      onError={(err) => setError(err.message)}
                    />
                    <button
                      onClick={() => setShowScanner(false)}
                      className="bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                    >
                      Cancel Scanner
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* File Upload Method */}
            {verificationMethod === 'upload' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="certificateFile" className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Certificate File
                  </label>
                  <input
                    type="file"
                    id="certificateFile"
                    onChange={handleFileUpload}
                    accept=".json,.pdf,.png,.jpg,.jpeg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Supported formats: JSON, PDF, PNG, JPG
                </p>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying certificate on blockchain...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Verification Failed</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={resetVerification}
                className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Certificate Display */}
        {certificate && (
          <div className="space-y-6">
            <CertificateCard
              certificate={certificate}
              showQR={true}
              showActions={true}
              onShare={handleShare}
              onDownload={handleDownload}
            />
            
            {/* Additional Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Verification Complete
              </h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={resetVerification}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Verify Another Certificate
                </button>
                
                <button
                  onClick={() => window.print()}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Print Verification
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            How Certificate Verification Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Submit Hash</h4>
              <p className="text-sm text-gray-600">
                Enter the certificate hash, scan QR code, or upload certificate file
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Blockchain Check</h4>
              <p className="text-sm text-gray-600">
                System queries the blockchain to verify certificate authenticity
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">View Results</h4>
              <p className="text-sm text-gray-600">
                Get instant verification results with certificate details
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;