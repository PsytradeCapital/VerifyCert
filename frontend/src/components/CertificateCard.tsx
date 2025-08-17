import React, { useState } from 'react';
import { useFeedbackAnimations } from '../hooks/useFeedbackAnimations';
import { ariaLabels, ariaDescriptions, generateAriaId } from '../utils/ariaUtils';

export interface Certificate {
  tokenId: string;
  issuer: string;
  recipient: string;
  recipientName: string;
  courseName: string;
  institutionName: string;
  issueDate: number;
  metadataURI?: string;
  isValid: boolean;
  qrCodeURL?: string;
  verificationURL?: string;
}

interface CertificateCardProps {
  certificate: Certificate;
  showQR?: boolean;
  isPublicView?: boolean;
  className?: string;
  onDownload?: () => void;
  onShare?: () => void;
}

export default function CertificateCard({
  certificate,
  showQR = true,
  isPublicView = false,
  className = '',
  onDownload,
  onShare,
}: CertificateCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const feedback = useFeedbackAnimations();
  
  // Generate IDs for ARIA relationships
  const cardId = generateAriaId('certificate-card');
  const detailsId = generateAriaId('certificate-details');
  const actionsId = generateAriaId('certificate-actions');
  const qrCodeId = generateAriaId('qr-code');

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    setIsLoading(true);
    try {
      // Create a downloadable certificate image/PDF
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas not supported');
      }

      // Set canvas size
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

      feedback.showSuccess('Certificate downloaded successfully!', {
        showConfetti: true,
        position: 'top-right'
      });
    } catch (error) {
      console.error('Download failed:', error);
      feedback.showError('Failed to download certificate', {
        shake: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }

    const shareData = {
      title: `Certificate: ${certificate.courseName}`,
      text: `${certificate.recipientName} has completed ${certificate.courseName} from ${certificate.institutionName}`,
      url: certificate.verificationURL || window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        feedback.showSuccess('Certificate shared successfully!', {
          showConfetti: true
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareData.url || window.location.href);
        feedback.showSuccess('Certificate link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
      feedback.showError('Failed to share certificate', {
        shake: true
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = certificate.verificationURL || window.location.href;
      await navigator.clipboard.writeText(url);
      feedback.showSuccess('Verification link copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      feedback.showError('Failed to copy link', {
        shake: true
      });
    }
  };

  return (
    <article 
      id={cardId}
      className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${className}`}
      aria-labelledby={`${cardId}-title`}
      aria-describedby={detailsId}
    >
      {/* Certificate Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 id={`${cardId}-title`} className="text-2xl font-bold mb-2">
              Certificate of Completion
            </h2>
            <p className="text-blue-100">Verified on Blockchain</p>
          </div>
          {certificate.isValid ? (
            <div 
              className="flex items-center space-x-2 bg-green-500 px-3 py-1 rounded-full"
              role="status"
              aria-label={ariaLabels.status.verified}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Verified</span>
            </div>
          ) : (
            <div 
              className="flex items-center space-x-2 bg-red-500 px-3 py-1 rounded-full"
              role="status"
              aria-label={ariaLabels.status.unverified}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Invalid</span>
            </div>
          )}
        </div>
      </header>

      {/* Certificate Body */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Certificate Details */}
          <section id={detailsId} className="space-y-4" aria-labelledby="details-heading">
            <div>
              <h3 id="details-heading" className="text-lg font-semibold text-gray-900 mb-4">
                Certificate Details
              </h3>
              
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
                {!isPublicView && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400">Recipient Address</label>
                    <p className="text-sm font-mono text-gray-700">{formatAddress(certificate.recipient)}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* QR Code and Actions */}
          <aside className="space-y-4" aria-labelledby="qr-actions-heading">
            {showQR && certificate.qrCodeURL && (
              <div>
                <h4 id="qr-actions-heading" className="text-sm font-medium text-gray-500 mb-2">
                  Verification QR Code
                </h4>
                <div 
                  className="bg-gray-50 p-4 rounded-lg text-center"
                  role="img"
                  aria-labelledby={qrCodeId}
                >
                  <div id={qrCodeId} className="sr-only">
                    {ariaDescriptions.certificates.qrCode}
                  </div>
                  <img
                    src={certificate.qrCodeURL}
                    alt={ariaLabels.media.qrCode}
                    className="mx-auto w-32 h-32"
                  />
                  <p className="text-xs text-gray-500 mt-2">Scan to verify</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <section id={actionsId} className="space-y-3" aria-labelledby="actions-heading">
              <h4 id="actions-heading" className="text-sm font-medium text-gray-500">Actions</h4>
              
              <div className="grid grid-cols-1 gap-2" role="group" aria-labelledby="actions-heading">
                <button
                  onClick={handleDownload}
                  disabled={isLoading}
                  className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  aria-label={ariaLabels.actions.downloadCertificate}
                  aria-describedby="download-description"
                >
                  <div id="download-description" className="sr-only">
                    {ariaDescriptions.certificates.download}
                  </div>
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  aria-label={ariaLabels.actions.shareCertificate}
                  aria-describedby="share-description"
                >
                  <div id="share-description" className="sr-only">
                    {ariaDescriptions.certificates.share}
                  </div>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  aria-label={ariaLabels.actions.copyCertificateLink}
                  aria-describedby="copy-description"
                >
                  <div id="copy-description" className="sr-only">
                    Copy the verification link for this certificate to your clipboard
                  </div>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span>Copy Link</span>
                </button>
              </div>

              {/* Verification Link */}
              {certificate.verificationURL && (
                <div className="pt-3 border-t border-gray-200">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Verification URL</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={certificate.verificationURL}
                      readOnly
                      className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 font-mono"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="Copy link"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Powered by VerifyCert</span>
          <span>Secured on Polygon Blockchain</span>
        </div>
      </div>
    </article>
  );
}