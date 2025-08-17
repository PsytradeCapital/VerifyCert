import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import CertificateCard, { Certificate } from '../components/CertificateCard';
import getBlockchainService, { VerificationResult } from '../services/blockchainService';
import { VerificationResult as VerificationResultComponent } from '../components/ui';
import certificateService from '../services/certificateService';

interface VerificationPageState {
  certificate: Certificate | null;
  isLoading: boolean;
  error: string | null;
  verificationResult: VerificationResult | null;
  networkInfo: {
    name: string;
    chainId: number;
    isCorrectNetwork: boolean;
  } | null;
}

export default function VerificationPage() {
  const { tokenId } = useParams<{ tokenId: string }>();
  const navigate = useNavigate();
  
  const [state, setState] = useState<VerificationPageState>({
    certificate: null,
    isLoading: true,
    error: null,
    verificationResult: null,
    networkInfo: null,
  });

  // Verify certificate on mount
  const verifyCertificate = useCallback(async () => {
    if (!tokenId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get blockchain service instance
      const blockchainService = getBlockchainService();
      
      // Check if blockchain service is configured
      if (!blockchainService.isConfigured()) {
        throw new Error('Blockchain service not properly configured');
      }

      // Get certificate data directly from blockchain
      const certificate = await blockchainService.getCertificate(tokenId);
      
      // Transform CertificateData to Certificate interface for compatibility
      const certificateForDisplay: Certificate = {
        tokenId: certificate.tokenId,
        issuer: certificate.issuer,
        recipient: certificate.recipient,
        recipientName: certificate.recipientName,
        courseName: certificate.courseName,
        institutionName: certificate.institutionName,
        issueDate: certificate.issueDate,
        metadataURI: certificate.metadataURI,
        isValid: certificate.isValid,
        verificationURL: certificate.verificationURL,
        qrCodeURL: certificate.qrCodeURL
      };

      // Verify certificate authenticity on blockchain
      const verificationResult = await blockchainService.verifyCertificate(tokenId);

      // Get network information
      const networkInfo = await blockchainService.getNetworkInfo();

      setState(prev => ({
        ...prev,
        certificate: certificateForDisplay,
        verificationResult,
        networkInfo,
        isLoading: false,
      }));

      if (verificationResult.isValid) {
        toast.success('Certificate verified successfully on blockchain!');
      } else {
        toast.error('Certificate verification failed');
      }

    } catch (error) {
      console.error('Verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify certificate';
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      
      toast.error(errorMessage);
    }
  }, [tokenId]);

  useEffect(() => {
    if (tokenId) {
      verifyCertificate();
    } else {
      setState(prev => ({
        ...prev,
        error: 'No certificate ID provided',
        isLoading: false,
      }));
    }
  }, [tokenId, verifyCertificate]);

  const handleRetry = () => {
    verifyCertificate();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCertificate = async () => {
    if (!state.certificate) return;
    
    try {
      await certificateService.downloadCertificate({
        tokenId: state.certificate.tokenId,
        recipientName: state.certificate.recipientName,
        courseName: state.certificate.courseName,
        institutionName: state.certificate.institutionName,
        issueDate: state.certificate.issueDate,
        issuer: state.certificate.issuer,
        recipient: state.certificate.recipient,
        metadataURI: state.certificate.metadataURI,
        isValid: state.certificate.isValid,
        verificationURL: state.certificate.verificationURL,
        qrCodeURL: state.certificate.qrCodeURL
      });
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download certificate');
    }
  };

  const handleShareCertificate = async () => {
    if (!state.certificate) return;
    
    try {
      await certificateService.shareCertificate({
        tokenId: state.certificate.tokenId,
        recipientName: state.certificate.recipientName,
        courseName: state.certificate.courseName,
        institutionName: state.certificate.institutionName,
        issueDate: state.certificate.issueDate,
        issuer: state.certificate.issuer,
        recipient: state.certificate.recipient,
        metadataURI: state.certificate.metadataURI,
        isValid: state.certificate.isValid,
        verificationURL: state.certificate.verificationURL,
        qrCodeURL: state.certificate.qrCodeURL
      });
      toast.success('Certificate link copied to clipboard!');
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to share certificate');
    }
  };

  const handleViewOnBlockchain = () => {
    if (!state.verificationResult?.transactionHash) return;
    
    // Open blockchain explorer (Polygon Mumbai testnet)
    const explorerUrl = `https://mumbai.polygonscan.com/tx/${state.verificationResult.transactionHash}`;
    window.open(explorerUrl, '_blank', 'noopener,noreferrer');
  };

  // Loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <svg className="animate-spin mx-auto h-12 w-12 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Certificate</h2>
            <p className="text-gray-600 mb-4">
              Checking certificate authenticity on the blockchain...
            </p>
            {tokenId && (
              <div className="text-sm text-gray-500 bg-gray-50 rounded p-2">
                Certificate ID: #{tokenId}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{state.error}</p>
            
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
              <button
                onClick={handleGoHome}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
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

  // Main verification page
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">VerifyCert</h1>
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                Public Verification
              </span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleGoHome}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Home
              </button>
              <button
                onClick={handleGoToDashboard}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Verification Results Display */}
        {state.verificationResult && state.certificate && (
          <div className="mb-8">
            <VerificationResultComponent
              result={{
                isValid: state.verificationResult.isValid,
                isRevoked: false, // Add revocation logic if needed
                onChain: state.verificationResult.onChain,
                verificationDate: state.verificationResult.verificationTimestamp || new Date().toISOString(),
                transactionHash: state.verificationResult.transactionHash,
                blockNumber: state.verificationResult.blockNumber,
                contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
                confidence: state.verificationResult.isValid ? 100 : 0
              }}
              certificate={{
                tokenId: state.certificate.tokenId,
                recipientName: state.certificate.recipientName,
                courseName: state.certificate.courseName,
                institutionName: state.certificate.institutionName,
                issueDate: state.certificate.issueDate,
                issuer: state.certificate.issuer
              }}
              onDownload={() => handleDownloadCertificate()}
              onShare={() => handleShareCertificate()}
              onViewOnBlockchain={() => handleViewOnBlockchain()}
            />
          </div>
        )}

        {/* Certificate Display */}
        {state.certificate ? (
          <div className="space-y-8">
            {/* Certificate Card */}
            <CertificateCard
              certificate={state.certificate}
              showQR={true}
              isPublicView={true}
            />

            {/* Verification Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Verification Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Certificate ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">#{state.certificate.tokenId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Blockchain Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      state.verificationResult?.onChain 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {state.verificationResult?.onChain ? 'Verified on Blockchain' : 'Not Verified'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Issuer Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono break-all">
                    {state.certificate.issuer}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(state.certificate.issueDate * 1000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Recipient</dt>
                  <dd className="mt-1 text-sm text-gray-900">{state.certificate.recipientName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Institution</dt>
                  <dd className="mt-1 text-sm text-gray-900">{state.certificate.institutionName}</dd>
                </div>
                {state.networkInfo && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Network</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        state.networkInfo.isCorrectNetwork 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {state.networkInfo.name} (Chain ID: {state.networkInfo.chainId})
                      </span>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Verification Method</dt>
                  <dd className="mt-1 text-sm text-gray-900">Direct Blockchain Query</dd>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Verify Again
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Certificate
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificate Found</h3>
            <p className="text-gray-600">
              The certificate with ID #{tokenId} could not be found or loaded.
            </p>
          </div>
        )}
      </div>

      {/* Information Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">About Certificate Verification</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">🔒 Security Features</h4>
              <ul className="space-y-1">
                <li>• Immutable blockchain storage</li>
                <li>• Cryptographic verification</li>
                <li>• Non-transferable certificates</li>
                <li>• Tamper-proof validation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">✅ Verification Process</h4>
              <ul className="space-y-1">
                <li>• Certificate data retrieved from blockchain</li>
                <li>• Authenticity confirmed via smart contract</li>
                <li>• Issuer authorization validated</li>
                <li>• Real-time verification status</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Powered by VerifyCert - Blockchain Certificate Verification</p>
            <p className="mt-1">Secured on Polygon Network</p>
          </div>
        </div>
      </footer>
    </div>
  );
}