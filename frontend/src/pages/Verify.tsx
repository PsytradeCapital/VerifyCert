import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Verify() {
  const navigate = useNavigate();
  const [certificateId, setCertificateId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificateId.trim()) {
      toast.error('Please enter a certificate ID');
      return;
    }

    setIsLoading(true);
    
    try {
      // Navigate to the verification page
      navigate(`/verify/${certificateId.trim()}`);
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('Failed to navigate to verification page');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanQR = () => {
    toast('QR code scanning feature coming soon! For now, please enter the certificate ID manually.');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-8 sm:py-12">
      <div className="container-responsive max-w-md mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Verify Certificate
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-sm mx-auto">
            Enter a certificate ID or scan a QR code to verify authenticity
          </p>
        </div>

        <div className="card-responsive">
          <form className="form-responsive" onSubmit={handleSubmit}>
            <div className="form-group-responsive">
              <label htmlFor="certificateId" className="block text-sm font-medium text-gray-700">
                Certificate ID
              </label>
              <input
                id="certificateId"
                name="certificateId"
                type="text"
                placeholder="Enter certificate ID (e.g., 123)"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                className="input-responsive"
              />
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                The certificate ID can be found on the certificate or in the verification link
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-responsive-lg w-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Verifying...</span>
                </>
              ) : (
                'Verify Certificate'
              )}
            </button>
          </form>

          <div className="space-y-4 sm:space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleScanQR}
              className="btn-responsive w-full bg-white text-gray-500 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="mr-2 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4m-4 0v4m-4-4h2m2-4h.01M8 16h.01M16 8h.01M8 8h.01M4 4h4m0 0V4m0 4H4m0 0v4m0 0h4m0 0v4" />
              </svg>
              <span>Scan QR Code</span>
            </button>
          </div>

          {/* Help Section */}
          <div className="mt-6 sm:mt-8 border-t border-gray-200 pt-4 sm:pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">How to verify:</h3>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 mr-3"></span>
                <span>Enter the certificate ID found on your certificate</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 mr-3"></span>
                <span>Scan the QR code on a physical or digital certificate</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 mr-3"></span>
                <span>Click on a verification link shared by the certificate holder</span>
              </li>
            </ul>
          </div>

          {/* Sample IDs for testing */}
          <div className="mt-4 sm:mt-6 border-t border-gray-200 pt-4 sm:pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Sample Certificate IDs for testing:</h3>
            <div className="space-y-2">
              {['123', '456', '789'].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCertificateId(id)}
                  className="block w-full text-left px-3 py-2 text-xs sm:text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200 hover:border-blue-300 transition-colors touch-target"
                >
                  Certificate #{id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}