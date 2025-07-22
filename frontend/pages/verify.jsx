import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CertificateCard from '../components/CertificateCard';
import toast from 'react-hot-toast';

const Verify = () => {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);

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

      // Call the verification API
      const response = await fetch(`/api/v1/certificates/verify/${tokenId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Verification failed');
      }

      if (data.success) {
        setCertificate(data.data.certificate);
        setVerificationStatus({
          isValid: data.data.isValid,
          verificationTimestamp: data.data.verificationTimestamp,
          blockchainVerified: data.data.blockchainVerified
        });
        
        if (data.data.isValid) {
          toast.success('Certificate verified successfully!');
        } else {
          toast.error('Certificate is invalid or has been revoked');
        }
      } else {
        throw new Error('Certificate verification failed');
      }

    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message);
      toast.error(`Verification failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryVerification = () => {
    verifyCertificate();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Certificate</h2>
            <p className="text-gray-600">
              Checking certificate authenticity on the blockchain...
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Certificate ID: #{tokenId}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            
            <div className="space-y-3">
              <button
                onClick={handleRetryVerification}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Try Again
              </button>
              <button
                onClick={handleGoHome}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Go Home
              </button>
            </div>
            
            {tokenId && (
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                Certificate ID: #{tokenId}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">VerifyCert</h1>
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Verification
              </span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleGoHome}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Home
              </button>
              <button
                onClick={handleGoToDashboard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Status Banner */}
        {verificationStatus && (
          <div className={`mb-8 p-4 rounded-lg border ${
            verificationStatus.isValid 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center">
              {verificationStatus.isValid ? (
                <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <div>
                <h3 className={`font-semibold ${
                  verificationStatus.isValid ? 'text-green-800' : 'text-red-800'
                }`}>
                  {verificationStatus.isValid ? 'Certificate Verified' : 'Certificate Invalid'}
                </h3>
                <p className={`text-sm ${
                  verificationStatus.isValid ? 'text-green-700' : 'text-red-700'
                }`}>
                  {verificationStatus.isValid 
                    ? 'This certificate is authentic and has been verified on the blockchain.'
                    : 'This certificate could not be verified or has been revoked.'
                  }
                </p>
                {verificationStatus.verificationTimestamp && (
                  <p className={`text-xs mt-1 ${
                    verificationStatus.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    Verified on: {new Date(verificationStatus.verificationTimestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Certificate Display */}
        {certificate ? (
          <div className="space-y-6">
            <CertificateCard 
              certificate={certificate} 
              showQR={true} 
              isPublicView={true}
              className="mb-8"
            />
            
            {/* Verification Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-gray-500 font-medium">Certificate ID</label>
                  <p className="text-gray-900 font-mono">#{certificate.tokenId}</p>
                </div>
                <div>
                  <label className="block text-gray-500 font-medium">Blockchain Status</label>
                  <p className={`font-medium ${
                    verificationStatus?.blockchainVerified ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {verificationStatus?.blockchainVerified ? 'Verified on Blockchain' : 'Not Verified'}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-500 font-medium">Issuer Address</label>
                  <p className="text-gray-900 font-mono text-xs break-all">
                    {certificate.issuer}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-500 font-medium">Issue Date</label>
                  <p className="text-gray-900">
                    {new Date(certificate.issueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRetryVerification}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Verify Again
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Certificate
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Certificate Found</h3>
            <p className="text-gray-600">
              The certificate with ID #{tokenId} could not be found or loaded.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Powered by VerifyCert - Blockchain Certificate Verification</p>
            <p className="mt-1">Secured on Polygon Network</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Verify;