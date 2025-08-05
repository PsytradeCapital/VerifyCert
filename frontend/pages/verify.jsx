import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import CertificateCard from '../components/CertificateCard';
import FileUpload from '../src/components/ui/FileUpload/FileUpload';
import Input from '../src/components/ui/Input/Input';
import Button from '../src/components/ui/Button/Button';
import { ariaLabels, ariaDescriptions, generateAriaId } from '../src/utils/ariaUtils';
import { useFeedbackAnimations } from '../src/hooks/useFeedbackAnimations';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export default function VerifyPage() {
  const { tokenId } = useParams();
  const [searchParams] = useSearchParams();
  const feedback = useFeedbackAnimations();
  
  // State management
  const [certificate, setCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationMethod, setVerificationMethod] = useState('id');
  const [inputValue, setInputValue] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [verificationHistory, setVerificationHistory] = useState([]);

  // Form IDs for accessibility
  const formId = generateAriaId('verification-form');
  const resultsId = generateAriaId('verification-results');
  const historyId = generateAriaId('verification-history');

  // Load certificate if tokenId is provided in URL
  useEffect(() => {
    const urlTokenId = tokenId || searchParams.get('id');
    const txHash = searchParams.get('tx');
    
    if (urlTokenId) {
      setVerificationMethod('id');
      setInputValue(urlTokenId);
      verifyCertificate({ certificateId: urlTokenId });
    } else if (txHash) {
      setVerificationMethod('transaction');
      setInputValue(txHash);
      verifyCertificate({ transactionHash: txHash });
    }
  }, [tokenId, searchParams]);

  // Load verification history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('verificationHistory');
    if (savedHistory) {
      try {
        setVerificationHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load verification history:', error);
      }
    }
  }, []);

  // Save verification to history
  const saveToHistory = (verificationData) => {
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      method: verificationData.method,
      input: verificationData.input,
      isValid: verificationData.isValid,
      certificateId: verificationData.certificate?.tokenId,
      recipientName: verificationData.certificate?.recipientName,
      courseName: verificationData.certificate?.courseName,
    };

    const newHistory = [historyItem, ...verificationHistory.slice(0, 9)];
    setVerificationHistory(newHistory);
    localStorage.setItem('verificationHistory', JSON.stringify(newHistory));
  };

  // Verify certificate function
  const verifyCertificate = async (verificationData) => {
    setIsLoading(true);
    setError(null);
    setCertificate(null);

    try {
      const response = await fetch(`${API_BASE_URL}/verify-certificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      if (data.success && data.certificate) {
        setCertificate(data.certificate);
        saveToHistory({
          method: data.verificationDetails.method,
          input: Object.values(verificationData)[0],
          isValid: data.isValid,
          certificate: data.certificate,
        });

        if (data.isValid) {
          feedback.showSuccess('Certificate verified successfully!', {
            showConfetti: true,
            position: 'top-center'
          });
        } else {
          feedback.showWarning('Certificate found but may be invalid or revoked', {
            position: 'top-center'
          });
        }
      } else {
        setError(data.message || 'Certificate not found');
        feedback.showError(data.message || 'Certificate not found', {
          shake: true
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError(error.message);
      feedback.showError(error.message, {
        shake: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) {
      setError('Please enter a certificate ID or transaction hash');
      feedback.showError('Please enter a certificate ID or transaction hash');
      return;
    }

    const verificationData = {};
    
    if (verificationMethod === 'id') {
      if (!/^\d+$/.test(inputValue.trim())) {
        setError('Certificate ID must be a valid number');
        feedback.showError('Certificate ID must be a valid number');
        return;
      }
      verificationData.certificateId = inputValue.trim();
    } else if (verificationMethod === 'transaction') {
      if (!/^0x[a-fA-F0-9]{64}$/.test(inputValue.trim())) {
        setError('Transaction hash must be a valid Ethereum transaction hash');
        feedback.showError('Invalid transaction hash format');
        return;
      }
      verificationData.transactionHash = inputValue.trim();
    }

    verifyCertificate(verificationData);
  };

  // Handle file upload
  const handleFileUpload = (files) => {
    setUploadedFiles(files);
    if (files.length > 0) {
      toast.error('File verification is not yet implemented. Please use Certificate ID instead.');
    }
  };

  // Handle verification method change
  const handleMethodChange = (method) => {
    setVerificationMethod(method);
    setInputValue('');
    setError(null);
    setCertificate(null);
    setUploadedFiles([]);
  };

  // Handle history item click
  const handleHistoryClick = (historyItem) => {
    if (historyItem.method === 'certificateId') {
      setVerificationMethod('id');
      setInputValue(historyItem.certificateId);
      verifyCertificate({ certificateId: historyItem.certificateId });
    }
  };

  // Clear verification history
  const clearHistory = () => {
    setVerificationHistory([]);
    localStorage.removeItem('verificationHistory');
    toast.success('Verification history cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Verify Certificate
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Verify the authenticity of blockchain certificates using certificate ID, transaction hash, or by uploading the certificate file.
          </motion.p>
        </div>

        {/* Verification Methods */}
        <motion.div 
          className="bg-white rounded-lg shadow-md p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Choose Verification Method
          </h2>
          
          {/* Method Selection */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => handleMethodChange('id')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                verificationMethod === 'id'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-pressed={verificationMethod === 'id'}
            >
              Certificate ID
            </button>
            
            <button
              onClick={() => handleMethodChange('transaction')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                verificationMethod === 'transaction'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-pressed={verificationMethod === 'transaction'}
            >
              Transaction Hash
            </button>
            
            <button
              onClick={() => handleMethodChange('file')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                verificationMethod === 'file'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-pressed={verificationMethod === 'file'}
            >
              Upload File
            </button>
          </div>

          {/* Verification Form */}
          <form id={formId} onSubmit={handleSubmit} className="space-y-4">
            {verificationMethod === 'file' ? (
              <FileUpload
                onFileSelect={handleFileUpload}
                accept=".pdf,.json,.png,.jpg,.jpeg"
                maxSize={10 * 1024 * 1024}
                label="Upload Certificate File"
                helperText="Supported formats: PDF, JSON, PNG, JPG (max 10MB)"
                showPreview={true}
              />
            ) : (
              <Input
                label={verificationMethod === 'id' ? 'Certificate ID' : 'Transaction Hash'}
                placeholder={
                  verificationMethod === 'id' 
                    ? 'Enter certificate ID (e.g., 123)' 
                    : 'Enter transaction hash (0x...)'
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                error={error}
                helperText={
                  verificationMethod === 'id'
                    ? 'The unique identifier for the certificate'
                    : 'The blockchain transaction hash where the certificate was issued'
                }
                required
                fieldName="verification-input"
              />
            )}

            <Button
              type="submit"
              loading={isLoading}
              disabled={verificationMethod === 'file' && uploadedFiles.length === 0}
              className="w-full sm:w-auto"
            >
              {isLoading ? 'Verifying...' : 'Verify Certificate'}
            </Button>
          </form>
        </motion.div>

        {/* Verification Results */}
        <AnimatePresence>
          {certificate && (
            <motion.div
              id={resultsId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
              role="region"
              aria-labelledby="results-heading"
            >
              <h2 id="results-heading" className="text-2xl font-semibold text-gray-900 mb-4">
                Verification Results
              </h2>
              <CertificateCard
                certificate={certificate}
                showQR={true}
                isPublicView={true}
                className="max-w-none"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verification History */}
        {verificationHistory.length > 0 && (
          <motion.div
            id={historyId}
            className="bg-white rounded-lg shadow-md p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            role="region"
            aria-labelledby="history-heading"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="history-heading" className="text-xl font-semibold text-gray-900">
                Recent Verifications
              </h2>
              <button
                onClick={clearHistory}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Clear verification history"
              >
                Clear History
              </button>
            </div>
            
            <div className="space-y-3">
              {verificationHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleHistoryClick(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleHistoryClick(item);
                    }
                  }}
                  aria-label={`Verify certificate ${item.certificateId} for ${item.recipientName}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.isValid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.isValid ? 'Valid' : 'Invalid'}
                      </span>
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {item.recipientName || 'Unknown Recipient'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {item.courseName || 'Unknown Course'} • ID: {item.certificateId}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Help Section */}
        <motion.div
          className="bg-blue-50 rounded-lg p-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How to Verify Certificates
          </h3>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <strong>Certificate ID:</strong> Look for the certificate ID number in your certificate document or QR code.
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <strong>Transaction Hash:</strong> Use the blockchain transaction hash if you have the transaction details.
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <strong>File Upload:</strong> Upload the certificate file directly for automatic verification (coming soon).
              </div>
            </div>
          </div>
        </motion.div>

        {/* QR Code Scanner Info */}
        <motion.div
          className="text-center mt-8 p-4 bg-gray-100 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-gray-600">
            <strong>Tip:</strong> If you have a QR code on your certificate, scan it with your mobile device to automatically verify the certificate.
          </p>
        </motion.div>
      </div>
    </div>
  );
}