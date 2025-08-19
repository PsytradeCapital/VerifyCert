import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Share2,
  Copy,
  ExternalLink,
  Twitter,
  Linkedin,
  Facebook,
  Mail,
  QrCode,
  FileImage,
  FileText,
  Database,
  Check,
  AlertCircle
} from 'lucide-react';
import { Button, Modal, Alert } from '../';
import { CertificateData } from '../../../services/blockchainService';
import certificateService, { ShareOptions, DownloadOptions } from '../../../services/certificateService';
import { useFeedbackAnimations } from '../../../hooks/useFeedbackAnimations';

export interface CertificateActionsProps {
  certificate: CertificateData;
  className?: string;
  showLabels?: boolean;
  variant?: 'horizontal' | 'vertical' | 'grid';
  size?: 'sm' | 'md' | 'lg';

const CertificateActions: React.FC<CertificateActionsProps> = ({
  certificate,
  className = '',
  showLabels = true,
  variant = 'horizontal',
  size = 'md'
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const feedback = useFeedbackAnimations();

  const handleDownload = async (format: 'png' | 'pdf' | 'json' = 'png') => {
    setIsLoading(`download-${format}`);
    
    try {
      const options: DownloadOptions = {
        format,
        quality: 1.0,
        includeVerificationInfo: true
      };
      
      await certificateService.downloadCertificate(certificate, options);
      
      feedback.showSuccess(`Certificate downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Download error:', error);
      feedback.showError('Failed to download certificate');
    } finally {
      setIsLoading(null);
  };

  const handleShare = async (platform: 'twitter' | 'linkedin' | 'facebook' | 'email' | 'copy' = 'copy') => {
    setIsLoading(`share-${platform}`);
    
    try {
      const options: ShareOptions = {
        platform,
        includeQR: true,
        customMessage: `Check out my ${certificate.courseName} certificate from ${certificate.institutionName}!`
      };
      
      const shareUrl = await certificateService.shareCertificate(certificate, options);
      
      if (platform === 'copy') {
        await navigator.clipboard.writeText(shareUrl);
        feedback.showSuccess('Certificate link copied to clipboard');
      } else {
        feedback.showSuccess(`Shared on ${platform}`);
    } catch (error) {
      console.error('Share error:', error);
      feedback.showError('Failed to share certificate');
    } finally {
      setIsLoading(null);
  };

  const handleViewOnBlockchain = () => {
    if (certificate.transactionHash) {
      const explorerUrl = `https://mumbai.polygonscan.com/tx/${certificate.transactionHash}`;
      window.open(explorerUrl, '_blank');
  };

  const handleGenerateQR = async () => {
    setIsLoading('qr');
    
    try {
      const qrUrl = await certificateService.generateQRCode(certificate);
      setQrCodeUrl(qrUrl);
      feedback.showSuccess('QR code generated');
    } catch (error) {
      console.error('QR generation error:', error);
      feedback.showError('Failed to generate QR code');
    } finally {
      setIsLoading(null);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'vertical':
        return 'flex flex-col space-y-2';
      case 'grid':
        return 'grid grid-cols-2 gap-2';
      default:
        return 'flex flex-wrap gap-2';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-base';
      default:
        return 'text-sm';
  };

  const buttonSize = size === 'lg' ? 'md' : size;

  return (
    <div className={`certificate-actions ${getVariantClasses()} ${getSizeClasses()} ${className}`}>
      {/* Download Button */}
      <Button
        variant="default"
        size={buttonSize}
        onClick={() => setShowDownloadModal(true)}
        loading={isLoading?.startsWith('download')}        className="flex-1"
      >
        {showLabels && 'Download'}
      </Button>

      {/* Share Button */}
      <Button
        variant="secondary"
        size={buttonSize}
        onClick={() => setShowShareModal(true)}
        loading={isLoading?.startsWith('share')}        className="flex-1"
      >
        {showLabels && 'Share'}
      </Button>

      {/* QR Code Button */}
      <Button
        variant="outline"
        size={buttonSize}
        onClick={handleGenerateQR}
        loading={isLoading === 'qr'}      >
        {showLabels && 'QR Code'}
      </Button>

      {/* View on Blockchain Button */}
      {certificate.transactionHash && (
        <Button
          variant="outline"
          size={buttonSize}
          onClick={handleViewOnBlockchain}        >
          {showLabels && 'Blockchain'}
        </Button>
      )}

      {/* Download Modal */}
      <Modal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        title="Download Certificate"
        size="default"
      >
        <div className="p-6 space-y-4">
          <p className="text-gray-600 mb-4">
            Choose your preferred download format:
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                handleDownload('png');
                setShowDownloadModal(false);
              }}
              loading={isLoading === 'download-png'}              className="justify-start"
            >
              <div className="text-left">
                <div className="font-medium">PNG Image</div>
                <div className="text-sm text-gray-500">High-quality image format</div>
              </div>
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => {
                handleDownload('pdf');
                setShowDownloadModal(false);
              }}
              loading={isLoading === 'download-pdf'}              className="justify-start"
            >
              <div className="text-left">
                <div className="font-medium">PDF Document</div>
                <div className="text-sm text-gray-500">Printable document format</div>
              </div>
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => {
                handleDownload('json');
                setShowDownloadModal(false);
              }}
              loading={isLoading === 'download-json'}              className="justify-start"
            >
              <div className="text-left">
                <div className="font-medium">JSON Data</div>
                <div className="text-sm text-gray-500">Raw certificate data</div>
              </div>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Certificate"
        size="default"
      >
        <div className="p-6 space-y-4">
          <p className="text-gray-600 mb-4">
            Share your certificate on social media or copy the link:
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                handleShare('copy');
                setShowShareModal(false);
              }}
              loading={isLoading === 'share-copy'}              className="justify-start"
            >
              Copy Link
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => {
                handleShare('twitter');
                setShowShareModal(false);
              }}
              loading={isLoading === 'share-twitter'}              className="justify-start"
            >
              Twitter
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => {
                handleShare('linkedin');
                setShowShareModal(false);
              }}
              loading={isLoading === 'share-linkedin'}              className="justify-start"
            >
              LinkedIn
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => {
                handleShare('facebook');
                setShowShareModal(false);
              }}
              loading={isLoading === 'share-facebook'}              className="justify-start"
            >
              Facebook
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => {
                handleShare('email');
                setShowShareModal(false);
              }}
              loading={isLoading === 'share-email'}              className="justify-start col-span-2"
            >
              Email
            </Button>
          </div>
          
          {qrCodeUrl && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
              <img src={qrCodeUrl} alt="Certificate QR Code" className="mx-auto mb-2" />
              <p className="text-sm text-gray-600">QR Code for easy sharing</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Feedback Animations */}
      {feedback.renderFeedback()}
    </div>
  );
};

export default CertificateActions;