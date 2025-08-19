import React from 'react';

const OTPVerificationPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Verify OTP</h2>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
        Enter the verification code sent to your email
      </p>
      <form>
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="Enter OTP"
            className="w-full p-3 border rounded-md text-center text-2xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700">
          Verify
        </button>
      </form>
    </div>
  );
};

export default OTPVerificationPage;