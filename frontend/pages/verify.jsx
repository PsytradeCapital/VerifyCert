import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Loader, ArrowLeft, Share2, Download } from 'lucide-react';
import CertificateCard from '../components/CertificateCard';
import { getBlockchainService } from '../services/blockchainService';

const VerifyPage = () => {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  
  const [certificate, setCertificate] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tokenId) {
      verifyCertificate();
    } else {
      setError('No certificate ID provided');
      setLoading(false);
    }
  }, [tokenId]);

  const verifyCertificate = async () => {
    try {
      setLoading(true);
      setError(null);

      const blockchainService = getBlockchainService();

      // Verify certificate authenticity
      const verification = await blockchainService.verifyCertificate(tokenId);
      setVerificationResult(verification);

      // If verification is successful, get certificate data
      if (verification.onChain) {
        try {
          const certData = await blockchainService.getCertificate(tokenId);
          setCertificate(certData);
        } catch (certError) {
          console.error('Error fetching certificate data:', certError);
          // Keep verification result but show error for certificate data
          setError('Certificate verified on blockchain but unable to fetch details');
        }
      }

    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify certificate');
      setVerificationResult({
        isValid: false,
        onChain: false,
        message: err.message || 'Verification failed',
        verificationTimestamp: Date.now()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Certificate Verification - ${certificate?.recipientName}`,
          text: `Verify this certificate issued by ${certificate?.institutionName}`,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        // You might want to show a toast notification here
        alert('Verification link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleDownload = () => {
    if (certificate) {
      // Create a simple certificate download
      const element = document.createElement('a');
      const certificateText = `
Certificate Verification Report

Certificate ID: ${certificate.tokenId}
Recipient: ${certificate.recipientName}
Course: ${certificate.courseName}
Institution: ${certificate.institutionName}
Issue Date: ${new Date(certificate.issueDate * 1000).toLocaleDateString()}
Status: ${certificate.isValid ? 'Valid' : 'Invalid'}
Verification URL: ${window.location.href}
Verified on: ${new Date().toLocaleString()}

This certificate has been verified on the Polygon Mumbai blockchain.
      `;
      
      const file = new Blob([certificateText], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `certificate-${certificate.tokenId}-verification.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verifying Certificate
          </h2>
          <p className="text-gray-600">
            Checking blockchain for certificate ID: {tokenId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Certificate Verification
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Verification Status */}
        <div className="mb-8">
          <div className={`rounded-lg p-6 border-2 ${
            verificationResult?.isValid 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-3">
              {verificationResult?.isValid ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
              <div>
                <h2 className={`text-xl font-semibold ${
                  verificationResult?.isValid ? 'text-green-800' : 'text-red-800'
                }`}>
                  {verificationResult?.isValid ? 'Certificate Verified' : 'Verification Failed'}
                </h2>
                <p className={`${
                  verificationResult?.isValid ? 'text-green-700' : 'text-red-700'
                }`}>
                  {verificationResult?.message || 'Unknown verification status'}
                </p>
              </div>
            </div>
            
            {verificationResult && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Certificate ID:</span>
                    <p className="font-mono">{tokenId}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Blockchain Status:</span>
                    <p>{verificationResult.onChain ? 'On-chain' : 'Not found'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Verified At:</span>
                    <p>{new Date(verificationResult.verificationTimestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Certificate Details */}
        {certificate ? (
          <div className="mb-8">
            <CertificateCard 
              certificate={certificate}
              showActions={true}
              onDownload={handleDownload}
              onShare={handleShare}
            />
          </div>
        ) : error && (
          <div className="mb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-800">
                    Unable to Load Certificate Details
                  </h3>
                  <p className="text-yellow-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Instructions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            How Certificate Verification Works
          </h3>
          <div className="space-y-3 text-gray-600">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-blue-600">1</span>
              </div>
              <p>
                Each certificate is stored as a non-transferable NFT on the Polygon Mumbai blockchain,
                ensuring immutability and preventing forgery.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-blue-600">2</span>
              </div>
              <p>
                Verification checks the certificate's existence on the blockchain and confirms
                it hasn't been revoked by the issuing institution.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-blue-600">3</span>
              </div>
              <p>
                All certificate data including recipient name, course details, and issue date
                are cryptographically secured and publicly verifiable.
              </p>
            </div>
          </div>
        </div>

        {/* Retry Button */}
        {error && (
          <div className="mt-6 text-center">
            <button
              onClick={verifyCertificate}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry Verification
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPage;