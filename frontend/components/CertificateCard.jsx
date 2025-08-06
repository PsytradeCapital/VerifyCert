import React, { useState, useRef } from 'react';
import { 
  Download, 
  Share2, 
  ExternalLink, 
  Copy, 
  XCircle, 
  Calendar,
  User,
  GraduationCap,
  Building,
  QrCode,
  Eye,
  EyeOff,
  Sparkles,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const CertificateCard = ({ 
  certificate, 
  showActions = true, 
  compact = false,
  onDownload,
  onShare 
}) => {
  const [showQR, setShowQR] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef(null);

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Copy verification URL to clipboard
  const copyVerificationURL = async () => {
    const url = certificate.verificationURL || `${window.location.origin}/verify/${certificate.tokenId}`;
    
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Verification URL copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Verification URL copied to clipboard!');
      } catch (fallbackError) {
        toast.error('Failed to copy URL');
      }
      document.body.removeChild(textArea);
    }
  };

  // Share certificate
  const shareCertificate = async () => {
    const url = certificate.verificationURL || `${window.location.origin}/verify/${certificate.tokenId}`;
    const title = `${certificate.recipientName} - ${certificate.courseName} Certificate`;
    const text = `Verify this certificate from ${certificate.institutionName}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        });
        if (onShare) onShare();
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyVerificationURL();
        }
      }
    } else {
      copyVerificationURL();
    }
  };

  // Download certificate as image
  const downloadCertificate = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      // Use html2canvas to convert the card to image
      const html2canvas = await import('html2canvas');
      
      if (cardRef.current) {
        const canvas = await html2canvas.default(cardRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true
        });
        
        // Create download link
        const link = document.createElement('a');
        link.download = `certificate-${certificate.tokenId}-${certificate.recipientName.replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        toast.success('Certificate downloaded successfully!');
        if (onDownload) onDownload();
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download certificate. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (compact) {
    return (
      <div className="group bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              {certificate.isValid ? (
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <Sparkles className="h-3 w-3 text-amber-400 flex-shrink-0" />
                </div>
              ) : (
                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              )}
              <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                {certificate.courseName}
              </h3>
            </div>
            <p className="text-xs font-medium text-gray-700 truncate">{certificate.recipientName}</p>
            <p className="text-xs text-gray-500 font-medium">{certificate.institutionName}</p>
          </div>
          <div className="flex items-center space-x-3 ml-4">
            <div className="text-right">
              <span className="text-xs font-mono text-gray-400">#{certificate.tokenId}</span>
              {certificate.isValid && (
                <div className="flex items-center justify-end mt-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-emerald-600 ml-1 font-medium">Verified</span>
                </div>
              )}
            </div>
            {showActions && (
              <button
                onClick={copyVerificationURL}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                title="Copy verification URL"
              >
                <Copy className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={cardRef}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
    >
      {/* Header */}
      <div className={`px-8 py-6 relative overflow-hidden ${
        certificate.isValid 
          ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-emerald-50' 
          : 'bg-gradient-to-br from-red-50 to-pink-50'
      }`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-400 to-blue-400 rounded-full translate-y-12 -translate-x-12"></div>
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {certificate.isValid ? (
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Shield className="h-6 w-6 text-emerald-600" />
                  <Sparkles className="h-3 w-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <div>
                  <span className="text-sm font-bold text-emerald-700 uppercase tracking-wide">Verified Certificate</span>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-emerald-600 font-medium">Blockchain Verified</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <XCircle className="h-6 w-6 text-red-600" />
                <div>
                  <span className="text-sm font-bold text-red-700 uppercase tracking-wide">Invalid Certificate</span>
                  <p className="text-xs text-red-600 mt-1">Not verified on blockchain</p>
                </div>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Certificate ID</p>
            <p className="text-lg font-mono font-bold text-gray-900 bg-white/50 px-3 py-1 rounded-lg backdrop-blur-sm">
              #{certificate.tokenId}
            </p>
          </div>
        </div>
      </div>

      {/* Certificate Content */}
      <div className="px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Certificate of Completion
            </h2>
          </div>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 mx-auto rounded-full shadow-lg"></div>
        </div>

        <div className="space-y-6">
          {/* Recipient */}
          <div className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">This certifies that</p>
              <p className="text-2xl font-bold text-gray-900 leading-tight">{certificate.recipientName}</p>
            </div>
          </div>

          {/* Course */}
          <div className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
            <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
              <GraduationCap className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">has successfully completed</p>
              <p className="text-xl font-bold text-gray-900 leading-tight">{certificate.courseName}</p>
            </div>
          </div>

          {/* Institution */}
          <div className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Building className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">issued by</p>
              <p className="text-xl font-bold text-gray-900 leading-tight">{certificate.institutionName}</p>
            </div>
          </div>

          {/* Issue Date */}
          <div className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
            <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">on</p>
              <p className="text-lg font-bold text-gray-900">{formatDate(certificate.issueDate)}</p>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        {certificate.qrCodeURL && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <QrCode className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Verification QR Code</h3>
              </div>
              <button
                onClick={() => setShowQR(!showQR)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                {showQR ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showQR ? 'Hide QR Code' : 'Show QR Code'}</span>
              </button>
            </div>
            
            {showQR && (
              <div className="flex justify-center animate-in fade-in duration-300">
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border-2 border-gray-100 shadow-lg">
                  <img 
                    src={certificate.qrCodeURL} 
                    alt="Certificate QR Code"
                    className="w-40 h-40 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 text-center mt-3 font-medium">
                    Scan to verify certificate
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Blockchain Info */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Blockchain Verification Details</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <p className="font-semibold text-gray-700 uppercase tracking-wide">Recipient Address</p>
                <p className="font-mono text-gray-600 break-all bg-white p-3 rounded-lg border">{certificate.recipient}</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-gray-700 uppercase tracking-wide">Issuer Address</p>
                <p className="font-mono text-gray-600 break-all bg-white p-3 rounded-lg border">{certificate.issuer}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={downloadCertificate}
              disabled={isDownloading}
              className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 disabled:cursor-not-allowed transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Download className="h-5 w-5 group-hover:animate-bounce" />
              <span>{isDownloading ? 'Downloading...' : 'Download Certificate'}</span>
            </button>

            <button
              onClick={shareCertificate}
              className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Share2 className="h-5 w-5 group-hover:animate-pulse" />
              <span>Share Certificate</span>
            </button>

            <button
              onClick={copyVerificationURL}
              className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Copy className="h-5 w-5 group-hover:animate-pulse" />
              <span>Copy Verification URL</span>
            </button>

            {certificate.explorerUrl && (
              <a
                href={certificate.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <ExternalLink className="h-5 w-5 group-hover:animate-pulse" />
                <span>View on Blockchain</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateCard;