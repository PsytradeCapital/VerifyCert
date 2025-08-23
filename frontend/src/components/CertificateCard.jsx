import React, { useState } from 'react';
import { 
  Calendar, 
  User, 
  GraduationCap, 
  Building, 
  Shield, 
  AlertTriangle, 
  ExternalLink,
  Download,
  Share2,
  Copy,
  QrCode,
  Award
} from 'lucide-react';

const CertificateCard = ({ 
  certificate, 
  tokenId, 
  showActions = false, 
  onRevoke,
  onDownload,
  onShare,
  variant = 'default',
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleRevoke = () => {
    if (window.confirm('Are you sure you want to revoke this certificate? This action cannot be undone.')) {
      onRevoke?.(tokenId);
    }
  };

  const handleCopyLink = async () => {
    try {
      const verificationUrl = `${window.location.origin}/verify/${tokenId}`;
      await navigator.clipboard.writeText(verificationUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleDownload = () => {
    onDownload?.(certificate, tokenId);
  };

  const handleShare = async () => {
    const shareData = {
      title: `Certificate: ${certificate.courseName}`,
      text: `${certificate.recipientName} has completed ${certificate.courseName} from ${certificate.institutionName}`,
      url: `${window.location.origin}/verify/${tokenId}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await handleCopyLink();
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const contractAddress = '0x6c9D554C721dA0CEA1b975982eAEe1f924271F50';

  const getCardStyles = () => {
    const baseStyles = "rounded-lg shadow-md border-2 p-6 transition-all duration-200 hover:shadow-lg";
    
    if (certificate.isRevoked) {
      return `${baseStyles} border-red-300 bg-red-50`;
    }
    
    switch (variant) {
      case 'premium':
        return `${baseStyles} bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200`;
      case 'compact':
        return `${baseStyles} bg-white border-gray-200 p-4`;
      default:
        return `${baseStyles} bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200`;
    }
  };

  const getStatusBadge = () => {
    if (certificate.isRevoked) {
      return (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">Revoked</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-1 text-green-600">
        <Shield className="h-4 w-4" />
        <span className="text-sm font-medium">Valid</span>
      </div>
    );
  };

  return (
    <div className={`${getCardStyles()} ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Award className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Certificate #{tokenId}
            </h3>
            <p className="text-sm text-gray-600">
              {certificate.certificateType || 'Digital Certificate'}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Certificate Details */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <User className="h-4 w-4 text-gray-500" />
          <div>
            <span className="text-sm text-gray-500">Recipient:</span>
            <p className="font-medium text-gray-900">{certificate.recipientName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <GraduationCap className="h-4 w-4 text-gray-500" />
          <div>
            <span className="text-sm text-gray-500">Course:</span>
            <p className="font-medium text-gray-900">{certificate.courseName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Building className="h-4 w-4 text-gray-500" />
          <div>
            <span className="text-sm text-gray-500">Institution:</span>
            <p className="font-medium text-gray-900">{certificate.institutionName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Calendar className="h-4 w-4 text-gray-500" />
          <div>
            <span className="text-sm text-gray-500">Issue Date:</span>
            <p className="font-medium text-gray-900">{formatDate(certificate.issueDate)}</p>
          </div>
        </div>

        {/* Additional Details (if available) */}
        {certificate.grade && (
          <div className="flex items-center space-x-3">
            <Shield className="h-4 w-4 text-gray-500" />
            <div>
              <span className="text-sm text-gray-500">Grade:</span>
              <p className="font-medium text-gray-900">{certificate.grade}</p>
            </div>
          </div>
        )}

        {certificate.credits && certificate.credits > 0 && (
          <div className="flex items-center space-x-3">
            <Award className="h-4 w-4 text-gray-500" />
            <div>
              <span className="text-sm text-gray-500">Credits:</span>
              <p className="font-medium text-gray-900">{certificate.credits}</p>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-2">
            <div className="text-xs text-gray-500">
              <span>Issued by: </span>
              <span className="font-mono break-all">{formatAddress(certificate.issuer)}</span>
            </div>
            {certificate.owner && (
              <div className="text-xs text-gray-500">
                <span>Owner: </span>
                <span className="font-mono break-all">{formatAddress(certificate.owner)}</span>
              </div>
            )}
            <div className="text-xs text-gray-500">
              <span>Token ID: </span>
              <span className="font-mono">{tokenId}</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={handleDownload}
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
              <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
            </button>
          </div>

          {/* Revoke Action (if authorized) */}
          {!certificate.isRevoked && onRevoke && (
            <button
              onClick={handleRevoke}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
            >
              Revoke Certificate
            </button>
          )}
        </div>
      )}

      {/* Links */}
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
        <a
          href={`/verify/${tokenId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <Shield className="h-4 w-4" />
          <span>Verify Certificate</span>
        </a>
        
        <div className="mt-2">
          <a
            href={`https://amoy.polygonscan.com/token/${contractAddress}?a=${tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 text-xs"
          >
            <ExternalLink className="h-3 w-3" />
            <span>View on Blockchain Explorer</span>
          </a>
        </div>
      </div>

      {/* QR Code Section (if available) */}
      {certificate.qrCodeURL && (
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
    </div>
  );
};

export default CertificateCard;