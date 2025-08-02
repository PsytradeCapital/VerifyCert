import React, { useState, useRef } from 'react';
import { Shield, Upload, Search, QrCode, AlertCircle, CheckCircle, XCircle, Camera } from 'lucide-react';
import CertificateCard from '../components/CertificateCard';

const VerifyPage = () => {
  const [verificationMethod, setVerificationMethod] = useState('id'); // 'id', 'file', 'qr'
  const [certificateId, setCertificateId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleVerifyById = async () => {
    if (!certificateId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setIsVerifying(true);
    setError('');
    setVerificationResult(null);

    try {
      const response = await fetch(`/api/certificates/verify/${certificateId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setVerificationResult(data.data);
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsVerifying(true);
    setError('');
    setVerificationResult(null);

    const formData = new FormData();
    formData.append('certificate', file);

    try {
      const response = await fetch('/api/certificates/verify-file', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setVerificationResult(data.data);
      } else {
        setError(data.error || 'File verification failed');
      }
    } catch (err) {
      console.error('File verification error:', err);
      setError('Failed to verify certificate file');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      handleFileUpload(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const startQRScanner = () => {
    // In a real implementation, you'd integrate with a QR code scanning library
    // like react-qr-scanner or use the device camera API
    alert('QR Scanner would be implemented here using a camera library');
  };

  const renderVerificationMethod = () => {
    switch (verificationMethod) {
      case 'id':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="certificateId" className="block text-sm font-medium text-gray-700 mb-2">
                Certificate ID
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  id="certificateId"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  placeholder="Enter certificate ID (e.g., 12345)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyById()}
                />
                <button
                  onClick={handleVerifyById}
                  disabled={isVerifying || !certificateId.trim()}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isVerifying ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Search className="w-4 h-4 mr-2" />
                      Verify
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'file':
        return (
          <div className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop certificate file here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF, PNG, JPG files up to 10MB
              </p>
              {selectedFile && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-700">
                    Selected: {selectedFile.name}
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        );

      case 'qr':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-8 mb-4">
                <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Scan QR Code
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Point your camera at the QR code on the certificate
                </p>
                <button
                  onClick={startQRScanner}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderVerificationResult = () => {
    if (!verificationResult) return null;

    const { certificate, isValid, blockchainProof, verificationDetails } = verificationResult;

    return (
      <div className="mt-8">
        <div className="mb-6">
          <div className={`flex items-center space-x-3 p-4 rounded-lg ${
            isValid 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {isValid ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <div>
              <h3 className={`font-semibold ${isValid ? 'text-green-800' : 'text-red-800'}`}>
                {isValid ? 'Certificate Verified' : 'Certificate Invalid'}
              </h3>
              <p className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                {verificationDetails?.message || (isValid 
                  ? 'This certificate is authentic and has been verified on the blockchain.'
                  : 'This certificate could not be verified or has been revoked.'
                )}
              </p>
            </div>
          </div>
        </div>

        <CertificateCard 
          certificate={{
            ...certificate,
            isValid,
            blockchainProof
          }}
          showActions={true}
          onVerify={() => {}}
          onDownload={(cert) => {
            // Implement download functionality
            console.log('Download certificate:', cert);
          }}
          onShare={(cert) => {
            // Implement share functionality
            if (navigator.share) {
              navigator.share({
                title: `${cert.courseName} Certificate`,
                text: `Certificate for ${cert.recipientName} from ${cert.institutionName}`,
                url: window.location.href
              });
            }
          }}
        />

        {blockchainProof && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Blockchain Verification Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Transaction Hash:</span>
                <p className="text-gray-600 font-mono break-all">
                  {blockchainProof.transactionHash}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Block Number:</span>
                <p className="text-gray-600">{blockchainProof.blockNumber}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Network:</span>
                <p className="text-gray-600">{blockchainProof.network}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Contract Address:</span>
                <p className="text-gray-600 font-mono break-all">
                  {blockchainProof.contractAddress}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
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
        </div>

        {/* Verification Methods */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setVerificationMethod('id')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                verificationMethod === 'id'
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
              onClick={() => setVerificationMethod('file')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                verificationMethod === 'file'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload File</span>
            </button>
          </div>

          {renderVerificationMethod()}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Verification Result */}
        {renderVerificationResult()}
      </div>
    </div>
  );
};

export default VerifyPage;