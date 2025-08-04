import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Search, 
  Upload, 
  QrCode, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ExternalLink,
  Download,
  Share2,
  Loader2,
  Camera,
  FileText,
  Globe
} from 'lucide-react';

import CertificateCard from '../components/CertificateCard';
import FileUpload from '../components/ui/FileUpload/FileUpload';
import Input from '../components/ui/Input/Input';
import Button from '../components/ui/Button/Button';
import Modal from '../components/ui/Modal/Modal';
import { useFeedbackAnimations } from '../hooks/useFeedbackAnimations';
import { ariaLabels, ariaDescriptions, generateAriaId } from '../utils/ariaUtils';

const VerifyPage = () => {
  const { tokenId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const feedback = useFeedbackAnimations();

  // State management
  const [verificationMethod, setVerificationMethod] = useState('id'); // 'id', 'file', 'qr'
  const [certificateId, setCertificateId] = useState(tokenId || searchParams.get('id') || '');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [recentVerifications, setRecentVerifications] = useState([]);

  // Generate IDs for accessibility
  const pageId = generateAriaId('verify-page');
  const methodsId = generateAriaId('verification-methods');
  const resultsId = generateAriaId('verification-results');

  // Load recent verifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentVerifications');
    if (stored) {
      try {
        setRecentVerifications(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load recent verifications:', error);
      }
    }
  }, []);

  // Auto-verify if tokenId is provided in URL
  useEffect(() => {
    if (tokenId && !verificationResult && !isVerifying) {
      handleVerifyById(tokenId);
    }
  }, [tokenId]);

  // Save recent verification
  const saveRecentVerification = useCallback((result) => {
    const recent = {
      id: result.certificate.tokenId,
      recipientName: result.certificate.recipientName,
      courseName: result.certificate.courseName,
      institutionName: result.certificate.institutionName,
      verifiedAt: new Date().toISOString(),
      isValid: result.isValid
    };

    const updated = [recent, ...recentVerifications.filter(r => r.id !== recent.id)].slice(0, 5);
    setRecentVerifications(updated);
    localStorage.setItem('recentVerifications', JSON.stringify(updated));
  }, [recentVerifications]);

  // Verify certificate by ID
  const handleVerifyById = async (id = certificateId) => {
    if (!id.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);

    try {
      const response = await fetch(`/api/verify-certificate/${id}`);
      const data = await response.json();

      if (data.success) {
        setVerificationResult(data);
        saveRecentVerification(data);
        
        if (data.isValid) {
          feedback.showSuccess('Certificate verified successfully!', {
            showConfetti: true,
            position: 'top-center'
          });
        } else {
          feedback.showWarning('Certificate verification failed', {
            position: 'top-center'
          });
        }
      } else {
        setError(data.message || 'Verification failed');
        feedback.showError(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Network error. Please try again.');
      feedback.showError('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Verify certificate from uploaded file
  const handleVerifyFromFile = async (files) => {
    if (files.length === 0) return;

    const file = files[0];
    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);

    try {
      const formData = new FormData();
      formData.append('certificate', file);

      const response = await fetch('/api/verify-certificate/file', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setVerificationResult(data);
        saveRecentVerification(data);
        
        if (data.isValid) {
          feedback.showSuccess('Certificate verified from file!', {
            showConfetti: true
          });
        } else {
          feedback.showWarning('Certificate file verification failed');
        }
      } else {
        setError(data.message || 'File verification failed');
        feedback.showError(data.message || 'File verification failed');
      }
    } catch (error) {
      console.error('File verification error:', error);
      setError('Failed to verify certificate file');
      feedback.showError('Failed to verify certificate file');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle QR code scan result
  const handleQRScanResult = (result) => {
    setShowQRScanner(false);
    
    // Extract certificate ID from QR code URL
    const urlMatch = result.match(/\/verify\/(\w+)/);
    if (urlMatch) {
      const scannedId = urlMatch[1];
      setCertificateId(scannedId);
      handleVerifyById(scannedId);
    } else {
      setError('Invalid QR code format');
      feedback.showError('Invalid QR code format');
    }
  };

  // Clear verification results
  const handleClearResults = () => {
    setVerificationResult(null);
    setError(null);
    setCertificateId('');
    setUploadedFiles([]);
  };

  // Handle recent verification click
  const handleRecentVerificationClick = (recent) => {
    setCertificateId(recent.id);
    handleVerifyById(recent.id);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const methodVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  return (
    <motion.div
      id={pageId}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white py-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Shield className="h-12 w-12" aria-hidden="true" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Verify Certificate
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Instantly verify the authenticity of blockchain-secured certificates
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-blue-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" aria-hidden="true" />
                <span>Blockchain Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" aria-hidden="true" />
                <span>Tamper Proof</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5" aria-hidden="true" />
                <span>Globally Accessible</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Verification Methods */}
          <motion.section
            id={methodsId}
            className="mb-12"
            aria-labelledby="methods-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 id="methods-heading" className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Choose Verification Method
            </h2>

            {/* Method Selection Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8" role="tablist" aria-label="Verification methods">
              {[
                { id: 'id', label: 'Certificate ID', icon: Search, description: 'Enter certificate ID number' },
                { id: 'file', label: 'Upload File', icon: Upload, description: 'Upload certificate file' },
                { id: 'qr', label: 'QR Code', icon: QrCode, description: 'Scan QR code' }
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setVerificationMethod(method.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    verificationMethod === method.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                  role="tab"
                  aria-selected={verificationMethod === method.id}
                  aria-controls={`${method.id}-panel`}
                  aria-describedby={`${method.id}-description`}
                >
                  <method.icon className="h-5 w-5" aria-hidden="true" />
                  <span>{method.label}</span>
                  <div id={`${method.id}-description`} className="sr-only">
                    {method.description}
                  </div>
                </button>
              ))}
            </div>

            {/* Verification Forms */}
            <AnimatePresence mode="wait">
              {/* Certificate ID Method */}
              {verificationMethod === 'id' && (
                <motion.div
                  id="id-panel"
                  role="tabpanel"
                  aria-labelledby="id-tab"
                  className="bg-white rounded-xl shadow-lg p-8 border border-gray-200"
                  variants={methodVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <Search className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      Verify by Certificate ID
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <Input
                      label="Certificate ID"
                      placeholder="Enter certificate ID (e.g., 12345)"
                      value={certificateId}
                      onChange={(e) => setCertificateId(e.target.value)}
                      error={error && verificationMethod === 'id' ? error : ''}
                      helperText="Enter the unique certificate ID number"
                      icon={<FileText className="h-4 w-4" />}
                      fieldName="certificateId"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isVerifying) {
                          handleVerifyById();
                        }
                      }}
                    />
                    
                    <Button
                      onClick={() => handleVerifyById()}
                      disabled={isVerifying || !certificateId.trim()}
                      loading={isVerifying}
                      className="w-full"
                      size="lg"
                      icon={isVerifying ? <Loader2 className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    >
                      {isVerifying ? 'Verifying...' : 'Verify Certificate'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* File Upload Method */}
              {verificationMethod === 'file' && (
                <motion.div
                  id="file-panel"
                  role="tabpanel"
                  aria-labelledby="file-tab"
                  className="bg-white rounded-xl shadow-lg p-8 border border-gray-200"
                  variants={methodVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <Upload className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      Verify by File Upload
                    </h3>
                  </div>
                  
                  <FileUpload
                    onFileSelect={handleVerifyFromFile}
                    accept=".pdf,.json,.png,.jpg,.jpeg"
                    maxSize={10 * 1024 * 1024} // 10MB
                    label="Upload Certificate File"
                    helperText="Supported formats: PDF, JSON, PNG, JPG (max 10MB)"
                    error={error && verificationMethod === 'file' ? error : ''}
                    disabled={isVerifying}
                    showPreview={true}
                  />
                  
                  {isVerifying && (
                    <div className="mt-4 flex items-center justify-center space-x-2 text-blue-600">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Verifying certificate file...</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* QR Code Method */}
              {verificationMethod === 'qr' && (
                <motion.div
                  id="qr-panel"
                  role="tabpanel"
                  aria-labelledby="qr-tab"
                  className="bg-white rounded-xl shadow-lg p-8 border border-gray-200"
                  variants={methodVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <QrCode className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      Verify by QR Code
                    </h3>
                  </div>
                  
                  <div className="text-center space-y-6">
                    <div className="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300">
                      <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        Scan the QR code on your certificate to verify its authenticity
                      </p>
                      <Button
                        onClick={() => setShowQRScanner(true)}
                        icon={<Camera className="h-4 w-4" />}
                        size="lg"
                      >
                        Open QR Scanner
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-500">
                      Make sure your camera is enabled and point it at the QR code
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Recent Verifications */}
          {recentVerifications.length > 0 && !verificationResult && (
            <motion.section
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Verifications</h3>
              <div className="grid gap-3">
                {recentVerifications.map((recent, index) => (
                  <button
                    key={recent.id}
                    onClick={() => handleRecentVerificationClick(recent)}
                    className="text-left bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {recent.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                          )}
                          <span className="font-medium text-gray-900 truncate">
                            {recent.recipientName}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {recent.courseName} • {recent.institutionName}
                        </p>
                        <p className="text-xs text-gray-400">
                          Verified {new Date(recent.verifiedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {/* Verification Results */}
          <AnimatePresence>
            {verificationResult && (
              <motion.section
                id={resultsId}
                className="mb-12"
                aria-labelledby="results-heading"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 id="results-heading" className="text-2xl font-bold text-gray-900">
                    Verification Results
                  </h2>
                  <Button
                    onClick={handleClearResults}
                    variant="secondary"
                    size="sm"
                  >
                    Clear Results
                  </Button>
                </div>

                {/* Verification Status */}
                <div className={`rounded-xl p-6 mb-6 border-2 ${
                  verificationResult.isValid
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    {verificationResult.isValid ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-600" />
                    )}
                    <div>
                      <h3 className={`text-xl font-semibold ${
                        verificationResult.isValid ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {verificationResult.isValid ? 'Certificate Verified' : 'Certificate Invalid'}
                      </h3>
                      <p className={`${
                        verificationResult.isValid ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {verificationResult.message}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Certificate Details */}
                {verificationResult.certificate && (
                  <CertificateCard
                    certificate={verificationResult.certificate}
                    showQR={true}
                    isPublicView={true}
                    className="shadow-xl"
                  />
                )}

                {/* Verification Details */}
                {verificationResult.verification && (
                  <div className="mt-6 bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Verification Details</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Verified At:</span>
                        <p className="text-gray-900">
                          {new Date(verificationResult.verification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Blockchain Network:</span>
                        <p className="text-gray-900">{verificationResult.verification.network}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Contract Address:</span>
                        <p className="text-gray-900 font-mono text-xs">
                          {verificationResult.verification.contractAddress}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Block Number:</span>
                        <p className="text-gray-900">{verificationResult.verification.blockNumber}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>

          {/* Error Display */}
          <AnimatePresence>
            {error && !verificationResult && (
              <motion.div
                className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-900">Verification Failed</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <Modal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        title="QR Code Scanner"
        size="md"
      >
        <div className="p-6 text-center">
          <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            QR code scanning functionality would be implemented here using a camera library
          </p>
          <p className="text-sm text-gray-500">
            For demo purposes, you can manually enter the certificate ID above
          </p>
        </div>
      </Modal>
    </motion.div>
  );
};

export default VerifyPage;