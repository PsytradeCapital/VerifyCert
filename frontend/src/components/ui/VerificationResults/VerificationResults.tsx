import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';

interface VerificationResult {
  id: string;
  certificateId: string;
  recipientName: string;
  courseName: string;
  issuerName: string;
  issueDate: string;
  status: 'valid' | 'invalid' | 'revoked' | 'expired';
  blockchainTxHash?: string;
  verificationDate: string;
}

interface VerificationResultsProps {
  results: VerificationResult[];
  className?: string;
}

const VerificationResults: React.FC<VerificationResultsProps> = ({
  results,
  className = ''
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'invalid':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'revoked':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'expired':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-50 border-green-200';
      case 'invalid':
        return 'bg-red-50 border-red-200';
      case 'revoked':
        return 'bg-red-50 border-red-200';
      case 'expired':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valid':
        return 'Valid Certificate';
      case 'invalid':
        return 'Invalid Certificate';
      case 'revoked':
        return 'Revoked Certificate';
      case 'expired':
        return 'Expired Certificate';
      default:
        return 'Unknown Status';
    }
  };

  if (results.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No verification results found</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Verification Results ({results.length})
      </h3>
      
      {results.map((result) => (
        <div
          key={result.id}
          className={`p-6 rounded-lg border ${getStatusColor(result.status)}`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              {getStatusIcon(result.status)}
              <div className="ml-3">
                <h4 className="text-lg font-medium text-gray-900">
                  {getStatusText(result.status)}
                </h4>
                <p className="text-sm text-gray-500">
                  Verified on {new Date(result.verificationDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {result.blockchainTxHash && (
              <a
                href={`https://amoy.polygonscan.com/tx/${result.blockchainTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View on Blockchain
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Certificate Details</h5>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">ID:</span> {result.certificateId}</p>
                <p><span className="font-medium">Recipient:</span> {result.recipientName}</p>
                <p><span className="font-medium">Course:</span> {result.courseName}</p>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Issuer Information</h5>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Issuer:</span> {result.issuerName}</p>
                <p><span className="font-medium">Issue Date:</span> {new Date(result.issueDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {result.status === 'invalid' && (
            <div className="mt-4 p-3 bg-red-100 rounded-lg">
              <p className="text-red-800 text-sm">
                This certificate could not be verified. It may be fraudulent or the verification data may be incorrect.
              </p>
            </div>
          )}

          {result.status === 'revoked' && (
            <div className="mt-4 p-3 bg-red-100 rounded-lg">
              <p className="text-red-800 text-sm">
                This certificate has been revoked by the issuer and is no longer valid.
              </p>
            </div>
          )}

          {result.status === 'expired' && (
            <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
              <p className="text-yellow-800 text-sm">
                This certificate has expired and may no longer be considered valid.
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default VerificationResults;
export type { VerificationResultsProps };
export { VerificationResults };