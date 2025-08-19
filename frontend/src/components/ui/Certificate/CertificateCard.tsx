import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Shield, 
  Calendar, 
  Building, 
  User, 
  Download, 
  Share2, 
  ExternalLink,
  QrCode,
  Copy,
  Printer
} from 'lucide-react';
import { useFeedbackAnimations } from '../../../hooks/useFeedbackAnimations';
import { VerificationBadge } from '../Badge';
import CertificateMetadata from './CertificateMetadata';

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
  isRevoked?: boolean;
  qrCodeURL?: string;
  verificationURL?: string;
  institutionLogo?: string;
  certificateType?: string;
  grade?: string;
  credits?: number;
  description?: string;

interface CertificateCardProps {
  certificate: Certificate;
  variant?: 'default' | 'premium' | 'compact';
  showQR?: boolean;
  showActions?: boolean;
  isPublicView?: boolean;
  className?: string;
  onDownload?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
  onVerify?: () => void;

const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  variant = 'premium',
  showQR = true,
  showActions = true,
  isPublicView = false,
  className = '',
  onDownload,
  onShare,
  onPrint,
  onVerify,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const feedback = useFeedbackAnimations();

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

    setIsLoading(true);
    try {
      // Create a downloadable certificate
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas not supported');

      // Set canvas size for high-quality output
      canvas.width = 1200;
      canvas.height = 900;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, '#f8fafc');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Decorative border
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 8;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

      // Inner border
      ctx.strokeStyle = '#dbeafe';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

      // Header
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 48px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Certificate of Achievement', canvas.width / 2, 150);

