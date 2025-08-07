import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Share2, 
  ExternalLink, 
  Shield, 
  Calendar, 
  User, 
  GraduationCap, 
  Building,
  QrCode,
  Copy,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

const CertificateCard = ({ 
  certificate, 
  showQR = false, 
  isPublicView = false,
  className = '',
  onDownload,
  onShare,
  onViewOnBlockchain
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [showFullQR, setShowFullQR] = useState(false);
  const certificateRef = useRef(null);

  // Generate QR code for certificate verification
  const generateQRCode = async () => {
    if (qrCodeUrl) return;
    
    setIsGeneratingQR(true);
    try {
      const verificationUrl = `${window.location.origin}/verify?id=${certificate.tokenId}`;
      const qrUrl = await QRCode.toDataURL(verificationUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Download certificate as image
  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    try {
      if (!certificateRef.current) return;
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `certificate-${certificate.tokenId}-${certificate.recipientName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success('Certificate downloaded successfully');
    } catch (error) {
      console.error('Failed to download certificate:', error);
      toast.error('Failed to download certificate');
    }
  };

  // Share certificate
  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }

    const shareData = {
      title: `Certificate: ${certificate.courseName}`,
      text: `${certificate.recipientName} has completed ${certificate.courseName} from ${certificate.institutionName}`,
      url: `${window.location.origin}/verify?id=${certificate.tokenId}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Certificate link copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to share certificate:', error);
      toast.error('Failed to share certificate');
    }
  };

  // Copy certificate link
  const copyLink = async () => {
    try {
      const verificationUrl = `${window.location.origin}/verify?id=${certificate.tokenId}`;
      await navigator.clipboard.writeText(verificationUrl);
      toast.success('Verification link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };

  // View on blockchain explorer
  const viewOnBlockchain = () => {
    if (onViewOnBlockchain) {
      onViewOnBlockchain();
      return;
    }

    if (certificate.transactionHash) {
      const explorerUrl = `https://amoy.polygonscan.com/tx/${certificate.transactionHash}`;
      window.open(explorerUrl, '_blank');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get certificate status
  const getCertificateStatus = () => {
    if (certificate.isRevoked) {
      return {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Revoked',
        description: 'This certificate has been revoked'
      };
    }

    if (certificate.expiryDate && new Date(certificate.expiryDate) < new Date()) {
      return {
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        label: 'Expired',
        description: 'This certificate has expired'
      };
    }

    return {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'Valid',
      description: 'This certificate is valid and verified'
    };
  };

  const status = getCertificateStatus();

  React.useEffect(() => {
    if (showQR && !qrCodeUrl) {
      generateQRCode();
    }
  }, [showQR, qrCodeUrl]);

  return (
    <motion.div
      ref={certificateRef}
      className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Certificate Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Digital Certificate</h2>
              <p className="text-blue-100 text-sm">ID: {certificate.tokenId}</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`px-3 py-1 rounded-full ${status.bgColor} ${status.borderColor} border flex items-center space-x-2`}>
            <status.icon className={`w-4 h-4 ${status.color}`} />
            <span className={`text-sm font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>
      </div>

      {/* Certificate Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Certificate Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Information */}
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {certificate.courseName}
              </h3>
              <p className="text-gray-600 mb-4">
                This certifies that
              </p>
              <p className="text-3xl font-bold text-blue-600 mb-4">
                {certificate.recipientName}
              </p>
              <p className="text-gray-600">
                has successfully completed the above course
              </p>
            </div>

            {/* Certificate Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Building className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Institution</p>
                  <p className="text-gray-900">{certificate.institutionName}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Issue Date</p>
                  <p className="text-gray-900">{formatDate(certificate.issueDate)}</p>
                </div>
              </div>

              {certificate.expiryDate && (
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                    <p className="text-gray-900">{formatDate(certificate.expiryDate)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Recipient Address</p>
                  <p className="text-gray-900 font-mono text-xs break-all">
                    {certificate.recipientAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Blockchain Verification */}
            <div className={`p-4 rounded-lg ${status.bgColor} ${status.borderColor} border`}>
              <div className="flex items-start space-x-3">
                <Shield className={`w-5 h-5 ${status.color} mt-1`} />
                <div>
                  <p className={`font-medium ${status.color}`}>Blockchain Verified</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {status.description}. This certificate is stored on the Polygon blockchain and cannot be tampered with.
                  </p>
                  {certificate.transactionHash && (
                    <button
                      onClick={viewOnBlockchain}
                      className={`mt-2 text-sm ${status.color} hover:underline flex items-center space-x-1`}
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View on Blockchain Explorer</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* QR Code and Actions */}
          <div className="lg:col-span-1 space-y-4">
            {/* QR Code */}
            {showQR && (
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Scan to Verify
                </h4>
                {isGeneratingQR ? (
                  <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : qrCodeUrl ? (
                  <div className="relative">
                    <img
                      src={qrCodeUrl}
                      alt="Certificate verification QR code"
                      className="w-32 h-32 mx-auto border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setShowFullQR(true)}
                    />
                    <button
                      onClick={() => setShowFullQR(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-10 transition-all rounded-lg"
                      aria-label="View full QR code"
                    >
                      <QrCode className="w-6 h-6 text-transparent hover:text-white transition-colors" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={generateQRCode}
                    className="w-32 h-32 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <QrCode className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">Generate QR</span>
                  </button>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>

              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              <button
                onClick={copyLink}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </button>

              {certificate.transactionHash && (
                <button
                  onClick={viewOnBlockchain}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View on Chain</span>
                </button>
              )}
            </div>

            {/* Certificate Metadata */}
            {!isPublicView && (
              <div className="text-xs text-gray-500 space-y-1">
                <p>Issuer: {certificate.issuer?.slice(0, 10)}...</p>
                {certificate.transactionHash && (
                  <p>TX: {certificate.transactionHash.slice(0, 10)}...</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full QR Code Modal */}
      {showFullQR && qrCodeUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Certificate Verification QR Code
              </h3>
              <img
                src={qrCodeUrl}
                alt="Certificate verification QR code"
                className="w-64 h-64 mx-auto border border-gray-200 rounded-lg"
              />
              <p className="text-sm text-gray-600 mt-4 mb-6">
                Scan this QR code to verify the certificate authenticity
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={copyLink}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => setShowFullQR(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CertificateCard;