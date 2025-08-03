import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Calendar, 
  Building, 
  User, 
  ExternalLink, 
  Download, 
  Share2, 
  Shield,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * CertificateCard Component
 * Displays certificate information with verification status and actions
 */
const CertificateCard = ({
  certificate,
  variant = 'default',
  showActions = true,
  className = '',
  onVerify,
  onDownload,
  onShare
}) => {
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp * 1000); // Convert from Unix timestamp
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle certificate verification
  const handleVerify = async () => {
    if (!onVerify || isVerifying) return;
    
    setIsVerifying(true);
    try {
      await onVerify(certificate.tokenId);
      toast.success('Certificate verified successfully');
    } catch (error) {
      toast.error('Failed to verify certificate');
      console.error('Verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle copy certificate link
  const handleCopyLink = async () => {
    const certificateUrl = `${window.location.origin}/verify/${certificate.tokenId}`;
    
    try {
      await navigator.clipboard.writeText(certificateUrl);
      setCopied(true);
      toast.success('Certificate link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  // Handle share certificate
  const handleShare = async () => {
    const certificateUrl = `${window.location.origin}/verify/${certificate.tokenId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate: ${certificate.courseName}`,
          text: `${certificate.recipientName} has completed ${certificate.courseName} at ${certificate.institutionName}`,
          url: certificateUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
    
    if (onShare) {
      onShare(certificate);
    }
  };

  // Handle download certificate
  const handleDownload = () => {
    if (onDownload) {
      onDownload(certificate);
    } else {
      // Default download behavior - open in new tab
      const certificateUrl = `${window.location.origin}/certificate/${certificate.tokenId}`;
      window.open(certificateUrl, '_blank');
    }
  };

  // Determine certificate status
  const getStatusInfo = () => {
    if (certificate.isRevoked) {
      return {
        status: 'revoked',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: AlertTriangle,
        text: 'Revoked'
      };
    }
    
    if (certificate.isVerified === true) {
      return {
        status: 'verified',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: Shield,
        text: 'Verified'
      };
    }
    
    return {
      status: 'unverified',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: Shield,
      text: 'Unverified'
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  // Card variants
  const cardVariants = {
    default: 'bg-white border border-gray-200 shadow-sm hover:shadow-md',
    elevated: 'bg-white shadow-lg hover:shadow-xl',
    minimal: 'bg-gray-50 border border-gray-100'
  };

  return (
    <motion.div
      className={`
        rounded-lg transition-all duration-200 overflow-hidden
        ${cardVariants[variant]}
        ${className}
      `}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Certificate Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {certificate.courseName || 'Certificate'}
              </h3>
              <p className="text-sm text-gray-500">
                Token ID: #{certificate.tokenId}
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`
            inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
            ${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor} border
          `}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusInfo.text}
          </div>
        </div>

        {/* Certificate Details */}
        <div className="space-y-3">
          {certificate.recipientName && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium">Recipient:</span>
              <span className="ml-1">{certificate.recipientName}</span>
            </div>
          )}
          
          {certificate.institutionName && (
            <div className="flex items-center text-sm text-gray-600">
              <Building className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium">Institution:</span>
              <span className="ml-1">{certificate.institutionName}</span>
            </div>
          )}
          
          {certificate.issueDate && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium">Issued:</span>
              <span className="ml-1">{formatDate(certificate.issueDate)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={isVerifying || certificate.isRevoked}
                className="
                  inline-flex items-center px-3 py-1.5 text-sm font-medium
                  text-blue-600 bg-blue-50 border border-blue-200 rounded-md
                  hover:bg-blue-100 hover:border-blue-300
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-200
                "
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1.5"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="w-3 h-3 mr-1.5" />
                    Verify
                  </>
                )}
              </button>

              {/* View Details Button */}
              <button
                onClick={() => window.open(`/certificate/${certificate.tokenId}`, '_blank')}
                className="
                  inline-flex items-center px-3 py-1.5 text-sm font-medium
                  text-gray-600 bg-white border border-gray-200 rounded-md
                  hover:bg-gray-50 hover:border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  transition-colors duration-200
                "
              >
                <ExternalLink className="w-3 h-3 mr-1.5" />
                View Details
              </button>
            </div>

            <div className="flex space-x-1">
              {/* Copy Link Button */}
              <button
                onClick={handleCopyLink}
                className="
                  p-1.5 text-gray-400 hover:text-gray-600 rounded-md
                  hover:bg-gray-100 transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                "
                title="Copy certificate link"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="
                  p-1.5 text-gray-400 hover:text-gray-600 rounded-md
                  hover:bg-gray-100 transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                "
                title="Share certificate"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="
                  p-1.5 text-gray-400 hover:text-gray-600 rounded-md
                  hover:bg-gray-100 transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                "
                title="Download certificate"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoked Certificate Overlay */}
      {certificate.isRevoked && (
        <div className="absolute inset-0 bg-red-500 bg-opacity-10 flex items-center justify-center">
          <div className="bg-red-100 border border-red-300 rounded-lg px-4 py-2">
            <div className="flex items-center text-red-800">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span className="font-medium">Certificate Revoked</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CertificateCard;