import React from 'react';

interface VerificationResultProps {
  isValid: boolean;
  certificateData?: any;
  error?: string;
  className?: string;
}

export const VerificationResult: React.FC<VerificationResultProps> = ({
  isValid,
  certificateData,
  error,
  className = ''
}) => {
  if (error) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center">
          <div className="w-6 h-6 text-red-600 mr-3">❌</div>
          <div>
            <h3 className="text-lg font-medium text-red-800">Verification Failed</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center">
          <div className="w-6 h-6 text-red-600 mr-3">❌</div>
          <div>
            <h3 className="text-lg font-medium text-red-800">Invalid Certificate</h3>
            <p className="text-red-700 mt-1">This certificate could not be verified.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-green-50 border border-green-200 rounded-lg ${className}`}>
      <div className="flex items-start">
        <div className="w-6 h-6 text-green-600 mr-3 mt-1">✅</div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-green-800">Certificate Verified</h3>
          <p className="text-green-700 mt-1">This certificate is valid and authentic.</p>
          
          {certificateData && (
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-green-800">Certificate ID:</span>
                  <p className="text-green-700">{certificateData.id}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-green-800">Recipient:</span>
                  <p className="text-green-700">{certificateData.recipient}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationResult;