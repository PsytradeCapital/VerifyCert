import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  User, 
  GraduationCap, 
  Building, 
  Hash,
  ExternalLink,
  Download,
  Share2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import QRCode from 'qrcode';

const CertificateCard = ({ 
  certificate, 
  showQR = false, 
  isPublicView = false,
  className = '',
  onShare,
  onDownload
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Generate QR code for certificate verification
  useEffect(() => {
    if (showQR && certificate?.tokenId) {
      const verificationUrl = `${window.location.origin}/verify?id=${certificate.tokenId}`;
      
      QRCode.toDataURL(verificationUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error('Error generating QR code:', err));
    }
  }, [showQR, certificate?.tokenId]);

  if (!certificate) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">No certificate data available</p>
      </div>
    );
  }

  // Determine certificate status
  const isValid = certificate.isValid !== false && !certificate.isRevoked;
  const isExpired = certificate.expiryDate && new Date(certificate.expiryDate) < new Date();
  const isRevoked = certificate.isRevoked;

  // Status configuration
  const getStatusConfig = () => {
    if (isRevoked) {
      return {
        icon: XCircle,
        text: 'Revoked',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }
    if (isExpired) {
      return {
        icon: Clock,
        text: 'Expired',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      };
    }
    if (isValid) {
      return {
        icon: CheckCircle,
        text: 'Valid',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    }
    return {
      icon: AlertTriangle,
      text: 'Invalid',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Copy certificate link
  const copyLink = async () => {
    const verificationUrl = `${window.location.origin}/verify?id=${certificate.tokenId}`;
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Share certificate
  const handleShare = async () => {
    const verificationUrl = `${window.location.origin}/verify?id=${certificate.tokenId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate - ${certificate.courseName}`,
          text: `Verify this certificate for ${certificate.recipientName}`,
          url: verificationUrl
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      copyLink();
    }
    
    onShare?.(certificate);
  };

  // Download certificate
  const handleDownload = () => {
    onDownload?.(certificate);
  };

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-lg border-2 ${statusConfig.borderColor} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header with status */}
      <div className={`${statusConfig.bgColor} px-6 py-4 rounded-t-lg border-b ${statusConfig.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Digital Certificate
              </h3>
              <p className={`text-sm font-medium ${statusConfig.color}`}>
                Status: {statusConfig.text}
              </p>
            </div>
          </div>
          
          {/* Certificate ID */}
          <div className="text-right">
            <p className="text-xs text-gray-500">Certificate ID</p>
            <p className="text-sm font-mono font-medium text-gray-900">
              #{certificate.tokenId}
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Certificate details */}
          <div className="space-y-4">
            {/* Recipient */}
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Recipient</p>
                <p className="font-semibold text-gray-900">
                  {certificate.recipientName}
                </p>
                {!isPublicView && (
                  <p className="text-xs text-gray-400 font-mono">
                    {certificate.recipientAddress}
                  </p>
                )}
              </div>
            </div>

            {/* Course */}
            <div className="flex items-start space-x-3">
              <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Course</p>
                <p className="font-semibold text-gray-900">
                  {certificate.courseName}
                </p>
              </div>
            </div>

            {/* Institution */}
            <div className="flex items-start space-x-3">
              <Building className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Institution</p>
                <p className="font-semibold text-gray-900">
                  {certificate.institutionName}
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Issue Date</p>
                <p className="font-medium text-gray-900">
                  {formatDate(certificate.issueDate)}
                </p>
                {certificate.expiryDate && (
                  <>
                    <p className="text-sm text-gray-500 mt-1">Expiry Date</p>
                    <p className={`font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(certificate.expiryDate)}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* QR Code and actions */}
          <div className="flex flex-col items-center space-y-4">
            {showQR && qrCodeUrl && (
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <img 
                  src={qrCodeUrl} 
                  alt="Certificate verification QR code"
                  className="w-32 h-32"
                />
                <p className="text-xs text-gray-500 text-center mt-2">
                  Scan to verify
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>{copySuccess ? 'Copied!' : 'Share'}</span>
              </button>

              {onDownload && (
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              )}

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <Hash className="w-4 h-4" />
                <span>Details</span>
              </button>
            </div>
          </div>
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-gray-200"
          >
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Technical Details
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Token ID</p>
                <p className="font-mono text-gray-900">{certificate.tokenId}</p>
              </div>
              
              <div>
                <p className="text-gray-500">Issuer Address</p>
                <p className="font-mono text-gray-900 break-all">
                  {certificate.issuer}
                </p>
              </div>

              {certificate.transactionHash && (
                <div>
                  <p className="text-gray-500">Transaction Hash</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-mono text-gray-900 break-all">
                      {certificate.transactionHash}
                    </p>
                    <a
                      href={`https://amoy.polygonscan.com/tx/${certificate.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {certificate.metadataURI && (
                <div>
                  <p className="text-gray-500">Metadata URI</p>
                  <a
                    href={certificate.metadataURI}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 break-all"
                  >
                    {certificate.metadataURI}
                  </a>
                </div>
              )}
            </div>

            {/* Blockchain verification link */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">
                This certificate is stored on the Polygon Amoy blockchain and can be independently verified.
              </p>
              <a
                href={`https://amoy.polygonscan.com/token/${process.env.REACT_APP_CONTRACT_ADDRESS}?a=${certificate.tokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
              >
                <span>View on PolygonScan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        )}
      </div>

      {/* Warning for invalid certificates */}
      {(!isValid || isRevoked || isExpired) && (
        <div className={`${statusConfig.bgColor} px-6 py-3 rounded-b-lg border-t ${statusConfig.borderColor}`}>
          <div className="flex items-center space-x-2">
            <AlertTriangle className={`w-4 h-4 ${statusConfig.color}`} />
            <p className={`text-sm ${statusConfig.color}`}>
              {isRevoked && 'This certificate has been revoked by the issuer.'}
              {isExpired && !isRevoked && 'This certificate has expired.'}
              {!isValid && !isRevoked && !isExpired && 'This certificate is not valid.'}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CertificateCard;