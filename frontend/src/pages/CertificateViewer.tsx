import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import CertificateCard, { Certificate } from '../components/CertificateCard';

interface CertificateViewerState {
  certificate: Certificate | null;
  isLoading: boolean;
  error: string | null;
  isVerifying: boolean;
  verificationResult: {
    isValid: boolean;
    onChain: boolean;
    message: string;
  } | null;
}

export default function CertificateViewer() {
  const { tokenId } = useParams<{ tokenId: string }>();
  const navigate = useNavigate();
  
  const [state, setState] = useState<CertificateViewerState>({
    certificate: null,
    isLoading: true,
    error: null,
    isVerifying: false,
    verificationResult: null,
  });

  // Fetch certificate data from blockchain
  const fetchCertificate = async () => {
    if (!tokenId) {
      setState(prev => ({
        ...prev,
        error: 'No certificate ID provided',
        isLoading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/v1/certificates/${tokenId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch certificate');
      }

      if (data.success && data.data.certificate) {
        setState(prev => ({
          ...prev,
          certificate: data.data.certificate,
          isLoading: false,
        }));
      } else {
        throw new Error('Certificate not found');
      }
    } catch (error) {
      console.error('Failed to fetch certificate:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load certificate',
        isLoading: false,
      }));
    }
  };

  // Verify certificate on blockchain
  const verifyCertificate = async () => {
    if (!tokenId) return;

    setState(prev => ({ ...prev, isVerifying: true }));

    try {
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
        setState(prev => ({
          ...prev,
          verificationResult: {
            isValid: data.data.verification.isValid,
            onChain: data.data.verification.onChain,
            message: data.data.verification.message || 'Certificate verified successfully',
          },
          isVerifying: false,
        }));
        
        if (data.data.verification.isValid) {
          toast.success('Certificate verified successfully!');
        } else {
          toast.error('Certificate verification failed');
        }
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setState(prev => ({
        ...prev,
        verificationResult: {
          isValid: false,
          onChain: false,
          message: error instanceof Error ? error.message : 'Verification failed',
        },
        isVerifying: false,
      }));
      toast.error('Failed to verify certificate');
    }
  };

  // Handle certificate download
  const handleDownload = async () => {
    if (!state.certificate) return;

    try {
      // Create a more detailed certificate image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas not supported');
      }

      // Set canvas size for high quality
      canvas.width = 1200;
      canvas.height = 800;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

      // Inner border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

      // Title
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Certificate of Completion', canvas.width / 2, 150);

      // Subtitle
      ctx.fillStyle = '#374151';
      ctx.font = '24px Arial';
      ctx.fillText('This certifies that', canvas.width / 2, 200);

      // Recipient name
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 42px Arial';
      ctx.fillText(state.certificate.recipientName, canvas.width / 2, 280);

      // Achievement text
      ctx.fillStyle = '#374151';
      ctx.font = '28px Arial';
      ctx.fillText('has successfully completed', canvas.width / 2, 340);

      // Course name
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 36px Arial';
      ctx.fillText(state.certificate.courseName, canvas.width / 2, 400);

      // Institution
      ctx.fillStyle = '#374151';
      ctx.font = '24px Arial';
      ctx.fillText(`Issued by: ${state.certificate.institutionName}`, canvas.width / 2, 460);

      // Date
      const issueDate = new Date(state.certificate.issueDate * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      ctx.font = '20px Arial';
      ctx.fillText(`Date: ${issueDate}`, canvas.width / 2, 520);

      // Verification info
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px Arial';
      ctx.fillText('This certificate is verified on the Polygon blockchain', canvas.width / 2, 580);
      
      // Certificate ID
      ctx.font = '14px Arial';
      ctx.fillText(`Certificate ID: ${state.certificate.tokenId}`, canvas.width / 2, 610);
      
      // Issuer address
      const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;
      ctx.fillText(`Issuer: ${formatAddress(state.certificate.issuer)}`, canvas.width / 2, 630);

      // Verification status
      if (state.verificationResult) {
        ctx.fillStyle = state.verificationResult.isValid ? '#059669' : '#dc2626';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(
          state.verificationResult.isValid ? '✓ Verified on Blockchain' : '✗ Verification Failed',
          canvas.width / 2,
          680
        );
      }

      // Footer
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px Arial';
      ctx.fillText('Powered by VerifyCert • Secured on Polygon Blockchain', canvas.width / 2, 750);

      // Download
      const link = document.createElement('a');
      link.download = `certificate-${state.certificate.tokenId}-${state.certificate.recipientName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download certificate');
    }
  };

  // Handle certificate sharing
  const handleShare = async () => {
    if (!state.certificate) return;

    const shareData = {
      title: `Certificate: ${state.certificate.courseName}`,
      text: `${state.certificate.recipientName} has completed ${state.certificate.courseName} from ${state.certificate.institutionName}. Verified on blockchain.`,
      url: state.certificate.verificationURL || window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Certificate shared successfully!');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareData.url || window.location.href);
        toast.success('Certificate link copied to clipboard!');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
        toast.error('Failed to share certificate');
      }
    }
  };

  // Retry loading certificate
  const handleRetry = () => {
    fetchCertificate();
  };

  // Navigate back
  const handleGoBack = () => {
    navigate(-1);
  };

  // Load certificate on mount
  useEffect(() => {
    fetchCertificate();
  }, [tokenId]);

  // Auto-verify certificate when loaded
  useEffect(() => {
    if (state.certificate && !state.verificationResult && !state.isVerifying) {
      verifyCertificate();
    }
  }, [state.certificate]);

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Certificate Viewer
            </h1>
            <p className="text-gray-600">
              Loading certificate #{tokenId}...
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto text-center">
            <svg className="animate-spin mx-auto h-12 w-12 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-600">Fetching certificate data from blockchain...</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Certificate Viewer
            </h1>
            <p className="text-gray-600">
              Certificate #{tokenId}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Certificate Not Found</h3>
            <p className="text-gray-600 mb-6">{state.error}</p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
              <button
                onClick={handleGoBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!state.certificate) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={handleGoBack}
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
              >
                <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Certificate Viewer</h1>
              <p className="mt-1 text-gray-600">
                Certificate #{tokenId} • {state.certificate.institutionName}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={verifyCertificate}
                disabled={state.isVerifying}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {state.isVerifying ? (
                  <>
                    <svg className="animate-spin mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verify
                  </>
                )}
              </button>
              
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </button>
              
              <button
                onClick={handleShare}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        {state.verificationResult && (
          <div className={`mb-6 rounded-lg p-4 ${
            state.verificationResult.isValid 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {state.verificationResult.isValid ? (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  state.verificationResult.isValid ? 'text-green-800' : 'text-red-800'
                }`}>
                  {state.verificationResult.isValid ? 'Certificate Verified' : 'Verification Failed'}
                </h3>
                <p className={`text-sm ${
                  state.verificationResult.isValid ? 'text-green-700' : 'text-red-700'
                }`}>
                  {state.verificationResult.message}
                </p>
                {state.verificationResult.onChain && (
                  <p className="text-xs text-gray-600 mt-1">
                    ✓ Confirmed on Polygon blockchain
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Certificate Display */}
        <div className="mb-8">
          <CertificateCard
            certificate={state.certificate}
            showQR={true}
            isPublicView={false}
            onDownload={handleDownload}
            onShare={handleShare}
          />
        </div>

        {/* Additional Information */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Blockchain Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Blockchain Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Token ID</dt>
                <dd className="text-sm text-gray-900 font-mono">{state.certificate.tokenId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Issuer Address</dt>
                <dd className="text-sm text-gray-900 font-mono break-all">{state.certificate.issuer}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Recipient Address</dt>
                <dd className="text-sm text-gray-900 font-mono break-all">{state.certificate.recipient}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Network</dt>
                <dd className="text-sm text-gray-900">Polygon Mumbai Testnet</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    state.certificate.isValid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {state.certificate.isValid ? 'Valid' : 'Invalid'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Certificate Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Certificate Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
                <dd className="text-sm text-gray-900">
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
                <dt className="text-sm font-medium text-gray-500">Verification URL</dt>
                <dd className="text-sm text-gray-900 break-all">
                  {state.certificate.verificationURL || window.location.href}
                </dd>
              </div>
              {state.certificate.metadataURI && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Metadata URI</dt>
                  <dd className="text-sm text-gray-900 break-all">
                    <a 
                      href={state.certificate.metadataURI} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {state.certificate.metadataURI}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">About This Certificate</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">🔒 Security Features</h4>
              <ul className="space-y-1">
                <li>• Stored immutably on Polygon blockchain</li>
                <li>• Non-transferable NFT technology</li>
                <li>• Cryptographically signed by issuer</li>
                <li>• Tamper-proof verification</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">✅ How to Verify</h4>
              <ul className="space-y-1">
                <li>• Click the "Verify" button above</li>
                <li>• Scan the QR code with any device</li>
                <li>• Check the blockchain directly</li>
                <li>• Share the verification URL</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}