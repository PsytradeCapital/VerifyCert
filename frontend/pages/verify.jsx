import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Upload, 
  QrCode, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Camera,
  FileText,
  Shield,
  ExternalLink,
  Copy
} from 'lucide-react';
import CertificateCard from '../components/CertificateCard';
import { 
  Button, 
  Input, 
  Card, 
  Alert, 
  FileUpload, 
  LoadingSpinner, 
  PageTransition
} from '../src/components/ui';

/**
 * Certificate Verification Page
 * Enhanced UI for verifying certificates by hash, QR code, or file upload
 */
const VerifyPage = () => {
  const { hash } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [verificationMethod, setVerificationMethod] = useState('hash');
  const [certificateHash, setCertificateHash] = useState(hash || '');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showQrScanner, setShowQrScanner] = useState(false);
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Auto-verify if hash is provided in URL
  useEffect(() => {
    if (hash && hash.length > 0) {
      setCertificateHash(hash);
      handleVerification(hash);
    }
  }, [hash]);

  // Cleanup QR scanner on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  /**
   * Handle certificate verification
   */
  const handleVerification = async (hashToVerify = certificateHash) => {
    if (!hashToVerify.trim()) {
      setError('Please enter a certificate hash');
      return;
    }

    setIsLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      const response = await fetch(`/api/certificates/verify/${hashToVerify}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setVerificationResult(data.data);
      
      // Update URL if not already there
      if (!hash) {
        navigate(`/verify/${hashToVerify}`, { replace: true });
      }

    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify certificate');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle file upload for QR code scanning
   */
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create canvas to process image
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // In production, use a QR code library like jsQR
        // For demo purposes, we'll simulate QR code detection
        const simulatedHash = 'demo_hash_from_qr_' + Date.now();
        setCertificateHash(simulatedHash);
        await handleVerification(simulatedHash);
      };

      img.onerror = () => {
        setError('Failed to process image');
        setIsLoading(false);
      };

      img.src = URL.createObjectURL(file);

    } catch (err) {
      console.error('File processing error:', err);
      setError('Failed to process uploaded file');
      setIsLoading(false);
    }
  };

  /**
   * Start QR code camera scanning
   */
  const startQrScanning = async () => {
    try {
      setShowQrScanner(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // In production, implement actual QR scanning with jsQR or similar
      // For demo, simulate scanning after 3 seconds
      setTimeout(() => {
        const simulatedHash = 'demo_hash_from_camera_' + Date.now();
        setCertificateHash(simulatedHash);
        handleVerification(simulatedHash);
        stopQrScanning();
      }, 3000);

    } catch (err) {
      console.error('Camera access error:', err);
      setError('Failed to access camera. Please check permissions.');
      setShowQrScanner(false);
    }
  };

  /**
   * Stop QR code scanning
   */
  const stopQrScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowQrScanner(false);
  };

  /**
   * Copy verification URL to clipboard
   */
  const copyVerificationUrl = async () => {
    if (!certificateHash) return;
    
    const url = `${window.location.origin}/verify/${certificateHash}`;
    try {
      await navigator.clipboard.writeText(url);
      // Show success toast (implement toast system)
      console.log('URL copied to clipboard');
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  /**
   * Get verification status display
   */
  const getVerificationDisplay = () => {
    if (!verificationResult) return null;

    const { exists, isValid, isExpired, isRevoked } = verificationResult;

    if (!exists) {
      return {
        status: 'not-found',
        icon: XCircle,
        color: 'text-error-600',
        bgColor: 'bg-error-50',
        borderColor: 'border-error-200',
        title: 'Certificate Not Found',
        message: 'No certificate found with this hash'
      };
    }

    if (isRevoked) {
      return {
        status: 'revoked',
        icon: XCircle,
        color: 'text-error-600',
        bgColor: 'bg-error-50',
        borderColor: 'border-error-200',
        title: 'Certificate Revoked',
        message: 'This certificate has been revoked by the issuer'
      };
    }

    if (isExpired) {
      return {
        status: 'expired',
        icon: AlertTriangle,
        color: 'text-warning-600',
        bgColor: 'bg-warning-50',
        borderColor: 'border-warning-200',
        title: 'Certificate Expired',
        message: 'This certificate has expired'
      };
    }

    if (isValid) {
      return {
        status: 'valid',
        icon: CheckCircle,
        color: 'text-success-600',
        bgColor: 'bg-success-50',
        borderColor: 'border-success-200',
        title: 'Certificate Verified',
        message: 'This certificate is authentic and valid'
      };
    }

    return {
      status: 'invalid',
      icon: XCircle,
      color: 'text-error-600',
      bgColor: 'bg-error-50',
      borderColor: 'border-error-200',
      title: 'Certificate Invalid',
      message: 'This certificate is not valid'
    };
  };

  const verificationDisplay = getVerificationDisplay();

  return (
    <PageTransition>
      <div className="min-h-screen bg-neutral-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="container-responsive py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Shield className="w-16 h-16 mx-auto mb-6 text-primary-200" />
              <h1 className="text-4xl font-bold mb-4">
                Verify Certificate
              </h1>
              <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                Instantly verify the authenticity of any certificate issued on our platform
              </p>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-responsive py-12">
          {/* Verification Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card variant="elevated" padding="lg" className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
                Choose Verification Method
              </h2>

              {/* Method Selector */}
              <div className="flex flex-wrap gap-4 mb-8">
                {[
                  { id: 'hash', label: 'Certificate Hash', icon: FileText },
                  { id: 'qr', label: 'QR Code Upload', icon: Upload },
                  { id: 'camera', label: 'Scan QR Code', icon: QrCode }
                ].map(({ id, label, icon: Icon }) => (
                  <Button
                    key={id}
                    variant={verificationMethod === id ? 'primary' : 'secondary'}
                    onClick={() => setVerificationMethod(id)}
                    icon={<Icon className="w-5 h-5" />}
                    className="flex items-center gap-3 interactive"
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {/* Hash Input Method */}
              {verificationMethod === 'hash' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="flex gap-3">
                    <Input
                      label="Certificate Hash"
                      value={certificateHash}
                      onChange={(e) => setCertificateHash(e.target.value)}
                      placeholder="Enter certificate hash..."
                      className="flex-1"
                    />
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-end"
                    >
                      <Button
                        onClick={() => handleVerification()}
                        disabled={isLoading || !certificateHash.trim()}
                        loading={isLoading}
                        icon={isLoading ? <LoadingSpinner size="sm" /> : <Search className="w-5 h-5" />}
                        className="px-6 py-3"
                      >
                        Verify
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* QR Upload Method */}
              {verificationMethod === 'qr' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <FileUpload
                    onFileSelect={handleFileUpload}
                    accept="image/*"
                    label="Upload QR Code Image"
                    helperText="Select an image file containing a QR code"
                    maxSize={5 * 1024 * 1024} // 5MB
                  />
                </motion.div>
              )}

              {/* Camera Scanning Method */}
              {verificationMethod === 'camera' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {!showQrScanner ? (
                    <div className="text-center">
                      <Button
                        onClick={startQrScanning}
                        variant="primary"
                        size="lg"
                        icon={<Camera className="w-6 h-6" />}
                        className="px-8 py-4"
                      >
                        Start Camera Scanning
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        className="w-full max-w-md mx-auto rounded-lg"
                        autoPlay
                        playsInline
                      />
                      <div className="absolute inset-0 border-2 border-primary-400 rounded-lg pointer-events-none">
                        <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-primary-400"></div>
                        <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-primary-400"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-primary-400"></div>
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-primary-400"></div>
                      </div>
                      <Button
                        onClick={stopQrScanning}
                        variant="danger"
                        size="sm"
                        icon={<XCircle className="w-5 h-5" />}
                        className="absolute top-4 right-4"
                      >
                        Stop
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </Card>
          </motion.div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8"
              >
                <Alert
                  variant="error"
                  title="Verification Error"
                  dismissible
                  onDismiss={() => setError(null)}
                >
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mb-8"
              >
                <Card variant="elevated" padding="lg" className="text-center">
                  <div className="animate-pulse-slow">
                    <LoadingSpinner size="xl" className="mx-auto mb-4" />
                  </div>
                  <p className="text-lg font-medium text-neutral-700">
                    Verifying certificate...
                  </p>
                  <p className="text-neutral-500">
                    Please wait while we check the blockchain
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Verification Result */}
          <AnimatePresence>
            {verificationDisplay && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-8"
              >
                {/* Status Display */}
                <div className={`
                  ${verificationDisplay.bgColor} ${verificationDisplay.borderColor}
                  border rounded-xl p-8 text-center
                `}>
                  <verificationDisplay.icon className={`w-16 h-16 ${verificationDisplay.color} mx-auto mb-4`} />
                  <h3 className={`text-2xl font-bold ${verificationDisplay.color} mb-2`}>
                    {verificationDisplay.title}
                  </h3>
                  <p className="text-lg text-neutral-600">
                    {verificationDisplay.message}
                  </p>
                  
                  {certificateHash && (
                    <div className="mt-6 flex items-center justify-center gap-4">
                      <button
                        onClick={copyVerificationUrl}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-700 hover:bg-white rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Verification URL
                      </button>
                      <a
                        href={`/verify/${certificateHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-white rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open in New Tab
                      </a>
                    </div>
                  )}
                </div>

                {/* Certificate Details */}
                {verificationResult?.certificate && (
                  <CertificateCard
                    certificate={verificationResult.certificate}
                    variant="premium"
                    showActions={true}
                    showQRCode={true}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </PageTransition>
  );
};

export default VerifyPage;