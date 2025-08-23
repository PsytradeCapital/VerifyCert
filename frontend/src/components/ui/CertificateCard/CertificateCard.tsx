import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, CheckCircle, XCircle, Calendar, User, Building, Award, QrCode } from 'lucide-react';
import Button from '../Button/Button';
import Card from '../Card/Card';

export interface Certificate {
  tokenId: string;
  issuer: string;
  recipient: string;
  recipientName: string;
  courseName: string;
  institutionName: string;
  issueDate: number;
  isValid: boolean;
  qrCodeURL?: string;
  verificationURL?: string;
  grade?: string;
}

interface CertificateCardProps {
  certificate: Certificate;
  showQR?: boolean;
  isPublicView?: boolean;
  className?: string;
  onDownload?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  showQR = true,
  isPublicView = false,
  className = '',
  onDownload,
  onShare,
  onPrint
}) => {
  const [isLoading, setIsLoading] = useState(false);

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
      // Create downloadable certificate
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas not supported');

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
      ctx.fillText('has successfully completed', canvas.width / 2, 270);
      ctx.font = 'bold 26px Arial';
      ctx.fillText(`${certificate.courseName}`, canvas.width / 2, 320);

      // Date
      ctx.font = '18px Arial';
      ctx.fillText(`Date: ${formatDate(certificate.issueDate)}`, canvas.width / 2, 380);

      // Download
      const link = document.createElement('a');
      link.download = `certificate-${certificate.tokenId}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
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
      text: `${certificate.recipientName} completed ${certificate.courseName}`,
      url: certificate.verificationURL || window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url || window.location.href);
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = certificate.verificationURL || window.location.href;
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card variant="elevated" padding="none" className="overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Certificate of Completion</h2>
              <p className="text-blue-100">Verified on Blockchain</p>
            </div>
            {certificate.isValid ? (
              <div className="flex items-center space-x-2 bg-green-500 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Verified</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-red-500 px-3 py-1 rounded-full">
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Invalid</span>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Certificate Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-600" />
                Certificate Details
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Recipient</p>
                    <p className="font-semibold text-gray-900">{certificate.recipientName}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Award className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Course/Achievement</p>
                    <p className="font-semibold text-gray-900">{certificate.courseName}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Building className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Institution</p>
                    <p className="text-gray-900">{certificate.institutionName}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Issue Date</p>
                    <p className="text-gray-900">{formatDate(certificate.issueDate)}</p>
                  </div>
                </div>

                {certificate.grade && (
                  <div className="flex items-start">
                    <Award className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Grade</p>
                      <p className="font-semibold text-gray-900">{certificate.grade}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Blockchain Info */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Blockchain Information</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-400">Certificate ID</p>
                    <p className="text-sm font-mono text-gray-700">{certificate.tokenId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Issuer Address</p>
                    <p className="text-sm font-mono text-gray-700">{formatAddress(certificate.issuer)}</p>
                  </div>
                  {!isPublicView && (
                    <div>
                      <p className="text-xs text-gray-400">Recipient Address</p>
                      <p className="text-sm font-mono text-gray-700">{formatAddress(certificate.recipient)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* QR Code and Actions */}
            <div className="space-y-4">
              {showQR && certificate.qrCodeURL && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <QrCode className="w-4 h-4 mr-2" />
                    Verification QR Code
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <img
                      src={certificate.qrCodeURL}
                      alt="QR Code for certificate verification"
                      className="mx-auto w-32 h-32"
                    />
                    <p className="text-xs text-gray-500 mt-2">Scan to verify</p>
                  </div>
                </div>
              )}
              {/* Action Buttons */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-500">Actions</h4>
                
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="default"
                    size="default"
                    onClick={handleDownload}
                    loading={isLoading}
                    fullWidth
                  >
                    Download
                  </Button>

                  <Button
                    variant="outline"
                    size="default"
                    onClick={handleShare}
                    fullWidth
                  >
                    Share
                  </Button>

                  <Button
                    variant="ghost"
                    size="default"
                    onClick={handleCopyLink}
                    fullWidth
                  >
                    Copy Link
                  </Button>

                  <Button
                    variant="ghost"
                    size="default"
                    onClick={handlePrint}
                    className="print:hidden"
                    fullWidth
                  >
                    Print
                  </Button>
                </div>
              </div>

              {/* Verification Link */}
              {certificate.verificationURL && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-400 mb-1">Verification URL</p>
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
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
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
      </Card>
    </motion.div>
  );
};