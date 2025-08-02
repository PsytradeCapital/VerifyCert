import React from 'react';
import { Shield, Calendar, User, Building, ExternalLink, Download, Share2, AlertTriangle, CheckCircle } from 'lucide-react';

export interface Certificate {
  tokenId: string;
  recipientName: string;
  courseName: string;
  institutionName: string;
  issueDate: number;
  issuer: string;
  recipient?: string;
  isRevoked?: boolean;
  isValid?: boolean;
  blockchainProof?: {
    transactionHash?: string;
    blockNumber?: number;
    network?: string;
    contractAddress?: string;
  };
  qrCodeURL?: string;
  verificationURL?: string;
  metadata?: any;
}

interface CertificateCardProps {
  certificate: Certificate;
  showActions?: boolean;
  compact?: boolean;
  showQR?: boolean;
  isPublicView?: boolean;
  onVerify?: (certificate: Certificate) => void;
  onDownload?: (certificate: Certificate) => void;
  onShare?: (certificate: Certificate) => void;
  onRevoke?: (certificate: Certificate) => void;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ 
  certificate, 
  showActions = true, 
  compact = false,
  showQR = false,
  isPublicView = false,
  onVerify,
  onDownload,
  onShare,
  onRevoke
}) => {
  const {
    tokenId,
    recipientName,
    courseName,
    institutionName,
    issueDate,
    isRevoked,
    isValid,
    blockchainProof,
    qrCodeURL,
    verificationURL
  } = certificate;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = () => {
    if (isRevoked) return 'text-red-600 bg-red-50 border-red-200';
    if (isValid) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  const getStatusText = () => {
    if (isRevoked) return 'Revoked';
    if (isValid) return 'Valid';
    return 'Pending';
  };

  const getStatusIcon = () => {
    if (isRevoked) return <AlertTriangle className="w-4 h-4" />;
    if (isValid) return <CheckCircle className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  const handleShare = () => {
    if (navigator.share && verificationURL) {
      navigator.share({
        title: `${courseName} Certificate`,
        text: `Certificate for ${recipientName} from ${institutionName}`,
        url: verificationURL
      }).catch(console.error);
    } else if (onShare) {
      onShare(certificate);
    } else {
      // Fallback to copying URL
      const url = verificationURL || `${window.location.origin}/certificate/${tokenId}`;
      navigator.clipboard.writeText(url).then(() => {
        alert('Certificate link copied to clipboard!');
      }).catch(() => {
        alert(`Share this link: ${url}`);
      });
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {courseName}
            </h3>
            <p className="text-sm text-gray-500 truncate">{institutionName}</p>
            <p className="text-xs text-gray-400 mt-1">
              Issued {formatDate(issueDate)}
            </p>
          </div>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="ml-1">{getStatusText()}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Certificate Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg p-2">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Digital Certificate
              </h2>
              <p className="text-blue-100 text-sm">
                Certificate #{tokenId}
              </p>
            </div>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 ${
            isRevoked 
              ? 'text-red-100 bg-red-500/20 border-red-300' 
              : isValid 
                ? 'text-green-100 bg-green-500/20 border-green-300'
                : 'text-yellow-100 bg-yellow-500/20 border-yellow-300'
          }`}>
            {getStatusIcon()}
            <span className="ml-1">{getStatusText()}</span>
          </div>
        </div>
      </div>

      {/* Certificate Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recipient Information */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Recipient</p>
                <p className="text-lg font-semibold text-gray-900">
                  {recipientName}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Building className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Institution</p>
                <p className="text-base font-medium text-gray-900">
                  {institutionName}
                </p>
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Course/Program</p>
              <p className="text-lg font-semibold text-gray-900">
                {courseName}
              </p>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Issue Date</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(issueDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revocation Notice */}
        {isRevoked && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Certificate Revoked</h4>
                <p className="text-sm text-red-700 mt-1">
                  This certificate has been revoked by the issuing institution and is no longer valid.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Blockchain Verification */}
        {blockchainProof && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">
                Blockchain Verified
              </span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              {blockchainProof.transactionHash && (
                <p>Transaction: {blockchainProof.transactionHash.slice(0, 20)}...</p>
              )}
              {blockchainProof.blockNumber && (
                <p>Block: #{blockchainProof.blockNumber}</p>
              )}
              {blockchainProof.network && (
                <p>Network: {blockchainProof.network}</p>
              )}
              {blockchainProof.contractAddress && (
                <p>Contract: {blockchainProof.contractAddress.slice(0, 20)}...</p>
              )}
            </div>
          </div>
        )}

        {/* QR Code Section */}
        {showQR && qrCodeURL && (
          <div className="mt-6 flex justify-center">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <img 
                src={qrCodeURL} 
                alt="Certificate QR Code" 
                className="w-32 h-32 mx-auto"
              />
              <p className="text-xs text-gray-500 text-center mt-2">
                Scan to verify
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="mt-6 flex flex-wrap gap-3">
            {isPublicView ? (
              <>
                <button
                  onClick={() => onVerify?.(certificate)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Verify Again
                </button>
                
                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
                
                <button
                  onClick={() => onDownload?.(certificate)}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onVerify?.(certificate)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Verify
                </button>
                
                <button
                  onClick={() => onDownload?.(certificate)}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                
                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
                
                <button
                  onClick={() => window.open(`/certificate/${tokenId}`, '_blank')}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Details
                </button>

                {!isRevoked && onRevoke && (
                  <button
                    onClick={() => onRevoke(certificate)}
                    className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Revoke
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateCard;