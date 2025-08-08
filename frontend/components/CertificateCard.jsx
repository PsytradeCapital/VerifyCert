import React from 'react';
import { Calendar, User, GraduationCap, Building, Shield, AlertTriangle } from 'lucide-react';

const CertificateCard = ({ certificate, tokenId, showActions = false, onRevoke }) => {
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleRevoke = () => {
    if (window.confirm('Are you sure you want to revoke this certificate? This action cannot be undone.')) {
      onRevoke(tokenId);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border-2 p-6 transition-all duration-200 hover:shadow-lg ${
      certificate.isRevoked ? 'border-red-300 bg-red-50' : 'border-blue-300'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Certificate #{tokenId}</h3>
        </div>
        <div className="flex items-center space-x-2">
          {certificate.isRevoked ? (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Revoked</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-green-600">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Valid</span>
            </div>
          )}
        </div>
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
      </div>

      {/* Issuer Information */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <span>Issued by: </span>
          <span className="font-mono">{certificate.issuer}</span>
        </div>
      </div>

      {/* Actions */}
      {showActions && !certificate.isRevoked && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleRevoke}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
          >
            Revoke Certificate
          </button>
        </div>
      )}

      {/* Verification Link */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <a
          href={`/verify/${tokenId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <Shield className="h-4 w-4" />
          <span>Verify Certificate</span>
        </a>
      </div>
    </div>
  );
};

export default CertificateCard;