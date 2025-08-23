import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export interface Certificate {
  tokenId: string;
  recipientName: string;
  courseName: string;
  institutionName: string;
  issueDate: number;
  issuer?: string;
  recipient?: string;
  isValid?: boolean;
  metadataURI?: string;
  qrCodeURL?: string;
  verificationURL?: string;
}

interface CertificateViewerState {
  certificate: Certificate | null;
  isLoading: boolean;
  error: string | null;
  isVerifying: boolean;
  verificationResult: {
    isValid: boolean;
    onChain: boolean;
    message: string;
    verificationTimestamp?: number;
    blockNumber?: string;
    contractAddress?: string;
  } | null;
}

const CertificateViewer: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const navigate = useNavigate();

  const [state, setState] = useState<CertificateViewerState>({
    certificate: null,
    isLoading: true,
    error: null,
    isVerifying: false,
    verificationResult: null,
  });

  const fetchCertificate = useCallback(async () => {
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
      // For demo purposes, create a mock certificate
      if (tokenId === 'demo') {
        const mockCertificate: Certificate = {
          tokenId: 'demo-123',
          recipientName: 'John Doe',
          courseName: 'Blockchain Development Fundamentals',
          institutionName: 'Tech University',
          issueDate: Math.floor(Date.now() / 1000) - 86400, // Yesterday
          isValid: true,
        };

        setTimeout(() => {
          setState(prev => ({
            ...prev,
            certificate: mockCertificate,
            isLoading: false,
          }));
        }, 1000);
        return;
      }

      // Try to fetch from API
      const response = await fetch(`/api/verify-certificate/${tokenId}`);
      const data = await response.json();

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
  }, [tokenId]);

  const verifyCertificate = async () => {
    if (!tokenId) return;

    setState(prev => ({ ...prev, isVerifying: true }));

    try {
      // For demo purposes
      if (tokenId === 'demo') {
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            verificationResult: {
              isValid: true,
              onChain: true,
              message: 'Certificate is valid and verified on blockchain',
              verificationTimestamp: Date.now(),
            },
            isVerifying: false,
          }));
          toast.success('Certificate verified successfully!');
        }, 2000);
        return;
      }

      const response = await fetch(`/api/verify-certificate/${tokenId}`);
      const data = await response.json();

      setState(prev => ({
        ...prev,
        verificationResult: {
          isValid: data.data?.isValid || false,
          onChain: data.data?.exists || false,
          message: data.data?.isValid ? 'Certificate is valid' : 'Certificate is invalid',
          verificationTimestamp: data.data?.verificationTimestamp,
        },
        isVerifying: false,
      }));

      if (data.data?.isValid) {
        toast.success('Certificate verified successfully!');
      } else {
        toast.error('Certificate verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify certificate');
      setState(prev => ({ ...prev, isVerifying: false }));
    }
  };

  useEffect(() => {
    fetchCertificate();
  }, [fetchCertificate]);

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Certificate Not Found</h2>
          <p className="text-gray-600 mb-6">{state.error}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go Home
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        {state.certificate && (
          <div className="space-y-6">
            {/* Certificate Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Certificate of Completion</h1>
                  <p className="text-blue-100">Verified on Blockchain</p>
                </div>
                {state.certificate.isValid !== false && (
                  <div className="flex items-center space-x-2 bg-green-500 px-3 py-1 rounded-full">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* Certificate Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Certificate Details</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Recipient</label>
                    <p className="text-lg font-semibold text-gray-900">{state.certificate.recipientName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Course/Achievement</label>
                    <p className="text-lg font-semibold text-gray-900">{state.certificate.courseName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Institution</label>
                    <p className="text-base text-gray-900">{state.certificate.institutionName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Issue Date</label>
                    <p className="text-base text-gray-900">
                      {new Date(state.certificate.issueDate * 1000).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Certificate ID</label>
                    <p className="text-sm font-mono text-gray-700 bg-gray-100 p-2 rounded">
                      {state.certificate.tokenId}
                    </p>
                  </div>

                  {state.certificate.issuer && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Issuer Address</label>
                      <p className="text-sm font-mono text-gray-700 bg-gray-100 p-2 rounded">
                        {`${state.certificate.issuer.slice(0, 6)}...${state.certificate.issuer.slice(-4)}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Certificate Verification</h3>

              {!state.verificationResult ? (
                <button
                  onClick={verifyCertificate}
                  disabled={state.isVerifying}
                  className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                >
                  {state.isVerifying ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    'Verify Certificate on Blockchain'
                  )}
                </button>
              ) : (
                <div className={`p-4 rounded-lg border ${state.verificationResult.isValid
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
                  }`}>
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 ${state.verificationResult.isValid ? 'text-green-400' : 'text-red-400'
                      }`}>
                      {state.verificationResult.isValid ? (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`font-medium ${state.verificationResult.isValid ? 'text-green-800' : 'text-red-800'
                        }`}>
                        {state.verificationResult.message}
                      </p>
                      {state.verificationResult.verificationTimestamp && (
                        <p className="text-sm text-gray-600 mt-1">
                          Verified on {new Date(state.verificationResult.verificationTimestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateViewer;