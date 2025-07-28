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
    return null;
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

  // Get verification status display
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

  // Copy certificate hash to clipboard
  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(certificate.certificateHash);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy hash:', err);
    }
  };

  // Copy verification URL to clipboard
  const copyVerificationUrl = async () => {
    const url = `${window.location.origin}/verify/${certificate.certificateHash}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  // Handle share action
  const handleShare = async () => {
    const url = `${window.location.origin}/verify/${certificate.certificateHash}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate: ${certificate.courseName}`,
          text: `Verify this certificate for ${certificate.recipientName}`,
          url: url
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL
      copyVerificationUrl();
    }
    
    onShare?.(certificate);
  };

  // Handle download action
  const handleDownload = () => {
    // In a real implementation, this would generate a PDF or image
    const certificateData = {
      recipientName: certificate.recipientName,
      courseName: certificate.courseName,
      institutionName: certificate.institutionName,
      issueDate: formatDate(certificate.issueDate),
      verificationUrl: `${window.location.origin}/verify/${certificate.certificateHash}`
    };
    
    const dataStr = JSON.stringify(certificateData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-${certificate.tokenId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    onDownload?.(certificate);
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
        className="overflow-hidden hover:shadow-lg transition-all duration-300"
      >
        {/* Header with verification status */}
        {showVerificationStatus && (
          <div className={`
            px-6 py-4 border-b
            ${verificationStatus.bgColor} ${verificationStatus.borderColor}
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <verificationStatus.icon className={`w-6 h-6 ${verificationStatus.color}`} />
                <div>
                  <h3 className={`font-semibold ${verificationStatus.color}`}>
                    {verificationStatus.label}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {verificationStatus.description}
                  </p>
                </div>
              </div>
              <Badge 
                variant={verificationStatus.status === 'valid' ? 'success' : 
                        verificationStatus.status === 'expired' ? 'warning' : 'error'}
                size="sm"
              >
                {verificationStatus.label}
              </Badge>
            </div>
          </div>
        )}

        {/* Certificate Content */}
        <div className="p-6">
          {/* Main Certificate Info */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-primary-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Certificate of Completion
            </h2>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 text-lg">
                <User className="w-5 h-5 text-neutral-500" />
                <span className="font-semibold text-neutral-900">
                  {certificate.recipientName}
                </span>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-neutral-600">
                <GraduationCap className="w-4 h-4" />
                <span>{certificate.courseName}</span>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-neutral-600">
                <Building className="w-4 h-4" />
                <span>{certificate.institutionName}</span>
              </div>
            </div>
          </div>

          {/* Certificate Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
              <Calendar className="w-5 h-5 text-neutral-500" />
              <div>
                <p className="text-sm font-medium text-neutral-700">Issue Date</p>
                <p className="text-sm text-neutral-600">
                  {formatDate(certificate.issueDate)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
              <Clock className="w-5 h-5 text-neutral-500" />
              <div>
                <p className="text-sm font-medium text-neutral-700">Expiry Date</p>
                <p className="text-sm text-neutral-600">
                  {formatDate(certificate.expiryDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Expandable Details */}
          <div className="border-t pt-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full text-left p-2 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              <span className="font-medium text-neutral-700">
                Certificate Details
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-700">Token ID:</span>
                  <span className="text-sm text-neutral-600">#{certificate.tokenId}</span>
                </div>
                
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-neutral-700">Issuer:</span>
                  <span className="text-sm text-neutral-600 font-mono text-right max-w-48 truncate">
                    {certificate.issuer}
                  </span>
                </div>
                
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-neutral-700">Recipient:</span>
                  <span className="text-sm text-neutral-600 font-mono text-right max-w-48 truncate">
                    {certificate.recipientAddress}
                  </span>
                </div>
                
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-neutral-700">Hash:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-neutral-600 font-mono max-w-32 truncate">
                      {certificate.certificateHash}
                    </span>
                    <Tooltip content={copySuccess ? 'Copied!' : 'Copy hash'}>
                      <button
                        onClick={copyHash}
                        className="p-1 hover:bg-neutral-100 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4 text-neutral-500" />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="px-6 py-4 bg-neutral-50 border-t">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onVerify?.(certificate)}
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
                onClick={handleDownload}
                icon={<Download className="w-4 h-4" />}
              >
                Download
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(`/verify/${certificate.certificateHash}`, '_blank')}
                icon={<ExternalLink className="w-4 h-4" />}
              >
                View Details
              </Button>
            </div>
          </div>
        )}

        {/* Blockchain Verification Footer */}
        <div className="px-6 py-3 bg-gradient-to-r from-primary-50 to-accent-50 border-t">
          <div className="flex items-center justify-center space-x-2 text-sm text-neutral-600">
            <Shield className="w-4 h-4 text-primary-500" />
            <span>Secured by blockchain technology</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CertificateCard;