import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

const CertificateCard = ({ certificate, showQR = true, isPublicView = false, className = '' }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = () => {
    try {
      window.print();
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: `Certificate: ${certificate.courseName}`,
        text: `${certificate.recipientName} has completed ${certificate.courseName} from ${certificate.institutionName}`,
        url: `${window.location.origin}/verify/${certificate.tokenId}`
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Certificate shared successfully!');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Verification link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
      if (error.name !== 'AbortError') {
        toast.error('Failed to share certificate. Please try again.');
      }
    }
  };

  const getVerificationUrl = () => {
    return `${window.location.origin}/verify/${certificate.tokenId}`;
  };

  if (!certificate) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-4xl mx-auto print:shadow-none print:max-w-full ${className}`}>
      {/* Certificate Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 lg:p-8 print:bg-gray-800">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Certificate of Completion</h1>
          <div className="w-12 sm:w-16 h-1 bg-white mx-auto rounded"></div>
        </div>
      </div>

      {/* Certificate Body */}
      <div className="p-4 sm:p-6 lg:p-8 print:p-6">
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-gray-600 mb-3 sm:mb-4 text-base sm:text-lg">This is to certify that</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 print:text-2xl break-words">
            {certificate.recipientName}
          </h2>
          <p className="text-gray-600 mb-2 text-base sm:text-lg">has successfully completed</p>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-blue-600 mb-4 sm:mb-6 print:text-lg print:text-gray-800 break-words">
            {certificate.courseName}
          </h3>
        </div>

        {/* Certificate Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 print:gap-4">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Institution</label>
              <p className="text-gray-800 font-medium text-base sm:text-lg break-words">{certificate.institutionName}</p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Issue Date</label>
              <p className="text-gray-800 text-sm sm:text-base">{formatDate(certificate.issueDate)}</p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Certificate ID</label>
              <p className="text-gray-800 font-mono text-xs sm:text-sm break-all">#{certificate.tokenId}</p>
            </div>
            {certificate.recipient && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Recipient Address</label>
                <p className="text-gray-800 font-mono text-xs break-all">
                  {certificate.recipient}
                </p>
              </div>
            )}
          </div>

          {showQR && (
            <div className="flex flex-col items-center justify-center print:hidden">
              <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-2">
                Verification QR Code
              </label>
              <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                <QRCodeSVG
                  value={getVerificationUrl()}
                  size={window.innerWidth < 640 ? 100 : 120}
                  level="M"
                  includeMargin={true}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center max-w-32">
                Scan to verify authenticity
              </p>
            </div>
          )}
        </div>

        {/* Verification Status */}
        <div className="flex items-center justify-center mb-6">
          {certificate.isValid ? (
            <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-full">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Verified Certificate</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-full">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Certificate Revoked</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isPublicView && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center print:hidden">
            <button
              onClick={handleDownload}
              className="btn-responsive bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Download certificate"
            >
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="truncate">Download</span>
            </button>
            <button
              onClick={handleShare}
              className="btn-responsive bg-green-600 text-white hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="Share certificate"
            >
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span className="truncate">Share</span>
            </button>
          </div>
        )}

        {/* Verification URL for print */}
        <div className="hidden print:block mt-6 text-center">
          <p className="text-sm text-gray-600">Verify this certificate at:</p>
          <p className="text-sm font-mono break-all">{getVerificationUrl()}</p>
        </div>

        {/* Blockchain Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p className="mb-2">This certificate is secured on the Polygon blockchain</p>
            {certificate.issuer && (
              <p>
                Issuer: <span className="font-mono">{certificate.issuer.slice(0, 6)}...{certificate.issuer.slice(-4)}</span>
              </p>
            )}
            {certificate.metadataURI && (
              <p className="mt-1">
                <a 
                  href={certificate.metadataURI} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  View Metadata
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;