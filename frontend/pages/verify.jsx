import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Search, 
  Upload, 
  QrCode,
  AlertCircle,
  Download,
  Share2,
  ExternalLink
} from 'lucide-react';
import CertificateCard from '../components/CertificateCard';
import { pageTransition, fadeInUp, staggerContainer, staggerItem } from '../src/utils/animations';
import { Card, Button, Alert, Input } from '../src/components/ui';

/**
 * Certificate Verification Page
 * Allows users to verify certificate authenticity via token ID, QR code, or file upload
 */
const VerifyPage = () => {
  const { tokenId } = useParams();
  const [searchParams] = useSearchParams();
  const [verificationMethod, setVerificationMethod] = useState('search');
  const [inputValue, setInputValue] = useState(tokenId || '');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    // Auto-verify if token ID is provided in URL
    if (tokenId) {
      handleVerification(tokenId);
    }
  }, [tokenId]);

  const handleVerification = async (id = inputValue) => {
    if (!id.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError(null);
    setCertificate(null);
    setVerificationResult(null);

    try {
      const response = await fetch(`/api/certificates/verify/${id}`);
      const data = await response.json();

      if (data.success) {
        setCertificate(data.data.certificate);
        setVerificationResult({
          isValid: data.data.isValid,
          isRevoked: data.data.isRevoked,
          onChain: data.data.onChain,
          verificationDate: new Date().toISOString()
        });
      } else {
        setError(data.message || 'Certificate not found');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('certificate', file);

      const response = await fetch('/api/certificates/verify-file', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setCertificate(data.data.certificate);
        setVerificationResult({
          isValid: data.data.isValid,
          isRevoked: data.data.isRevoked,
          onChain: data.data.onChain,
          verificationDate: new Date().toISOString()
        });
      } else {
        setError(data.message || 'Invalid certificate file');
      }
    } catch (err) {
      console.error('File verification error:', err);
      setError('Failed to verify certificate file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = () => {
    // In a real implementation, this would open a QR scanner
    // For now, we'll simulate it
    alert('QR Scanner would open here. For demo, please enter certificate ID manually.');
  };

  const handleDownload = (cert) => {
    // Generate and download certificate PDF
    const certificateData = {
      ...cert,
      verificationResult,
      verifiedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(certificateData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-${cert.tokenId}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const handleShare = (cert) => {
    const shareUrl = `${window.location.origin}/verify/${cert.tokenId}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${cert.courseName} Certificate`,
        text: `Certificate for ${cert.recipientName} from ${cert.institutionName}`,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Certificate link copied to clipboard!');
    }
  };

  const getVerificationStatus = () => {
    if (!verificationResult) return null;
    
    if (verificationResult.isRevoked) {
      return {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        title: 'Certificate Revoked',
        message: 'This certificate has been revoked and is no longer valid.'
      };
    }
    
    if (verificationResult.isValid && verificationResult.onChain) {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        title: 'Certificate Valid',
        message: 'This certificate is authentic and verified on the blockchain.'
      };
    }
    
    return {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      title: 'Verification Pending',
      message: 'Certificate found but verification is still in progress.'
    };
  };

  const verificationStatus = getVerificationStatus();

  return (
    <motion.div
      className="min-h-screen bg-gray-50 py-8"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          variants={fadeInUp}
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Certificate
          </h1>
          <p className="text-lg text-gray-600">
            Verify the authenticity of digital certificates on the blockchain
          </p>
        </motion.div>

        {/* Verification Methods */}
        <Card className="p-6 mb-8"
          variants={fadeInUp}
        >
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setVerificationMethod('search')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                verificationMethod === 'search'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search by ID</span>
            </button>
            
            <button
              onClick={() => setVerificationMethod('qr')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                verificationMethod === 'qr'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR Code</span>
            </button>
            
            <button
              onClick={() => setVerificationMethod('upload')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                verificationMethod === 'upload'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload File</span>
            </button>
          </div>

          {/* Search by ID */}
          {verificationMethod === 'search' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate ID
                </label>
                <div className="flex space-x-3">
                  <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter certificate ID (e.g., 12345)"
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleVerification()}
                  />
                  <Button
                    onClick={() => handleVerification()}
                    disabled={loading}
                    variant="primary"
                    size="md"
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* QR Code Scanner */}
          {verificationMethod === 'qr' && (
            <div className="text-center py-8">
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                QR Code Scanner
              </h3>
              <p className="text-gray-600 mb-4">
                Scan the QR code on your certificate to verify its authenticity
              </p>
              <Button
                onClick={handleQRScan}
                variant="primary"
                size="lg"
              >
                Open QR Scanner
              </Button>
            </div>
          )}

          {/* File Upload */}
          {verificationMethod === 'upload' && (
            <div className="text-center py-8">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload Certificate File
              </h3>
              <p className="text-gray-600 mb-4">
                Upload your certificate file to verify its authenticity
              </p>
              <input
                type="file"
                accept=".pdf,.json,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="hidden"
                id="certificate-upload"
              />
              <label
                htmlFor="certificate-upload"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </label>
            </div>
          )}
        </Card>

        {/* Error Message */}
        {error && (
          <Alert
            variant="error"
            closable
            onClose={() => setError(null)}
            className="mb-8"
          >
            {error}
          </Alert>
        )}

        {/* Verification Result */}
        {verificationStatus && (
          <motion.div
            className={`border rounded-lg p-6 mb-8 ${verificationStatus.bgColor} ${verificationStatus.borderColor}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-3">
              <verificationStatus.icon className={`w-6 h-6 ${verificationStatus.color}`} />
              <div>
                <h3 className={`font-semibold ${verificationStatus.color}`}>
                  {verificationStatus.title}
                </h3>
                <p className="text-gray-700 mt-1">
                  {verificationStatus.message}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Certificate Display */}
        {certificate && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <motion.div variants={staggerItem}>
              <CertificateCard
                certificate={{
                  ...certificate,
                  isValid: verificationResult?.isValid,
                  isRevoked: verificationResult?.isRevoked
                }}
                onVerify={() => handleVerification(certificate.tokenId)}
                onDownload={handleDownload}
                onShare={handleShare}
                variant="detailed"
              />
            </motion.div>

            {/* Blockchain Information */}
            <Card 
              className="p-6"
              variants={staggerItem}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Blockchain Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Transaction Hash</p>
                  <p className="font-mono text-sm text-gray-900 break-all">
                    {certificate.transactionHash || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Block Number</p>
                  <p className="font-mono text-sm text-gray-900">
                    {certificate.blockNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contract Address</p>
                  <p className="font-mono text-sm text-gray-900 break-all">
                    {certificate.contractAddress || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Network</p>
                  <p className="text-sm text-gray-900">
                    Polygon Mumbai Testnet
                  </p>
                </div>
              </div>
              
              {certificate.transactionHash && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <a
                    href={`https://mumbai.polygonscan.com/tx/${certificate.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View on PolygonScan</span>
                  </a>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default VerifyPage;