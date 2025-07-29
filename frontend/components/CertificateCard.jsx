import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Calendar,
  User,
  GraduationCap,
  Building,
  Hash,
  Download,
  Share2,
  ExternalLink,
  QrCode,
  Copy,
  Eye,
  Award,
  Verified
} from 'lucide-react';
import QRCode from 'qrcode';
import { 
  Card, 
  Button, 
  Badge, 
  Modal, 
  Tooltip 
} from '../src/components/ui';

/**
 * Enhanced Certificate Card Component
 * Displays certificate information with premium styling and interactive features
 */
const CertificateCard = ({ 
  certificate, 
  variant = 'default',
  showActions = true,
  showQRCode = false,
  onVerify,
  onShare,
  onDownload,
  className = ''
}) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [showFullDetails, setShowFullDetails] = useState(false);
  const canvasRef = useRef(null);

  // Generate verification URL
  const verificationUrl = `${window.location.origin}/verify/${certificate.certificateHash}`;

  // Format date helper
  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === '0') return 'No expiry';
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get certificate status
  const getCertificateStatus = () => {
    if (certificate.isRevoked) {
      return {
        status: 'revoked',
        label: 'Revoked',
        icon: XCircle,
        color: 'error',
        bgColor: 'bg-error-50',
        textColor: 'text-error-700',
        borderColor: 'border-error-200'
      };
    }

    if (certificate.isExpired) {
      return {
        status: 'expired',
        label: 'Expired',
        icon: AlertTriangle,
        color: 'warning',
        bgColor: 'bg-warning-50',
        textColor: 'text-warning-700',
        borderColor: 'border-warning-200'
      };
    }

    if (certificate.isValid) {
      return {
        status: 'valid',
        label: 'Verified',
        icon: CheckCircle,
        color: 'success',
        bgColor: 'bg-success-50',
        textColor: 'text-success-700',
        borderColor: 'border-success-200'
      };
    }

    return {
      status: 'invalid',
      label: 'Invalid',
      icon: XCircle,
      color: 'error',
      bgColor: 'bg-error-50',
      textColor: 'text-error-700',
      borderColor: 'border-error-200'
    };
  };

  // Generate QR Code
  const generateQRCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
      setQrCodeDataUrl(dataUrl);
      setShowQRModal(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  // Copy verification URL
  const copyVerificationUrl = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      // Show success toast (implement toast system)
      console.log('Verification URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  // Share certificate
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate: ${certificate.courseName}`,
          text: `Verify this certificate for ${certificate.recipientName}`,
          url: verificationUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyVerificationUrl();
    }
    
    if (onShare) onShare(certificate);
  };

  // Download certificate
  const handleDownload = () => {
    // Create a canvas to generate certificate image
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    // Draw certificate background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Draw content
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF COMPLETION', canvas.width / 2, 120);

    ctx.font = '24px Inter, sans-serif';
    ctx.fillText('This is to certify that', canvas.width / 2, 180);

    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillStyle = '#3b82f6';
    ctx.fillText(certificate.recipientName, canvas.width / 2, 240);

    ctx.font = '24px Inter, sans-serif';
    ctx.fillStyle = '#1f2937';
    ctx.fillText('has successfully completed', canvas.width / 2, 300);

    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText(certificate.courseName, canvas.width / 2, 360);

    ctx.font = '20px Inter, sans-serif';
    ctx.fillText(`Issued by ${certificate.institutionName}`, canvas.width / 2, 420);
    ctx.fillText(`Date: ${formatDate(certificate.issueDate)}`, canvas.width / 2, 460);

    // Download the image
    const link = document.createElement('a');
    link.download = `certificate-${certificate.recipientName.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL();
    link.click();

    if (onDownload) onDownload(certificate);
  };

  const status = getCertificateStatus();
  const StatusIcon = status.icon;

  const cardVariants = {
    default: 'card',
    premium: 'card-elevated bg-gradient-to-br from-white to-neutral-50',
    compact: 'card border-l-4 border-l-primary-500'
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`${cardVariants[variant]} ${className}`}
      >
        {/* Certificate Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Award className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900 mb-1">
                Certificate of Completion
              </h3>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={status.color} 
                  className="flex items-center space-x-1"
                >
                  <StatusIcon className="w-3 h-3" />
                  <span>{status.label}</span>
                </Badge>
                {certificate.isValid && (
                  <Tooltip content="Blockchain Verified">
                    <Verified className="w-5 h-5 text-primary-500" />
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          {showActions && (
            <div className="flex items-center space-x-2">
              <Tooltip content="View Details">
                <Button
                  variant="tertiary"
                  size="sm"
                  icon={<Eye className="w-4 h-4" />}
                  onClick={() => setShowFullDetails(true)}
                />
              </Tooltip>
              <Tooltip content="Generate QR Code">
                <Button
                  variant="tertiary"
                  size="sm"
                  icon={<QrCode className="w-4 h-4" />}
                  onClick={generateQRCode}
                />
              </Tooltip>
            </div>
          )}
        </div>

        {/* Certificate Content */}
        <div className="space-y-4">
          {/* Recipient Information */}
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <User className="w-5 h-5 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-600">Recipient</span>
            </div>
            <p className="text-lg font-semibold text-neutral-900">
              {certificate.recipientName}
            </p>
            <p className="text-sm text-neutral-500 font-mono">
              {certificate.recipientAddress}
            </p>
          </div>

          {/* Course Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <GraduationCap className="w-5 h-5 text-neutral-500 mt-1" />
              <div>
                <p className="text-sm font-medium text-neutral-600">Course</p>
                <p className="text-base font-semibold text-neutral-900">
                  {certificate.courseName}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Building className="w-5 h-5 text-neutral-500 mt-1" />
              <div>
                <p className="text-sm font-medium text-neutral-600">Institution</p>
                <p className="text-base font-semibold text-neutral-900">
                  {certificate.institutionName}
                </p>
              </div>
            </div>
          </div>

          {/* Date Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-neutral-500 mt-1" />
              <div>
                <p className="text-sm font-medium text-neutral-600">Issue Date</p>
                <p className="text-base text-neutral-900">
                  {formatDate(certificate.issueDate)}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-neutral-500 mt-1" />
              <div>
                <p className="text-sm font-medium text-neutral-600">Expiry Date</p>
                <p className="text-base text-neutral-900">
                  {formatDate(certificate.expiryDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Certificate Hash */}
          <div className="flex items-start space-x-3">
            <Hash className="w-5 h-5 text-neutral-500 mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600">Certificate Hash</p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-sm font-mono text-neutral-700 bg-neutral-100 px-2 py-1 rounded truncate">
                  {certificate.certificateHash}
                </p>
                <Button
                  variant="tertiary"
                  size="sm"
                  icon={<Copy className="w-3 h-3" />}
                  onClick={copyVerificationUrl}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-neutral-200">
            <Button
              variant="primary"
              icon={<Shield className="w-4 h-4" />}
              onClick={() => onVerify && onVerify(certificate)}
            >
              Verify Certificate
            </Button>
            <Button
              variant="secondary"
              icon={<Share2 className="w-4 h-4" />}
              onClick={handleShare}
            >
              Share
            </Button>
            <Button
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
              onClick={handleDownload}
            >
              Download
            </Button>
            <Button
              variant="tertiary"
              icon={<ExternalLink className="w-4 h-4" />}
              onClick={() => window.open(verificationUrl, '_blank')}
            >
              View Public
            </Button>
          </div>
        )}

        {/* QR Code Display */}
        {showQRCode && (
          <div className="mt-6 pt-6 border-t border-neutral-200 text-center">
            <p className="text-sm font-medium text-neutral-600 mb-3">
              Scan to verify certificate
            </p>
            <div className="inline-block p-4 bg-white border-2 border-neutral-200 rounded-lg">
              <img 
                src={qrCodeDataUrl} 
                alt="Certificate QR Code"
                className="w-32 h-32"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="Certificate QR Code"
        size="md"
      >
        <div className="text-center space-y-4">
          <p className="text-neutral-600">
            Scan this QR code to verify the certificate
          </p>
          {qrCodeDataUrl && (
            <div className="inline-block p-6 bg-white border-2 border-neutral-200 rounded-xl">
              <img 
                src={qrCodeDataUrl} 
                alt="Certificate QR Code"
                className="w-64 h-64"
              />
            </div>
          )}
          <div className="space-y-2">
            <p className="text-sm text-neutral-500">Verification URL:</p>
            <div className="flex items-center space-x-2 p-3 bg-neutral-50 rounded-lg">
              <code className="flex-1 text-xs text-neutral-700 break-all">
                {verificationUrl}
              </code>
              <Button
                variant="tertiary"
                size="sm"
                icon={<Copy className="w-4 h-4" />}
                onClick={copyVerificationUrl}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Full Details Modal */}
      <Modal
        isOpen={showFullDetails}
        onClose={() => setShowFullDetails(false)}
        title="Certificate Details"
        size="lg"
      >
        <div className="space-y-6">
          {/* Status Banner */}
          <div className={`${status.bgColor} ${status.borderColor} border rounded-lg p-4`}>
            <div className="flex items-center space-x-3">
              <StatusIcon className={`w-6 h-6 ${status.textColor}`} />
              <div>
                <h4 className={`font-semibold ${status.textColor}`}>
                  Certificate Status: {status.label}
                </h4>
                <p className="text-sm text-neutral-600">
                  {certificate.isValid 
                    ? 'This certificate is authentic and verified on the blockchain.'
                    : certificate.isRevoked 
                    ? 'This certificate has been revoked by the issuer.'
                    : certificate.isExpired
                    ? 'This certificate has expired.'
                    : 'This certificate is not valid.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="font-semibold text-neutral-900">Certificate Information</h5>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-neutral-600">Token ID</label>
                  <p className="text-neutral-900">{certificate.tokenId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">Recipient Name</label>
                  <p className="text-neutral-900">{certificate.recipientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">Course Name</label>
                  <p className="text-neutral-900">{certificate.courseName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">Institution</label>
                  <p className="text-neutral-900">{certificate.institutionName}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="font-semibold text-neutral-900">Blockchain Information</h5>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-neutral-600">Issuer Address</label>
                  <p className="text-neutral-900 font-mono text-sm break-all">
                    {certificate.issuer}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">Recipient Address</label>
                  <p className="text-neutral-900 font-mono text-sm break-all">
                    {certificate.recipientAddress}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">Certificate Hash</label>
                  <p className="text-neutral-900 font-mono text-sm break-all">
                    {certificate.certificateHash}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">Issue Date</label>
                  <p className="text-neutral-900">{formatDate(certificate.issueDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">Expiry Date</label>
                  <p className="text-neutral-900">{formatDate(certificate.expiryDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Hidden canvas for certificate generation */}
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
};

export default CertificateCard;