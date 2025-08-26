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
  Award,
  Eye,
  MoreHorizontal
} from 'lucide-react';

const CertificateCard = ({ 
  certificate, 
  tokenId, 
  showActions = false, 
  onRevoke,
  onDownload,
  onView,
  variant = 'default',
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp * 1000) 
      : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
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
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = `${window.location.origin}/verify/${tokenId}`;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleDownload = () => {
    onDownload?.(certificate, tokenId);
  };

  const handleView = () => {
    onView?.(tokenId);
  };

  const handleShare = async () => {
    const shareData = {
      title: `Certificate: ${certificate.courseName}`,
      text: `${certificate.recipientName} has completed ${certificate.courseName} from ${certificate.institutionName}`,
      url: `${window.location.origin}/verify/${tokenId}`
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await handleCopyLink();
      }
    } catch (error) {
      console.error('Share failed:', error);
      await handleCopyLink();
    }
  };

  const contractAddress = '0x6c9D554C721dA0CEA1b975982eAEe1f924271F50';

  const getCardStyles = () => {
    const baseStyles = "rounded-lg shadow-md border-2 p-6 transition-all duration-200 hover:shadow-lg relative";
    
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
        <div className="flex items-center space-x-1 text-red-600 bg-red-100 px-2 py-1 rounded-full">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">Revoked</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-1 text-green-600 bg-green-100 px-2 py-1 rounded-full">
        <Shield className="h-4 w-4" />
        <span className="text-sm font-medium">Valid</span>
      </div>
    );
  };

  return (
    <div className={`${getCardStyles()} ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
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
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          {showActions && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                  <button
                    onClick={() => { handleView(); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => { handleDownload(); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => { handleShare(); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                  {!certificate.isRevoked && onRevoke && (
                    <button
                      onClick={() => { handleRevoke(); setShowMenu(false); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center space-x-2 border-t border-gray-100"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <span>Revoke</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Certificate Details */}
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <User className="h-4 w-4 text-gray-500 mt-0.5" />
          <div className="flex-1">
            <span className="text-sm text-gray-500">Recipient:</span>
            <p className="font-medium text-gray-900 break-words">{certificate.recipientName}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <GraduationCap className="h-4 w-4 text-gray-500 mt-0.5" />
          <div className="flex-1">
            <span className="text-sm text-gray-500">Course:</span>
            <p className="font-medium text-gray-900 break-words">{certificate.courseName}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Building className="h-4 w-4 text-gray-500 mt-0.5" />
          <div className="flex-1">
            <span className="text-sm text-gray-500">Institution:</span>
            <p className="font-medium text-gray-900 break-words">{certificate.institutionName}</p>
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
            <div className="text-xs text-gray-500">
              <span>Contract: </span>
              <span className="font-mono break-all">{formatAddress(contractAddress)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {showActions && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
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
        </div>
      )}

      {/* Verification Links */}
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

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default CertificateCard;