      // Decorative line
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 200, 180);
      ctx.lineTo(canvas.width / 2 + 200, 180);
      ctx.stroke();

      // Institution
      ctx.fillStyle = '#374151';
      ctx.font = '24px Inter, Arial, sans-serif';
      ctx.fillText(`Issued by ${certificate.institutionName}`, canvas.width / 2, 240);

      // "This certifies that" text
      ctx.fillStyle = '#6b7280';
      ctx.font = '20px Inter, Arial, sans-serif';
      ctx.fillText('This is to certify that', canvas.width / 2, 300);

      // Recipient name
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 42px Inter, Arial, sans-serif';
      ctx.fillText(certificate.recipientName, canvas.width / 2, 360);

      // "has successfully completed" text
      ctx.fillStyle = '#6b7280';
      ctx.font = '20px Inter, Arial, sans-serif';
      ctx.fillText('has successfully completed', canvas.width / 2, 420);

      // Course name
      ctx.fillStyle = '#2563eb';
      ctx.font = 'bold 36px Inter, Arial, sans-serif';
      ctx.fillText(certificate.courseName, canvas.width / 2, 480);

      // Date and certificate ID
      ctx.fillStyle = '#374151';
      ctx.font = '18px Inter, Arial, sans-serif';
      ctx.fillText(`Date: ${formatDate(certificate.issueDate)}`, canvas.width / 2, 560);
      ctx.fillText(`Certificate ID: ${certificate.tokenId}`, canvas.width / 2, 590);

      // Verification info
      ctx.fillStyle = '#6b7280';
      ctx.font = '14px Inter, Arial, sans-serif';
      ctx.fillText('This certificate is verified on the blockchain', canvas.width / 2, 650);
      ctx.fillText(`Issuer: ${formatAddress(certificate.issuer)}`, canvas.width / 2, 675);

      // Verification badge
      if (certificate.isValid && !certificate.isRevoked) {
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 16px Inter, Arial, sans-serif';
        ctx.fillText('✓ BLOCKCHAIN VERIFIED', canvas.width / 2, 720);

      // Footer
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px Inter, Arial, sans-serif';
      ctx.fillText('Powered by VerifyCert - Secured on Polygon Blockchain', canvas.width / 2, 800);

      // Download
      const link = document.createElement('a');
      link.download = `certificate-${certificate.tokenId}.png`;
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
  };

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;

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
        await navigator.clipboard.writeText(shareData.url || window.location.href);
        feedback.showSuccess('Certificate link copied to clipboard!');
    } catch (error) {
      console.error('Share failed:', error);
      feedback.showError('Failed to share certificate', {
        shake: true
      });
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
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    window.print();
  };

  const getStatusBadge = () => {
    return (
      <VerificationBadge
        tokenId={certificate.tokenId}
        isValid={certificate.isValid}
        isRevoked={certificate.isRevoked}
        variant="detailed"
        showDetails={true}
        size="default"
      />
    );
  };

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl shadow-soft border border-neutral-200 p-6 ${className}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Award className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-lg">{certificate.courseName}</h3>
              <p className="text-sm text-neutral-500">#{certificate.tokenId}</p>
            </div>
          </div>
          <VerificationBadge
            tokenId={certificate.tokenId}
            isValid={certificate.isValid}
            isRevoked={certificate.isRevoked}
            variant="minimal"
            size="sm"
          />
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-3">
            <User className="h-4 w-4 text-neutral-400" />
            <span className="font-medium text-neutral-900">{certificate.recipientName}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Building className="h-4 w-4 text-neutral-400" />
            <span className="text-neutral-700">{certificate.institutionName}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="h-4 w-4 text-neutral-400" />
            <span className="text-neutral-700">{formatDate(certificate.issueDate)}</span>
          </div>
        </div>

        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={onVerify}
              className="flex-1 flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Verify</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-2 rounded-lg transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </motion.div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-strong border border-neutral-200 overflow-hidden max-w-4xl mx-auto print:shadow-none print:max-w-full ${className}`}
    >
      {/* Certificate Header - Premium Design */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white p-8 print:bg-neutral-800">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-4 left-4 w-16 h-16 border-2 border-white rounded-full"></div>
          <div className="absolute top-8 right-8 w-12 h-12 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-4 left-8 w-8 h-8 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-8 right-4 w-20 h-20 border-2 border-white rounded-full"></div>
        </div>

        <div className="relative z-10">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <Award className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">Certificate of Achievement</h1>
            <div className="w-24 h-1 bg-accent-400 mx-auto rounded-full"></div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-lg">Issued by</p>
              <p className="text-2xl font-semibold">{certificate.institutionName}</p>
            </div>
            {getStatusBadge()}
          </div>
        </div>
      </div>

      {/* Certificate Body */}
      <div className="p-8 print:p-6">
        {/* Main Certificate Content */}
        <div className="text-center mb-8">
          <p className="text-neutral-600 text-xl mb-4">This is to certify that</p>
          <h2 className="text-5xl font-bold text-neutral-900 mb-4 print:text-3xl break-words">
            {certificate.recipientName}
          </h2>
          <p className="text-neutral-600 text-xl mb-2">has successfully completed</p>
          <h3 className="text-3xl font-semibold text-primary-600 mb-6 print:text-xl print:text-neutral-800 break-words">
            {certificate.courseName}
          </h3>
          
          {certificate.description && (
            <p className="text-neutral-600 max-w-2xl mx-auto mb-6">
              {certificate.description}
            </p>
          )}

          {certificate.grade && (
            <div className="inline-flex items-center space-x-2 bg-accent-50 text-accent-800 px-4 py-2 rounded-full mb-6">
              <span className="font-medium">Grade: {certificate.grade}</span>
            </div>
          )}
        </div>

        {/* Certificate Metadata */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Organized Metadata */}
          <div className="space-y-6">
            <CertificateMetadata
              metadata={{
                tokenId: certificate.tokenId,
                issuer: certificate.issuer,
                recipient: certificate.recipient,
                recipientName: certificate.recipientName,
                courseName: certificate.courseName,
                institutionName: certificate.institutionName,
                issueDate: certificate.issueDate,
                certificateType: certificate.certificateType,
                grade: certificate.grade,
                credits: certificate.credits,
                description: certificate.description,
                networkName: 'Polygon Mumbai'
              }}
              variant="default"
              showBlockchainInfo={!isPublicView}
              showExtendedInfo={true}
              collapsible={false}
              className="border-0 bg-transparent p-0"
            />
          </div>

          {/* Right Column - QR Code and Actions */}
          <div className="space-y-6">
            {showQR && certificate.qrCodeURL && (
              <div>
                <h4 className="text-lg font-semibold text-neutral-900 mb-4">Verification QR Code</h4>
                <div className="bg-neutral-50 p-6 rounded-xl text-center border border-neutral-200">
                  {!imageError ? (
                    <img
                      src={certificate.qrCodeURL}
                      alt="Certificate QR Code"
                      className="mx-auto w-40 h-40 rounded-lg"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-40 h-40 mx-auto bg-neutral-200 rounded-lg flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-neutral-400" />
                    </div>
                  )}
                  <p className="text-sm text-neutral-500 mt-3">Scan to verify authenticity</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {showActions && (
              <div>
                <h4 className="text-lg font-semibold text-neutral-900 mb-4">Actions</h4>
                
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={handleDownload}
                    disabled={isLoading}
                    className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Download Certificate</span>
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleShare}
                      className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>

                    <button
                      onClick={handlePrint}
                      className="flex items-center justify-center space-x-2 bg-neutral-600 hover:bg-neutral-700 text-white px-4 py-3 rounded-lg font-medium transition-colors print:hidden"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Print</span>
                    </button>
                  </div>

                  <button
                    onClick={handleCopyLink}
                    className="flex items-center justify-center space-x-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy Verification Link</span>
                  </button>
                </div>
              </div>
            )}

            {/* Verification URL Display */}
            {certificate.verificationURL && (
              <div className="pt-6 border-t border-neutral-200">
                <label className="block text-sm font-medium text-neutral-500 mb-2">Verification URL</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={certificate.verificationURL}
                    readOnly
                    className="flex-1 text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="text-primary-600 hover:text-primary-700 p-2 rounded-lg hover:bg-primary-50 transition-colors"
                    title="Copy link"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Verification Status */}
        <div className="mb-6">
          <VerificationBadge
            tokenId={certificate.tokenId}
            isValid={certificate.isValid}
            isRevoked={certificate.isRevoked}
            variant="premium"
            showDetails={true}
          />
        </div>

        {/* Print-only verification URL */}
        <div className="hidden print:block text-center border-t border-neutral-200 pt-6">
          <p className="text-sm text-neutral-600 mb-2">Verify this certificate online at:</p>
          <p className="text-sm font-mono break-all">{certificate.verificationURL || window.location.href}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-neutral-50 px-8 py-4 border-t border-neutral-200">
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Powered by VerifyCert</span>
          </div>
          <span>Secured on Polygon Blockchain</span>
        </div>
      </div>
    </motion.div>
  );
};

export default CertificateCard;