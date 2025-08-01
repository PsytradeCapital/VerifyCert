import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Search, 
  Upload, 
  QrCode
} from 'lucide-react';
import { pageTransition, fadeInUp } from '../src/utils/animations';
import { Card, Button, Alert, Input, VerificationResult } from '../src/components/ui';

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

        {/* Enhanced Verification Result */}
        {verificationResult && (
          <VerificationResult
            result={{
              ...verificationResult,
              transactionHash: certificate?.transactionHash,
              blockNumber: certificate?.blockNumber,
              contractAddress: certificate?.contractAddress,
              confidence: verificationResult.isRevoked ? 0 : 
                         verificationResult.isValid && verificationResult.onChain ? 100 :
                         verificationResult.isValid ? 75 : 0
            }}
            certificate={certificate}
            onDownload={() => handleDownload(certificate)}
            onShare={() => handleShare(certificate)}
            onViewOnBlockchain={() => {
              if (certificate?.transactionHash) {
                window.open(`https://mumbai.polygonscan.com/tx/${certificate.transactionHash}`, '_blank');
              }
            }}
          />
        )}
      </div>
    </motion.div>
  );
};

export default VerifyPage;