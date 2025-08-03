import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Shield, AlertTriangle, CheckCircle, ExternalLink, QrCode } from 'lucide-react';
import { toast } from 'react-hot-toast';
import CertificateCard from '../components/CertificateCard';
import { OptimizedImage } from '../src/components/ui/OptimizedImage';

const Verify = () => {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(tokenId || '');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Auto-verify if tokenId is provided in URL
  useEffect(() => {
    if (tokenId && !certificate) {
      handleVerify(tokenId);
    }
  }, [tokenId, certificate]);

  const handleVerify = async (id = searchInput) => {
    if (!id || !id.trim()) {
      toast.error('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError(null);
    setVerificationStatus(null);

    try {
      const response = await fetch(`/api/verify-certificate/${id.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify certificate');
      }

      setCertificate(data.certificate);
      setVerificationStatus(data.status);
      
      if (data.status === 'valid') {
        toast.success('Certificate verified successfully!');
      } else if (data.status === 'revoked') {
        toast.error('Certificate has been revoked');
      } else {
        toast.error('Certificate is invalid');
      }

      // Update URL if not already there
      if (!tokenId) {
        navigate(`/verify/${id.trim()}`, { replace: true });
      }

    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message);
      setCertificate(null);
      setVerificationStatus('invalid');
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
    // Clear previous results when input changes
    if (certificate && e.target.value !== tokenId) {
      setCertificate(null);
      setVerificationStatus(null);
      setError(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handleQRScan = (result) => {
    if (result) {
      // Extract token ID from QR code result (could be URL or just ID)
      const tokenMatch = result.match(/\/verify\/(\d+)/) || result.match(/^(\d+)$/);
      if (tokenMatch) {
        const scannedTokenId = tokenMatch[1];
        setSearchInput(scannedTokenId);
        handleVerify(scannedTokenId);
        setShowQRScanner(false);
      } else {
        toast.error('Invalid QR code format');
      }
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'valid':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'revoked':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'invalid':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      default:
        return <Shield className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (verificationStatus) {
      case 'valid':
        return {
          title: 'Certificate Verified',
          message: 'This certificate is authentic and has been verified on the blockchain.',
          color: 'text-green-600'
        };
      case 'revoked':
        return {
          title: 'Certificate Revoked',
          message: 'This certificate has been revoked by the issuer and is no longer valid.',
          color: 'text-red-600'
        };
      case 'invalid':
        return {
          title: 'Certificate Invalid',
          message: 'This certificate could not be found or is not authentic.',
          color: 'text-red-600'
        };
      default:
        return {
          title: 'Verify Certificate',
          message: 'Enter a certificate ID to verify its authenticity.',
          color: 'text-gray-600'
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-4">
            {getStatusIcon()}
            <h1 className="text-3xl font-bold text-gray-900 ml-3">
              Certificate Verification
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Verify the authenticity of digital certificates issued on the blockchain
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          className="bg-white rounded-lg shadow-md p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="certificate-id" className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate ID
                </label>
                <input
                  id="certificate-id"
                  type="text"
                  value={searchInput}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter certificate ID (e.g., 12345)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={loading}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleVerify()}
                  disabled={loading || !searchInput.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Verify</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowQRScanner(true)}
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                  title="Scan QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Status Message */}
            <div className={`flex items-center space-x-2 ${statusInfo.color}`}>
              {getStatusIcon()}
              <div>
                <p className="font-medium">{statusInfo.title}</p>
                <p className="text-sm">{statusInfo.message}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Certificate Display */}
        {certificate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CertificateCard
              certificate={{
                ...certificate,
                isValid: verificationStatus === 'valid',
                verificationURL: `${window.location.origin}/verify/${certificate.tokenId}`
              }}
              showQR={true}
              isPublicView={true}
              className="mb-8"
            />
          </motion.div>
        )}

        {/* Verification Info */}
        <motion.div
          className="bg-blue-50 border border-blue-200 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How Certificate Verification Works
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Blockchain Security</h4>
              <p className="text-blue-700 text-sm">
                All certificates are stored as non-transferable NFTs on the Polygon blockchain, 
                ensuring they cannot be tampered with or forged.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Instant Verification</h4>
              <p className="text-blue-700 text-sm">
                Certificate authenticity is verified instantly by checking the blockchain 
                records against the provided certificate ID.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">QR Code Support</h4>
              <p className="text-blue-700 text-sm">
                Scan QR codes on physical certificates to instantly verify their 
                authenticity without manual ID entry.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Public Access</h4>
              <p className="text-blue-700 text-sm">
                Anyone can verify certificates without needing special access or accounts, 
                ensuring transparency and trust.
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-blue-200">
            <p className="text-sm text-blue-600">
              <strong>Need help?</strong> Contact the certificate issuer if you have questions 
              about a specific certificate or believe there's an error.
            </p>
          </div>
        </motion.div>

        {/* Sample Certificates */}
        {!certificate && !loading && (
          <motion.div
            className="mt-8 bg-white rounded-lg shadow-md p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Try Sample Certificates
            </h3>
            <p className="text-gray-600 mb-4">
              Test the verification system with these sample certificate IDs:
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {['12345', '67890', '11111'].map((sampleId) => (
                <button
                  key={sampleId}
                  onClick={() => {
                    setSearchInput(sampleId);
                    handleVerify(sampleId);
                  }}
                  className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-mono text-sm text-blue-600">#{sampleId}</div>
                  <div className="text-xs text-gray-500">Sample Certificate</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* QR Scanner Modal */}
        {showQRScanner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Scan QR Code</h3>
                <button
                  onClick={() => setShowQRScanner(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-center">
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">
                  Position the QR code within the camera view to scan
                </p>
                <button
                  onClick={() => setShowQRScanner(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verify;