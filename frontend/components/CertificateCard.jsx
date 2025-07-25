import React from 'react';
import { Calendar, User, GraduationCap, Building, CheckCircle, XCircle, Download, Share2 } from 'lucide-react';

const CertificateCard = ({ 
  certificate, 
  showActions = true, 
  className = "",
  onDownload,
  onShare 
}) => {
  if (!certificate) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${className}`}>
        <div className="text-center text-gray-500">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p>Certificate not found</p>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(certificate);
    } else {
      // Default download behavior - open in new tab
      window.open(`/api/v1/certificates/${certificate.tokenId}/download`, '_blank');
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(certificate);
    } else {
      // Default share behavior - copy verification URL
      navigator.clipboard.writeText(certificate.verificationURL);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border-2 ${
      certificate.isValid ? 'border-green-200' : 'border-red-200'
    } ${className}`}>
      {/* Header with validity status */}
      <div className={`px-6 py-4 rounded-t-lg ${
        certificate.isValid ? 'bg-green-50' : 'bg-red-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {certificate.isValid ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <span className={`font-semibold ${
              certificate.isValid ? 'text-green-800' : 'text-red-800'
            }`}>
              {certificate.isValid ? 'Valid Certificate' : 'Invalid Certificate'}
            </span>
          </div>
          <span className="text-sm text-gray-600">
            ID: {certificate.tokenId}
          </span>
        </div>
      </div>

      {/* Certificate Content */}
      <div className="p-6">
        {/* Institution Name */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {certificate.institutionName}
          </h2>
          <p className="text-lg text-gray-600">Certificate of Completion</p>
        </div>

        {/* Certificate Details */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Recipient</p>
              <p className="font-semibold text-gray-900">{certificate.recipientName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Course</p>
              <p className="font-semibold text-gray-900">{certificate.courseName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Issue Date</p>
              <p className="font-semibold text-gray-900">
                {formatDate(certificate.issueDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Building className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Issuer Address</p>
              <p className="font-mono text-sm text-gray-700 break-all">
                {certificate.issuer}
              </p>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        {certificate.qrCodeURL && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Verification QR Code</p>
            <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg">
              <img 
                src={certificate.qrCodeURL} 
                alt="Certificate QR Code"
                className="w-32 h-32 mx-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Verification URL */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Verification URL</p>
          <p className="text-sm font-mono text-blue-600 break-all">
            {certificate.verificationURL}
          </p>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="mt-6 flex space-x-3">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer with blockchain info */}
      <div className="px-6 py-3 bg-gray-50 rounded-b-lg border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Verified on Polygon Mumbai • Blockchain Certificate • Non-transferable NFT
        </p>
      </div>
    </div>
  );
};

export default CertificateCard;