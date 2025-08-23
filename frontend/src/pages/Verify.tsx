import React, { useState } from 'react';

export const Verify: React.FC = () => {
  const [certificateId, setCertificateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim()) return;
    
    setLoading(true);
    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResult({
        valid: true,
        certificate: {
          id: certificateId,
          recipientName: 'John Doe',
          courseName: 'Blockchain Development',
          issuerName: 'Tech University',
          issueDate: '2024-01-15'
        }
      });
    } catch (error) {
      setResult({ valid: false, error: 'Certificate not found' });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Verify Certificate</h1>
          <p className="mt-2 text-gray-600">
            Enter a certificate ID to verify its authenticity on the blockchain
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="certificateId" className="block text-sm font-medium text-gray-700 mb-2">
                Certificate ID
              </label>
              <input
                type="text"
                id="certificateId"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter certificate ID..."
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !certificateId.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify Certificate'}
            </button>
          </form>
          
          {loading && (
            <div className="mt-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Checking blockchain...</p>
            </div>
          )}
          
          {result && !loading && (
            <div className="mt-6">
              {result.valid ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg font-medium text-green-800">Certificate Verified</h3>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p><span className="font-medium">Recipient:</span> {result.certificate.recipientName}</p>
                    <p><span className="font-medium">Course:</span> {result.certificate.courseName}</p>
                    <p><span className="font-medium">Issuer:</span> {result.certificate.issuerName}</p>
                    <p><span className="font-medium">Issue Date:</span> {result.certificate.issueDate}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg font-medium text-red-800">Certificate Not Found</h3>
                  </div>
                  <p className="mt-2 text-red-700">{result.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verify;
