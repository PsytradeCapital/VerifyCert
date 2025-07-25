import React from 'react';
import { Calendar, User, GraduationCap, Building, Shield, AlertTriangle, ExternalLink } from 'lucide-react';

const CertificateCard = ({ 
  certificate, 
  tokenId, 
  onVerify, 
  onRevoke, 
  showActions = false, 
  canRevoke = false,
  showBlockchainInfo = false 
}) => {
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleVerify = () => {
    if (onVerify) {
      onVerify(tokenId);
    }
  };

  const handleRevoke = () => {
    if (onRevoke && window.confirm('Are you sure you want to revoke this certificate?')) {
      onRevoke(tokenId);
    }
  };

  const getStatusBadge = () => {
    if (certificate.isRevoked) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Revoked
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <Shield className="w-3 h-3 mr-1" />
        Valid
      </span>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 ${
      certificate.isRevoked ? 'border-red-500' : 'border-green-500'
    } p-6 hover:shadow-lg transition-shadow duration-200`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {certificate.courseName}
          </h3>
          {getStatusBadge()}
        </div>
        <div className="text-sm text-gray-500">
          #{tokenId}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-gray-700">
          <User className="w-4 h-4 mr-2 text-gray-500" />
          <span className="font-medium">Recipient:</span>
          <span className="ml-2">{certificate.recipientName}</span>
        </div>

        <div className="flex items-center text-gray-700">
          <Building className="w-4 h-4 mr-2 text-gray-500" />
          <span className="font-medium">Institution:</span>
          <span className="ml-2">{certificate.institutionName}</span>
        </div>

        <div className="flex items-center text-gray-700">
          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
          <span className="font-medium">Issued:</span>
          <span className="ml-2">{formatDate(certificate.issueDate)}</span>
        </div>

        <div className="flex items-center text-gray-700">
          <GraduationCap className="w-4 h-4 mr-2 text-gray-500" />
          <span className="font-medium">Issuer:</span>
          <span className="ml-2 font-mono text-sm">
            {certificate.issuer.slice(0, 6)}...{certificate.issuer.slice(-4)}
          </span>
        </div>
      </div>

      {showActions && (
        <div className="mt-6 flex space-x-3">
          <button
            onClick={handleVerify}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
          >
            Verify Certificate
          </button>
          
          {canRevoke && !certificate.isRevoked && (
            <button
              onClick={handleRevoke}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
            >
              Revoke
            </button>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Certificate ID: {tokenId}</span>
          <span className="font-mono">
            Blockchain Verified
          </span>
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;