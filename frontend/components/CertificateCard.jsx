import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, ExternalLink, Shield, Calendar, User, GraduationCap, Building } from 'lucide-react';
import { useFeedbackAnimations } from '../hooks/useFeedbackAnimations';
import { OptimizedImage } from './ui/OptimizedImage';
import { ariaLabels, ariaDescriptions, generateAriaId } from '../utils/ariaUtils';

const CertificateCard = ({
  certificate,
  showQR = true,
  isPublicView = false,
  className = '',
  onDownload,
  onShare,
  onVerify
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const feedback = useFeedbackAnimations();
  
  // Generate IDs for ARIA relationships
  const cardId = generateAriaId('certificate-card');
  const detailsId = generateAriaId('certificate-details');
  const actionsId = generateAriaId('certificate-actions');
  const qrCodeId = generateAriaId('qr-code');

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

      // Set canvas size for high-quality output
      canvas.width = 1200;
      canvas.height = 900;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

      // Inner border
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

      // Header
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Certificate of Completion', canvas.width / 2, 150);

      // Verification badge
      ctx.fillStyle = certificate.isValid ? '#059669' : '#dc2626';
      ctx.font = '20px Arial';
      ctx.fillText(certificate.isValid ? '✓ Verified on Blockchain' : '✗ Invalid Certificate', canvas.width / 2, 190);

      // Institution
      ctx.fillStyle = '#374151';
      ctx.font = '28px Arial';
      ctx.fillText(`${certificate.institutionName}`, canvas.width / 2, 250);

      // Recipient section
      ctx.fillStyle = '#111827';
      ctx.font = '24px Arial';
      ctx.fillText('This certifies that', canvas.width / 2, 320);
      
      ctx.font = 'bold 42px Arial';
      ctx.fillStyle = '#1e40af';
      ctx.fillText(`${certificate.recipientName}`, canvas.width / 2, 380);

      // Course section
      ctx.fillStyle = '#374151';
      ctx.font = '24px Arial';
      ctx.fillText('has successfully completed', canvas.width / 2, 440);
      
      ctx.font = 'bold 36px Arial';
      ctx.fillStyle = '#111827';
      ctx.fillText(`${certificate.courseName}`, canvas.width / 2, 500);

      // Date and details
      ctx.fillStyle = '#6b7280';
      ctx.font = '20px Arial';
      ctx.fillText(`Issue Date: ${formatDate(certificate.issueDate)}`, canvas.width / 2, 580);
      ctx.fillText(`Certificate ID: ${certificate.tokenId}`, canvas.width / 2, 610);
      ctx.fillText(`Issuer: ${formatAddress(certificate.issuer)}`, canvas.width / 2, 640);

      // Footer
      ctx.fillStyle = '#9ca3af';
      ctx.font = '16px Arial';
      ctx.fillText('Powered by VerifyCert - Secured on Polygon Blockchain', canvas.width / 2, 750);
      
      if (certificate.verificationURL) {
        ctx.fillText(`Verify at: ${certificate.verificationURL}`, canvas.width / 2, 780);
      }

      // Download
      const link = document.createElement('a');
      link.download = `certificate-${certificate.tokenId}-${certificate.recipientName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
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
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
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
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
        feedback.showError('Failed to share certificate', {
          shake: true
        });
      }
    }
  };

  const handleVerify = () => {
    if (onVerify) {
      onVerify(certificate.tokenId);
    } else {
      // Navigate to verification page
      window.open(`/verify?id=${certificate.tokenId}`, '_blank');
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
    <motion.article 
      id={cardId}
      className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}
      role="article"
      aria-labelledby={`${cardId}-title`}
      aria-describedby={detailsId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      {/* Certificate Header */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white p-6 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <GraduationCap className="h-6 w-6" aria-hidden="true" />
              <h2 id={`${cardId}-title`} className="text-2xl font-bold">
                Certificate of Completion
              </h2>
            </div>
            <p className="text-blue-100 flex items-center space-x-2">
              <Shield className="h-4 w-4" aria-hidden="true" />
              <span>Verified on Blockchain</span>
            </p>
          </div>
          
          {/* Status Badge */}
          <div className="flex-shrink-0">
            {certificate.isValid ? (
              <motion.div 
                className="flex items-center space-x-2 bg-green-500 px-4 py-2 rounded-full shadow-lg"
                role="status"
                aria-label={ariaLabels.status.verified}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Shield className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm font-medium">Verified</span>
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center space-x-2 bg-red-500 px-4 py-2 rounded-full shadow-lg"
                role="status"
                aria-label={ariaLabels.status.unverified}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm font-medium">Invalid</span>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Certificate Body */}
      <div className="p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Certificate Details */}
          <section id={detailsId} className="lg:col-span-2 space-y-6" aria-labelledby="details-heading">
            <div>
              <h3 id="details-heading" className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <span>Certificate Details</span>
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Recipient</label>
                  <p className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    <span>{certificate.recipientName}</span>
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Course/Achievement</label>
                  <p className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    <span>{certificate.courseName}</span>
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Institution</label>
                  <p className="text-base text-gray-900 flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    <span>{certificate.institutionName}</span>
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Issue Date</label>
                  <p className="text-base text-gray-900 flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    <span>{formatDate(certificate.issueDate)}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Blockchain Info */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center space-x-2">
                <Shield className="h-4 w-4" aria-hidden="true" />
                <span>Blockchain Information</span>
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400">Certificate ID</label>
                  <p className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                    {certificate.tokenId}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400">Issuer Address</label>
                  <p className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                    {formatAddress(certificate.issuer)}
                  </p>
                </div>
                {!isPublicView && certificate.recipient && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-400">Recipient Address</label>
                    <p className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                      {formatAddress(certificate.recipient)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* QR Code and Actions */}
          <aside className="space-y-6" aria-labelledby="qr-actions-heading">
            {showQR && certificate.qrCodeURL && (
              <div>
                <h4 id="qr-actions-heading" className="text-sm font-medium text-gray-500 mb-3">
                  Verification QR Code
                </h4>
                <div 
                  className="bg-gray-50 p-4 rounded-lg text-center border-2 border-dashed border-gray-300"
                  role="img"
                  aria-labelledby={qrCodeId}
                >
                  <div id={qrCodeId} className="sr-only">
                    {ariaDescriptions.certificates.qrCode}
                  </div>
                  <OptimizedImage
                    src={certificate.qrCodeURL}
                    alt={ariaLabels.media.qrCode}
                    className="mx-auto w-32 h-32 rounded-lg shadow-sm"
                    aspectRatio="square"
                    responsive={false}
                    webpFallback={false}
                    priority={true}
                    optimization={{
                      width: 128,
                      height: 128,
                      quality: 100,
                    }}
                    loadingComponent={() => (
                      <div className="w-32 h-32 mx-auto bg-gray-200 rounded-lg flex items-center justify-center animate-pulse">
                        <Shield className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    errorComponent={({ retry }) => (
                      <div className="w-32 h-32 mx-auto bg-gray-200 rounded-lg flex flex-col items-center justify-center">
                        <ExternalLink className="h-8 w-8 text-gray-400 mb-2" />
                        <button
                          onClick={retry}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  />
                  <p className="text-xs text-gray-500 mt-2 font-medium">Scan to verify</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <section id={actionsId} className="space-y-3" aria-labelledby="actions-heading">
              <h4 id="actions-heading" className="text-sm font-medium text-gray-500">Actions</h4>
              
              <div className="space-y-2" role="group" aria-labelledby="actions-heading">
                <motion.button
                  onClick={handleDownload}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                  aria-label={ariaLabels.actions.downloadCertificate}
                  aria-describedby="download-description"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div id="download-description" className="sr-only">
                    {ariaDescriptions.certificates.download}
                  </div>
                  {isLoading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" aria-hidden="true" />
                      <span>Download</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                  aria-label={ariaLabels.actions.shareCertificate}
                  aria-describedby="share-description"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div id="share-description" className="sr-only">
                    {ariaDescriptions.certificates.share}
                  </div>
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                  <span>Share</span>
                </motion.button>

                <motion.button
                  onClick={handleVerify}
                  className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                  aria-label="Verify certificate authenticity"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Shield className="h-4 w-4" aria-hidden="true" />
                  <span>Verify</span>
                </motion.button>

                <motion.button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                  aria-label={ariaLabels.actions.copyCertificateLink}
                  aria-describedby="copy-description"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div id="copy-description" className="sr-only">
                    Copy the verification link for this certificate to your clipboard
                  </div>
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  <span>Copy Link</span>
                </motion.button>
              </div>
            </section>

            {/* Verification Link */}
            {certificate.verificationURL && (
              <div className="pt-3 border-t border-gray-200">
                <label className="block text-xs font-medium text-gray-400 mb-2">Verification URL</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={certificate.verificationURL}
                    readOnly
                    className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-2 font-mono text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Certificate verification URL"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="text-blue-600 hover:text-blue-700 p-2 rounded hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Copy verification link"
                    aria-label="Copy verification link"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4" aria-hidden="true" />
            <span>Powered by VerifyCert</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-hidden="true"></div>
            <span>Secured on Polygon Blockchain</span>
          </div>
        </div>
      </footer>
    </motion.article>
  );
};

export default CertificateCard;