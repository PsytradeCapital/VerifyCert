import React from 'react';

interface Certificate {
  id: string;
  recipientName: string;
  courseName: string;
  issuerName: string;
  issueDate: string;
  verified?: boolean;
}

interface CertificateCardProps {
  certificate: Certificate;
  className?: string;
  onClick?: () => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  className = '',
  onClick
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {certificate.courseName}
        </h3>
        {certificate.verified && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Verified
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Recipient:</span> {certificate.recipientName}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Issuer:</span> {certificate.issuerName}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Issue Date:</span> {certificate.issueDate}
        </p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View Certificate →
        </button>
      </div>
    </div>
  );
};

export default CertificateCard;
