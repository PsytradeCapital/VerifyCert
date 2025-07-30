import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  ShareIcon,
  DownloadIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  AcademicCapIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const CertificateCard = ({ 
  certificate, 
  showQR = true, 
  showActions = true, 
  compact = false,
  onShare,
  onDownload,
  onView
}) => {
  const [showFullQR, setShowFullQR] = useState(false);

  if (!certificate) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  const {
    tokenId,
    recipientName,
    courseName,
    institutionName,
    issueDate,
    expiryDate,
    isRevoked,
    isExpired,
    isValid,
    certificateHash,
    issuer
  } = certificate;

  // Format dates
  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === '0') return 'No expiry';
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status info
  const getStatusInfo = () => {
    if (isRevoked) {
      return {
        status: 'revoked',
        icon: XCircleIcon,
        text: 'Revoked',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }
    if (isExpired) {
      return {
        status: 'expired',
        icon: ExclamationTriangleIcon,
        text: 'Expired',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    }
    if (isValid) {
      return {
        status: 'valid',
        icon: CheckCircleIcon,
        text: 'Valid',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    }
    return {
      status: 'unknown',
      icon: ExclamationTriangleIcon,
      text: 'Unknown',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const verificationUrl = `${window.location.origin}/verify/${certificateHash}`;

  if (compact) {
    return (
      <div className={`bg-white rounded-lg border-2 ${statusInfo.borderColor} p-4 hover:shadow-md transition-shadow`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
              <span className={`text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {courseName}
            </h3>
            <p className="text-sm text-gray-600 truncate">{recipientName}</p>
            <p className="text-xs text-gray-500 truncate">{institutionName}</p>
          </div>
          {showQR && (
            <div className="ml-4">
              <QRCodeSVG 
                value={verificationUrl} 
                size={60}
                className="border border-gray-200 rounded"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border-2 ${statusInfo.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}>
      {/* Header with status */}
      <div className={`${statusInfo.bgColor} px-6 py-4 border-b ${statusInfo.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StatusIcon className={`h-6 w-6 ${statusInfo.color}`} />
            <div>
              <h2 className={`text-lg font-semibold ${statusInfo.color}`}>
                Certificate {statusInfo.text}
              </h2>
              <p className="text-sm text-gray-600">
                Token ID: #{tokenId}
              </p>
            </div>
          </div>
          {showQR && (
            <button
              onClick={() => setShowFullQR(!showFullQR)}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              title="Toggle QR Code"
            >
              <QRCodeSVG 
                value={verificationUrl} 
                size={48}
                className="border border-gray-200 rounded"
              />
            </button>
          )}
        </div>
      </div>

      {/* Certificate Details */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Certificate Info */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <AcademicCapIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500">Course</p>
                <p className="text-lg font-semibold text-gray-900">{courseName}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <UserIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500">Recipient</p>
                <p className="text-lg font-semibold text-gray-900">{recipientName}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <BuildingOfficeIcon className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500">Institution</p>
                <p className="text-lg font-semibold text-gray-900">{institutionName}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Dates and QR */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CalendarIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500">Issue Date</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(issueDate)}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CalendarIcon className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(expiryDate)}
                </p>
              </div>
            </div>

            {showQR && showFullQR && (
              <div className="flex justify-center pt-4">
                <div className="text-center">
                  <QRCodeSVG 
                    value={verificationUrl} 
                    size={120}
                    className="border border-gray-200 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-2">Scan to verify</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Issuer Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Issued by</p>
              <p className="text-sm font-mono text-gray-700 break-all">
                {issuer}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">Certificate Hash</p>
              <p className="text-sm font-mono text-gray-700 break-all">
                {certificateHash?.slice(0, 16)}...
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-3">
              {onView && (
                <button
                  onClick={() => onView(certificate)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  View Details
                </button>
              )}
              
              {onShare && (
                <button
                  onClick={() => onShare(verificationUrl)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Share
                </button>
              )}
              
              {onDownload && (
                <button
                  onClick={() => onDownload(certificate)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Download
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateCard;