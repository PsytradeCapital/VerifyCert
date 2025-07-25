import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Shield, AlertTriangle, ExternalLink, Copy, Check } from 'lucide-react';
import CertificateCard from '../components/CertificateCard';

const VerifyPage = () => {
  const [searchParams] = useSearchParams();
  const [tokenId, setTokenId] = useState(searchParams.get('id') || '');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  const EXPLORER_URL = process.env.REACT_APP_EXPLORER_URL || 'https://amoy.polygonscan.com';

  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setTokenId(idFromUrl);
      handleVerify(idFromUrl);
    }
  }, [searchParams]);

  const handleVerify = async (id = tokenId) => {
    if (!id || !id.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError('');
    setCertificate(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/certificates/verify/${id.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify certificate');
      }

      if (data.success) {
        setCertificate(data.data);
      } else {
        setError(data.error || 'Certificate verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify();
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareUrl = `${window.location.origin}/verify?id=${tokenId}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Certificate Verification
          </h1>
          <p className="text-gray-600">
            Enter a certificate ID to verify its authenticity on the blockchain
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700 mb-2">
                Certificate ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="tokenId"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  placeholder="Enter certificate ID (e.g., 1, 2, 3...)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || !tokenId.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              {loading ? 'Verifying...' : 'Verify Certificate'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Verifying certificate on blockchain...</p>
          </div>
        )}

        {/* Certificate Result */}
        {certificate && (
          <div className="space-y-6">
            {/* Verification Status */}
            <div className={`rounded-lg p-4 ${
              certificate.isValid 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {certificate.isValid ? (
                  <>
                    <Shield className="h-6 w-6 text-green-500 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">
                        Certificate Verified
                      </h3>
                      <p className="text-green-700">
                        This certificate is authentic and has been verified on the blockchain.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-red-800">
                        Certificate Invalid
                      </h3>
                      <p className="text-red-700">
                        This certificate has been revoked or is not valid.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Certificate Details */}
            <CertificateCard 
              certificate={certificate}
              tokenId={tokenId}
              showActions={false}
            />

            {/* Blockchain Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Blockchain Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Network:</span>
                  <span className="font-mono">Polygon Amoy Testnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contract Address:</span>
                  <a
                    href={`${EXPLORER_URL}/address/${certificate.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    {certificate.contractAddress?.slice(0, 10)}...{certificate.contractAddress?.slice(-8)}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Token Standard:</span>
                  <span>ERC-721 (Non-transferable NFT)</span>
                </div>
              </div>
            </div>

            {/* Share Certificate */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Share Certificate
              </h3>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
                />
                <button
                  onClick={() => copyToClipboard(shareUrl)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How Certificate Verification Works
          </h3>
          <div className="space-y-2 text-blue-800">
            <p>• Certificates are stored as non-transferable NFTs on the Polygon blockchain</p>
            <p>• Each certificate has a unique ID that can be used for verification</p>
            <p>• Verification checks the certificate's authenticity and current status</p>
            <p>• Only authorized issuers can create certificates</p>
            <p>• Certificates can be revoked by the issuer or contract owner</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;