import React, { useState } from 'react';
import { Download, Share2, ExternalLink } from 'lucide-react';

interface CertificateData {
  tokenId: string;
  issuer: string;
  recipient: string;
  recipientName: string;
  courseName: string;
  institutionName: string;
  issueDate: number;
  isValid: boolean;
  verificationURL?: string;
}

export interface CertificateActionsProps {
  certificate: CertificateData;
  className?: string;
  showLabels?: boolean;
  variant?: 'horizontal' | 'vertical' | 'grid';
  size?: 'sm' | 'md' | 'lg';
}

const CertificateActions: React.FC<CertificateActionsProps> = ({
  certificate,
  className = '',
  showLabels = true,
  variant = 'horizontal',
  size = 'md'
}) => {
  // Use variant and size for future styling
  const _ = { variant, size };
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsLoading('download');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Download certificate:', certificate.tokenId);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleShare = async () => {
    setIsLoading('share');
    try {
      const shareUrl = certificate.verificationURL || window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      console.log('Copied to clipboard');
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className={`certificate-actions ${className}`}>
      <div className="flex space-x-2">
        <button
          onClick={handleDownload}
          disabled={isLoading === 'download'}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {showLabels && <span>Download</span>}
        </button>
        
        <button
          onClick={handleShare}
          disabled={isLoading === 'share'}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          <Share2 className="w-4 h-4" />
          {showLabels && <span>Share</span>}
        </button>
        
        {certificate.verificationURL && (
          <button
            onClick={() => window.open(certificate.verificationURL, '_blank')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <ExternalLink className="w-4 h-4" />
            {showLabels && <span>Verify</span>}
          </button>
        )}
      </div>
    </div>
  );
};

export default CertificateActions;
export type { CertificateActionsProps };
export { CertificateActions };