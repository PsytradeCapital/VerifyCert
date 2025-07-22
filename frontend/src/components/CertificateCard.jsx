import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const CertificateCard = ({ certificate, showQR = true, isPublicView = false }) => {
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = () => {
    // Create a downloadable certificate image/PDF
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: `Certificate: ${certificate.courseName}`,
      text: `${certificate.recipientName} has completed ${certificate.courseName} from ${certificate.institutionName}`,
      url: `${window.location.origin}/verify/${certificate.tokenId}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url);
      alert('Verification link copied to clipboard!');
    }
  };

  if (!certificate) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto">
      {/* Certificate Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Certificate of Completion</h1>
          <div className="w-16 h-1 bg-white mx-auto rounded"></div>
        </div>
      </div>

      {/* Certificate Body */}
      <div className="p-8">
        <div className="text-center mb-8">
          <p className="text-gray-600 mb-4">This is to certify that</p>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {certificate.recipientName}
          </h2>
          <p className="text-gray-600 mb-2">has successfully completed</p>
          <h3 className="text-xl font-semibold text-blue-600 mb-6">
            {certificate.courseName}
          </h3>
        </div>

        {/* Certificate Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Institution</label>
              <p className="text-gray-800 font-medium">{certificate.institutionName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Issue Date</label>
              <p className="text-gray-800">{formatDate(certificate.issueDate)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Certificate ID</label>
              <p className="text-gray-800 font-mono text-sm">#{certificate.tokenId}</p>
            </div>
          </div>

          {showQR && (
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Verification QR Code
              </label>
              <div className="bg-white p-4 rounded-lg border">
                <QRCodeSVG
                  value={`${window.location.origin}/verify/${certificate.tokenId}`}
                  size={120}
                  level="M"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Scan to verify authenticity
              </p>
            </div>
          )}
        </div>

        {/* Verification Status */}
        <div className="flex items-center justify-center mb-6">
          {certificate.isValid ? (
            <div className="flex items-center text-green-600">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Verified Certificate</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Certificate Revoked</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isPublicView && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleDownload}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download
            </button>
            <button
              onClick={handleShare}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share
            </button>
          </div>
        )}

        {/* Blockchain Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>This certificate is secured on the Polygon blockchain</p>
            <p className="mt-1">
              Issuer: <span className="font-mono">{certificate.issuer?.slice(0, 6)}...{certificate.issuer?.slice(-4)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;