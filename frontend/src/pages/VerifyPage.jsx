import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, Search, AlertTriangle, ExternalLink } from 'lucide-react';
import CertificateCard from '../components/CertificateCard.jsx';

const VerifyPage = () => {
  const { tokenId: urlTokenId } = useParams();
  const navigate = useNavigate();
  
  const [tokenId, setTokenId] = useState(urlTokenId || '');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);

  // Auto-verify if tokenId is in URL
  useEffect(() => {
    if (urlTokenId) {
      verifyCertificate(urlTokenId);
    }
  }, [urlTokenId]);

  const verifyCertificate = async (id = tokenId) => {
    if (!id || !id.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError('');
    setCertificate(null);
    setVerificationStatus(null);

    try {
      const response = await fetch(`/api/verify-certificate/${id.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Verification failed');
      }

      if (data.success) {
        setCertificate(data.data.certificate);
        setVerificationStatus({
          isValid: data.data.isValid,
          exists: data.data.exists,
          tokenId: id.trim()
        });

        // Update URL if not already there
        if (!urlTokenId) {
          navigate(`/verify/${id.trim()}`, { replace: true });
        }
      } else {
        throw new Error(data.error || 'Verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message);
      setVerificationStatus({
        isValid: false,
        exists: false,
        tokenId: id.trim()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyCertificate();
  };

  const getStatusIcon = () => {
    if (!verificationStatus) return null;

    if (!verificationStatus.exists) {
      return <XCircle className="h-8 w-8 text-red-500" />;
    }

    if (verificationStatus.isValid) {
      return <CheckCircle className="h-8 w-8 text-green-500" />;
    } else {
      return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getStatusMessage = () => {
    if (!verificationStatus) return null;

    if (!verificationStatus.exists) {
      return {
        title: 'Certificate Not Found',
        message: 'No certificate exists with this ID. Please check the ID and try again.',
        color: 'text-red-600'
      };
    }

    if (verificationStatus.isValid) {
      return {
        title: 'Certificate Valid',
        message: 'This certificate is authentic and has not been revoked.',
        color: 'text-green-600'
      };
    } else {
      return {
        title: 'Certificate Revoked',
        message: 'This certificate exists but has been revoked by the issuer.',
        color: 'text-yellow-600'
      };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-3 mb-4">
            <Shield className="h-10 w-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Certificate Verification</h1>
          </div>
          <p className="text-lg text-gray-600">
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
              <div className="flex space-x-3">
                <input
                  type="text"
                  id="tokenId"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  placeholder="Enter certificate ID (e.g., 1, 2, 3...)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !tokenId.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors duration-200"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Verify</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700 font-medium">Verification Error</p>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* Verification Status */}
        {statusInfo && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center space-x-4 mb-4">
              {getStatusIcon()}
              <div>
                <h2 className={`text-xl font-semibold ${statusInfo.color}`}>
                  {statusInfo.title}
                </h2>
                <p className="text-gray-600">{statusInfo.message}</p>
              </div>
            </div>

            {/* Blockchain Link */}
            {verificationStatus && (
              <div className="pt-4 border-t border-gray-200">
                <a
                  href={`https://amoy.polygonscan.com/token/0x6c9D554C721dA0CEA1b975982eAEe1f924271F50?a=${verificationStatus.tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View on Polygon Amoy Explorer</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Certificate Details */}
        {certificate && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Certificate Details</h2>
            <CertificateCard 
              certificate={certificate} 
              tokenId={verificationStatus.tokenId}
              showActions={false}
            />
          </div>
        )}

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How Certificate Verification Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">1. Enter Certificate ID</h3>
              <p className="text-sm text-gray-600">
                Input the unique certificate ID you want to verify
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">2. Blockchain Verification</h3>
              <p className="text-sm text-gray-600">
                We check the certificate data stored on Polygon Amoy blockchain
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">3. Instant Results</h3>
              <p className="text-sm text-gray-600">
                Get immediate verification of authenticity and validity
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;