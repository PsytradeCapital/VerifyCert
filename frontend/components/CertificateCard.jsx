import React from 'react';
import { motion } from 'framer-motion';
import { Award, Calendar, Building, User, Shield, Download, Share2, ExternalLink } from 'lucide-react';
import { certificateCard, buttonHover } from '../src/utils/animations';
import { Card, Button, Badge } from '../src/components/ui';

/**
 * CertificateCard Component
 * Displays certificate information with modern design and animations
 */
const CertificateCard = ({ 
  certificate, 
  onVerify, 
  onDownload, 
  onShare,
  showActions = true,
  variant = 'default' // 'default', 'compact', 'detailed'
}) => {
  const {
    tokenId,
    recipientName,
    courseName,
    institutionName,
    issueDate,
    issuer,
    isRevoked,
    isValid,
    verificationUrl
  } = certificate;

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = () => {
    if (isRevoked) return 'text-red-600 bg-red-50';
    if (isValid) return 'text-green-600 bg-green-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const getStatusText = () => {
    if (isRevoked) return 'Revoked';
    if (isValid) return 'Valid';
    return 'Pending';
  };

  return (
    <Card
      variant="elevated"
      padding={variant === 'compact' ? 'sm' : 'md'}
      hover={true}
      className={`
        ${variant === 'detailed' ? 'max-w-2xl' : 'max-w-md'}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Award className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {courseName}
            </h3>
            <p className="text-sm text-gray-500">Certificate #{tokenId}</p>
          </div>
        </div>
        
        {/* Status Badge */}
        <Badge 
          variant={isRevoked ? 'error' : isValid ? 'success' : 'warning'}
          size="sm"
        >
          {getStatusText()}
        </Badge>
      </div>

      {/* Certificate Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-3">
          <User className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Recipient</p>
            <p className="font-medium text-gray-900">{recipientName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Building className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Institution</p>
            <p className="font-medium text-gray-900">{institutionName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Issue Date</p>
            <p className="font-medium text-gray-900">{formatDate(issueDate)}</p>
          </div>
        </div>

        {variant === 'detailed' && (
          <div className="flex items-center space-x-3">
            <Shield className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Issuer</p>
              <p className="font-mono text-sm text-gray-700">
                {issuer.slice(0, 6)}...{issuer.slice(-4)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Verification Status */}
      {isValid && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg mb-4">
          <Shield className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-700 font-medium">
            Blockchain Verified
          </span>
        </div>
      )}

      {isRevoked && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg mb-4">
          <Shield className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-700 font-medium">
            Certificate Revoked
          </span>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex space-x-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => onVerify(tokenId)}
            icon={<ExternalLink className="w-4 h-4" />}
            className="flex-1"
          >
            Verify
          </Button>

          {onDownload && (
            <Button
              variant="secondary"
              size="md"
              onClick={() => onDownload(certificate)}
              icon={<Download className="w-4 h-4" />}
            />
          )}

          {onShare && (
            <Button
              variant="secondary"
              size="md"
              onClick={() => onShare(certificate)}
              icon={<Share2 className="w-4 h-4" />}
            />
          )}
        </div>
      )}

      {/* QR Code Link (for compact view) */}
      {variant === 'compact' && verificationUrl && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <a
            href={verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <ExternalLink className="w-3 h-3" />
            <span>View Certificate</span>
          </a>
        </div>
      )}
    </Card>
  );
};

export default CertificateCard;