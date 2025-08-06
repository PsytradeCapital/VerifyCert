import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2, ExternalLink, CheckCircle, XCircle, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const CertificateCard = ({ 
  certificate, 
  showActions = true, 
  compact = false,
  onDownload,
  onShare 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!certificate) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDownload = async () => {
    if (onDownload) {
      onDownload(certificate);
      return;
    }

    setIsLoading(true);
    try {
      // Create a downloadable certificate
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 800;
      canvas.height = 600;

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Title
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Certificate of Completion', canvas.width / 2, 100);

      // Institution
      ctx.fillStyle = '#374151';
      ctx.font = '20px Arial';
      ctx.fillText(`Issued by: ${certificate.institutionName}`, canvas.width / 2, 150);

      // Recipient
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 28px Arial';
      ctx.fillText(`${certificate.recipientName}`, canvas.width / 2, 220);

      // Course
      ctx.fillStyle = '#374151';
      ctx.font = '24px Arial';
      ctx.fillText(`has successfully completed`, canvas.width / 2, 270);
      ctx.font = 'bold 26px Arial';
      ctx.fillText(`${certificate.courseName}`, canvas.width / 2, 320);

      // Date
      ctx.font = '18px Arial';
      ctx.fillText(`Date: ${formatDate(certificate.issueDate)}`, canvas.width / 2, 380);

      // Token ID
      ctx.font = '14px Arial';
      ctx.fillText(`Certificate ID: ${certificate.tokenId}`, canvas.width / 2, 420);

      // Verification info
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Arial';
      ctx.fillText('This certificate is verified on the blockchain', canvas.width / 2, 460);
      ctx.fillText(`Issuer: ${formatAddress(certificate.issuer)}`, canvas.width / 2, 480);

      // Download
      const link = document.createElement('a');
      link.download = `certificate-${certificate.tokenId}.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download certificate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (onShare) {
      onShare(certificate);
      return;
    }

    const shareData = {
      title: `Certificate: ${certificate.courseName}`,
      text: `${certificate.recipientName} has completed ${certificate.courseName} from ${certificate.institutionName}`,
      url: `${window.location.origin}/verify/${certificate.tokenId}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Certificate shared successfully!');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Certificate link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to share certificate');
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/verify/${certificate.tokenId}`;
      await navigator.clipboard.writeText(url);
      toast.success('Verification link copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy link');
    }
  };

  const verificationUrl = `${window.location.origin}/verify/${certificate.tokenId}`;

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {certificate.courseName}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {certificate.recipientName}
            </p>
            <p className="text-xs text-gray-500">
              {certificate.institutionName} • {formatDate(certificate.issueDate)}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            {certificate.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Certificate of Completion</h2>
            <p className="text-blue-100">Verified on Blockchain</p>
          </div>
          {certificate.isValid ? (
            <div className="flex items-center space-x-2 bg-green-500 px-3 py-1 rounded-full">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Verified</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 bg-red-500 px-3 py-1 rounded-full">
              <XCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Invalid</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Certificate Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Details</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Recipient</label>
                  <p className="text-lg font-semibold text-gray-900">{certificate.recipientName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Course/Achievement</label>
                  <p className="text-lg font-semibold text-gray-900">{certificate.courseName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Institution</label>
                  <p className="text-base text-gray-900">{certificate.institutionName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Issue Date</label>
                  <p className="text-base text-gray-900">{formatDate(certificate.issueDate)}</p>
                </div>
              </div>
            </div>

            {/* Blockchain Info */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Blockchain Information</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-400">Certificate ID</label>
                  <p className="text-sm font-mono text-gray-700">{certificate.tokenId}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400">Issuer Address</label>
                  <p className="text-sm font-mono text-gray-700">{formatAddress(certificate.issuer)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400">Recipient Address</label>
                  <p className="text-sm font-mono text-gray-700">{formatAddress(certificate.recipient)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code and Actions */}
          <div className="space-y-4">
            {/* QR Code */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Verification QR Code</h4>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                {certificate.qrCodeURL ? (
                  <img
                    src={certificate.qrCodeURL}
                    alt="QR Code for certificate verification"
                    className="mx-auto w-32 h-32"
                  />
                ) : (
                  <QRCodeSVG
                    value={verificationUrl}
                    size={128}
                    className="mx-auto"
                    includeMargin={true}
                  />
                )}
                <p className="text-xs text-gray-500 mt-2">Scan to verify</p>
              </div>
            </div>

            {/* Action Buttons */}
            {showActions && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-500">Actions</h4>
                
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={handleDownload}
                    disabled={isLoading}
                    className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy Link</span>
                  </button>

                  <a
                    href={certificate.explorerUrl || `https://amoy.polygonscan.com/token/${certificate.contractAddress || 'unknown'}?a=${certificate.tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View on Blockchain</span>
                  </a>
                </div>
              </div>
            )}

            {/* Verification Link */}
            <div className="pt-3 border-t border-gray-200">
              <label className="block text-xs font-medium text-gray-400 mb-1">Verification URL</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={verificationUrl}
                  readOnly
                  className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="text-blue-600 hover:text-blue-700 p-1"
                  title="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Powered by VerifyCert</span>
          <span>Secured on Polygon Blockchain</span>
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;