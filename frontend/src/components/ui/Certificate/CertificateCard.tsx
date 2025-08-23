import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Shield, 
  Calendar, 
  Building, 
  User, 
  Download, 
  Share2, 
  ExternalLink,
  QrCode,
  Copy,
  Printer
} from 'lucide-react';
import { useFeedbackAnimations } from '../../../hooks/useFeedbackAnimations';
import { VerificationBadge } from '../Badge';
import CertificateMetadata from './CertificateMetadata';

export interface Certificate {
  tokenId: string;
  issuer: string;
  recipient: string;
  recipientName: string;
  courseName: string;
  institutionName: string;
  issueDate: number;
  metadataURI?: string;
  isValid: boolean;
  isRevoked?: boolean;
  qrCodeURL?: string;
  verificationURL?: string;
  institutionLogo?: string;
  certificateType?: string;
  grade?: string;
  credits?: number;
  description?: string;
}

interface CertificateCardProps {
  certificate: Certificate;
  variant?: 'default' | 'premium' | 'compact';
  showQR?: boolean;
  showActions?: boolean;
  isPublicView?: boolean;
  className?: string;
  onDownload?: () => void;
  onShare?: () => void;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  variant = 'default',
  showQR = true,
  showActions = true,
  isPublicView = false,
  className = '',
  onDownload,
  onShare
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { triggerSuccess, triggerError } = useFeedbackAnimations();

  const handleCopyLink = async () => {
    try {
      if (certificate.verificationURL) {
        await navigator.clipboard.writeText(certificate.verificationURL);
        triggerSuccess('Link copied to clipboard');
      }
    } catch (error) {
      triggerError('Failed to copy link');
    }
  };

  const handleDownload = () => {
    setIsLoading(true);
    try {
      onDownload?.();
      triggerSuccess('Certificate downloaded');
    } catch (error) {
      triggerError('Download failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    try {
      onShare?.();
      triggerSuccess('Share options opened');
    } catch (error) {
      triggerError('Share failed');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const cardVariants = {
    default: 'bg-white border border-gray-200 shadow-sm',
    premium: 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-md',
    compact: 'bg-white border border-gray-100 shadow-xs'
  };

  const cardClasses = `
    ${cardVariants[variant]}
    rounded-lg p-6 transition-all duration-200 hover:shadow-lg
    ${className}
  `;

  return (
    <motion.div
      className={cardClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Award className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {certificate.courseName}
            </h3>
            <p className="text-sm text-gray-600">
              {certificate.institutionName}
            </p>
          </div>
        </div>
        <VerificationBadge 
          isValid={certificate.isValid && !certificate.isRevoked}
          size="sm"
        />
      </div>

      {/* Certificate Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span>Recipient: {certificate.recipientName}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Issued: {formatDate(certificate.issueDate)}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Building className="w-4 h-4" />
          <span>Institution: {certificate.institutionName}</span>
        </div>

        {certificate.grade && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>Grade: {certificate.grade}</span>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4"
        >
          <CertificateMetadata certificate={certificate} />
        </motion.div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Link</span>
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>
      )}

      {/* QR Code Section */}
      {showQR && certificate.qrCodeURL && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center">
            <div className="p-2 bg-gray-50 rounded-lg">
              <QrCode className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Scan to verify certificate
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default CertificateCard;