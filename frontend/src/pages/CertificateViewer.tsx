import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    verificationTimestamp?: number;
    transactionHash?: string;
    blockNumber?: string;
    contractAddress?: string;
  } | null;
}

export default function CertificateViewer(): JSX.Element {
  const { tokenId } = useParams<{ tokenId: string }>();
  const navigate = useNavigate();
  
  const [state, setState] = useState<CertificateViewerState>({
    certificate: null,
    isLoading: true,
    error: null,
    isVerifying: false,
    verificationResult: null,
  });

  // Fetch certificate data
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
  }, [tokenId]);

  // Verify certificate
  const verifyCertificate = async () => {
    if (!tokenId) return;

    setState(prev => ({ ...prev, isVerifying: true }));

    try {
      const response = await fetch(`/api/verify-certificate/${tokenId}`);
      const data = await response.json();

      if (data.success) {
        setState(prev => ({
          ...prev,
          verificationResult: {
            isValid: data.data.isValid,
            onChain: data.data.exists,
            message: data.data.isValid ? 'Certificate is valid' : 'Certificate is invalid',
            verificationTimestamp: data.data.verificationTimestamp,
          },
          isVerifying: false,
        }));
        
        if (data.data.isValid) {
          toast.success('Certificate verified successfully!');
        } else {
          toast.error('Certificate verification failed');
        }
      } else {
        throw new Error('Verification failed');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{state.error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <CertificateCard
              certificate={state.certificate}
              onAction={() => {}}
              showActions={false}
            />
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Certificate Verification</h3>
              
              {!state.verificationResult ? (
                <button
                  onClick={verifyCertificate}
                  disabled={state.isVerifying}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {state.isVerifying ? 'Verifying...' : 'Verify Certificate'}
                </button>
              ) : (
                <div className={`p-4 rounded-lg ${state.verificationResult.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${state.verificationResult.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
                      {state.verificationResult.isValid ? (
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${state.verificationResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                        {state.verificationResult.message}
                      </p>
                      {state.verificationResult.verificationTimestamp && (
                        <p className="text-sm text-gray-600 mt-1">
                          Verified on {new Date(state.verificationResult.verificationTimestamp * 1000).toLocaleString()}
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
}