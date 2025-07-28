import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Calendar, 
  User, 
  Building, 
  GraduationCap,
  ExternalLink,
  Copy,
  Download,
  Share2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Card, Button, Badge, Tooltip } from '../src/components/ui';

/**
 * CertificateCard Component
 * Displays certificate information with verification status and actions
 */
const CertificateCard = ({ 
  certificate, 
  variant = 'default',
  showActions = true,
  showVerificationStatus = true,
  className = '',
  onVerify,
  onShare,
  onDownload
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!certificate) {
    return (
      <Card variant="outlined" padding="lg" className={`text-center ${className}`}>
        <div className="text-neutral-500">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No certificate data available</p>
        </div>
      </Card>
    );
  }

  // Format dates
  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === '0') return 'No expiry';
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get verification status
  const getVerificationStatus = () => {
    if (certificate.isRevoked) {
      return {
        status: 'revoked',
        icon: XCircle,
        color: 'text-error-600',
        bgColor: 'bg-error-50',
        borderColor: 'border-error-200',
        label: 'Revoked',
        description: 'This certificate has been revoked'
      };
    }

    if (certificate.isExpired) {
      return {
        status: 'expired',
        icon: AlertTriangle,
        color: 'text-warning-600',
        bgColor: 'bg-warning-50',
        borderColor: 'border-warning-200',
        label: 'Expired',
        description: 'This certificate has expired'
      };
    }

    if (certificate.isValid) {
      return {
        status: 'valid',
        icon: CheckCircle,
        color: 'text-success-600',
        bgColor: 'bg-success-50',
        borderColor: 'border-success-200',
        label: 'Verified',
        description: 'This certificate is authentic and valid'
      };
    }

    return {
      status: 'invalid',
      icon: XCircle,
      color: 'text-error-600',
      bgColor: 'bg-error-50',
      borderColor: 'border-error-200',
      label: 'Invalid',
      description: 'This certificate is not valid'
    };
  };

  const verificationStatus = getVerificationStatus();

  // Handle copy certificate hash
  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(certificate.certificateHash);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy hash:', err);
    }
  };

  // Handle share certificate
  const handleShare = async () => {
    const shareData = {
      title: `Certificate: ${certificate.courseName}`,
      text: `${certificate.recipientName} has completed ${certificate.courseName} from ${certificate.institutionName}`,
      url: `${window.location.origin}/verify/${certificate.certificateHash}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(shareData.url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }

    if (onShare) {
      onShare(certificate);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card 
        variant={variant} 
        padding="none" 
        className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
      >
        {/* Certificate Header */}
        <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white p-6">
          {/* Verification Status Badge */}
          {showVerificationStatus && (
            <div className="absolute top-4 right-4">
              <Tooltip content={verificationStatus.description}>
                <Badge 
                  variant={verificationStatus.status === 'valid' ? 'success' : 
                           verificationStatus.status === 'expired' ? 'warning' : 'error'}
                  className="flex items-center gap-1"
                >
                  <verificationStatus.icon className="w-3 h-3" />
                  {verificationStatus.label}
                </Badge>
              </Tooltip>
            </div>
          )}

          {/* Certificate Icon */}
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Digital Certificate</h3>
              <p className="text-primary-100 text-sm">
                Token ID: #{certificate.tokenId}
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        {/* Certificate Content */}
        <div className="p-6">
          {/* Recipient Information */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <User className="w-5 h-5 text-neutral-500 mr-2" />
              <span className="text-sm font-medium text-neutral-600">Recipient</span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-1">
              {certificate.recipientName}
            </h2>
            <p className="text-neutral-600 text-sm font-mono">
              {certificate.recipientAddress}
            </p>
          </div>

          {/* Course Information */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <GraduationCap className="w-5 h-5 text-neutral-500 mr-2" />
              <span className="text-sm font-medium text-neutral-600">Course</span>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-1">
              {certificate.courseName}
            </h3>
          </div>

          {/* Institution Information */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Building className="w-5 h-5 text-neutral-500 mr-2" />
              <span className="text-sm font-medium text-neutral-600">Institution</span>
            </div>
            <p className="text-lg font-medium text-neutral-800">
              {certificate.institutionName}
            </p>
          </div>

          {/* Date Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <div className="flex items-center mb-2">
                <Calendar className="w-4 h-4 text-neutral-500 mr-2" />
                <span className="text-sm font-medium text-neutral-600">Issue Date</span>
              </div>
              <p className="text-neutral-800">
                {formatDate(certificate.issueDate)}
              </p>
            </div>
            
            <div>
              <div className="flex items-center mb-2">
                <Clock className="w-4 h-4 text-neutral-500 mr-2" />
                <span className="text-sm font-medium text-neutral-600">Expiry Date</span>
              </div>
              <p className="text-neutral-800">
                {formatDate(certificate.expiryDate)}
              </p>
            </div>
          </div>

          {/* Expandable Details */}
          <div className="border-t border-neutral-200 pt-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full text-left text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
            >
              <span>Certificate Details</span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            </button>

            <motion.div
              initial={false}
              animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-3">
                <div>
                  <span className="text-sm font-medium text-neutral-600">Issuer Address:</span>
                  <p className="text-sm font-mono text-neutral-800 break-all">
                    {certificate.issuer}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-neutral-600">Certificate Hash:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-mono text-neutral-800 break-all flex-1">
                      {certificate.certificateHash}
                    </p>
                    <Tooltip content={copySuccess ? 'Copied!' : 'Copy hash'}>
                      <button
                        onClick={handleCopyHash}
                        className="p-1 text-neutral-500 hover:text-neutral-700 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </Tooltip>
                  </div>
                </div>

                {/* Blockchain Information */}
                <div className="bg-neutral-50 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <Shield className="w-4 h-4 text-primary-600 mr-2" />
                    <span className="text-sm font-medium text-neutral-700">Blockchain Verification</span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    This certificate is secured on the Polygon blockchain and cannot be tampered with or forged.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-neutral-200">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onVerify && onVerify(certificate)}
                icon={<Shield className="w-4 h-4" />}
              >
                Verify
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={handleShare}
                icon={<Share2 className="w-4 h-4" />}
              >
                Share
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onDownload && onDownload(certificate)}
                icon={<Download className="w-4 h-4" />}
              >
                Download
              </Button>
              
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => window.open(`/verify/${certificate.certificateHash}`, '_blank')}
                icon={<ExternalLink className="w-4 h-4" />}
              >
                View Details
              </Button>
            </div>
          )}
        </div>

        {/* Certificate Footer */}
        <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Powered by VerifyCert</span>
            <span>Secured on Polygon</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CertificateCard;