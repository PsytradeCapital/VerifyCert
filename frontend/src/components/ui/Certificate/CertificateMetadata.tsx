import React, { useState } from 'react';
import {
  Award,
  Shield,
  Copy,
  ExternalLink
} from 'lucide-react';

export interface CertificateMetadata {
  tokenId: string;
  issuer: string;
  recipient: string;
  recipientName: string;
  courseName: string;
  institutionName: string;
  issueDate: number;
  certificateType?: string;
  grade?: string;
  credits?: number;
  duration?: string;
  description?: string;
  instructorName?: string;
  location?: string;
  completionDate?: number;
  expiryDate?: number;
  blockNumber?: number;
  transactionHash?: string;
  networkName?: string;
  skills?: string[];
  prerequisites?: string[];
  isValid?: boolean;
  isRevoked?: boolean;
}

interface CertificateMetadataProps {
  certificate: CertificateMetadata;
  showBlockchainInfo?: boolean;
  className?: string;
}

const CertificateMetadata: React.FC<CertificateMetadataProps> = ({
  certificate,
  showBlockchainInfo = true,
  className = ''
}) => {
  const [expandedSections] = useState<Set<string>>(new Set());

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const InfoRow = ({ 
    label, 
    value, 
    copyable = false, 
    link = false 
  }: {
    label: string;
    value: string | number;
    copyable?: boolean;
    link?: boolean;
  }) => (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}:</span>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-900">
          {link ? (
            <a 
              href={`https://polygonscan.com/tx/${value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>{String(value).slice(0, 10)}...</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            String(value)
          )}
        </span>
        {copyable && (
          <button
            onClick={() => copyToClipboard(String(value))}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <Award className="w-5 h-5 text-gray-600 mr-2" />
          Certificate Details
        </h4>
        <div className="space-y-3">
          <InfoRow label="Course Name" value={certificate.courseName} />
          <InfoRow label="Institution" value={certificate.institutionName} />
          <InfoRow label="Recipient" value={certificate.recipientName} />
          <InfoRow label="Issue Date" value={formatDate(certificate.issueDate)} />
          
          {certificate.grade && (
            <InfoRow label="Grade" value={certificate.grade} />
          )}
          
          {certificate.credits && (
            <InfoRow label="Credits" value={certificate.credits} />
          )}
        </div>
      </div>

      {showBlockchainInfo && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Shield className="w-5 h-5 text-gray-600 mr-2" />
            Blockchain Information
          </h4>
          <div className="space-y-3">
            <InfoRow label="Token ID" value={certificate.tokenId} copyable />
            <InfoRow label="Issuer Address" value={certificate.issuer} copyable />
            <InfoRow label="Recipient Address" value={certificate.recipient} copyable />
            
            {certificate.transactionHash && (
              <InfoRow 
                label="Transaction Hash" 
                value={certificate.transactionHash} 
                copyable 
                link 
              />
            )}
            
            {certificate.blockNumber && (
              <InfoRow label="Block Number" value={certificate.blockNumber} />
            )}
            
            {certificate.networkName && (
              <InfoRow label="Network" value={certificate.networkName} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateMetadata;
export type { CertificateMetadataProps, CertificateMetadata as CertificateMetadataType };
export { CertificateMetadata };