import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFeedbackAnimations } from '../hooks/useFeedbackAnimations';

const FeedbackAnimationsDemo: React.FC = () => {
  const feedback = useFeedbackAnimations();

  const handleSuccessBasic = () => {
    feedback.showSuccess('Operation completed successfully!');
  };

  const handleSuccessWithConfetti = () => {
    feedback.showSuccess('Certificate minted successfully!', {
      showConfetti: true,
      position: 'center',
    });
  };

  const handleErrorBasic = () => {
    feedback.showError('Something went wrong. Please try again.');
  };

  const handleErrorWithShake = () => {
    feedback.showError('Transaction failed!', {
      shake: true,
    });
  };

  const handleWarning = () => {
    feedback.showWarning('Please check your network connection.');
  };

  const handleInfo = () => {
    feedback.showInfo('New features are available in the dashboard.');
  };

  const handleLoading = () => {
    const id = feedback.showLoading('Processing your request...');
    
    setTimeout(() => {
      feedback.dismiss(id);
      feedback.showSuccess('Request processed successfully!');
    }, 3000);
  };

  const handleLoadingWithProgress = () => {
    let progress = 0;
    const id = feedback.showLoading('Uploading certificate...', {
      showProgress: true,
      progress: 0,
    });

    const interval = setInterval(() => {
      progress += 10;
      feedback.updateProgress(id, progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          feedback.dismiss(id);
          feedback.showSuccess('Certificate uploaded successfully!', {
            showConfetti: true,
          });
        }, 500);
      }
    }, 300);
  };

  const handleBlockchainSuccess = () => {
    feedback.showBlockchainSuccess(
      'Transaction confirmed!',
      '0x1234567890abcdef1234567890abcdef12345678'
    );
  };

  const handleBlockchainError = () => {
    const mockError = {
      code: 4001,
      message: 'User rejected the transaction'
    };
    feedback.showBlockchainError('Transaction failed', mockError);
  };

  const handleWalletConnection = () => {
    const loadingId = feedback.showWalletConnection(true);
    
    setTimeout(() => {
      feedback.dismiss(loadingId);
      feedback.showWalletConnection(false);
    }, 2000);
  };

  const handleNetworkError = () => {
    feedback.showNetworkError();
  };

  const handleWrongNetwork = () => {
    feedback.showWrongNetwork();
  };

  const handleCertificateOperation = () => {
    const mockPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve('Certificate verified successfully');
        } else {
          reject(new Error('Verification failed'));
        }
      }, 3000);
    });

    feedback.showCertificateOperation('verifying', mockPromise);
  };

  const handleDismissAll = () => {
    feedback.dismissAll();
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Feedback Animations Demo
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Basic Feedback */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Basic Feedback</h3>
            
            <button
              onClick={handleSuccessBasic}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Success
            </button>
            
            <button
              onClick={handleErrorBasic}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Error
            </button>
            
            <button
              onClick={handleWarning}
              className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Warning
            </button>
            
            <button
              onClick={handleInfo}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Info
            </button>
          </div>

          {/* Enhanced Feedback */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Enhanced Feedback</h3>
            
            <button
              onClick={handleSuccessWithConfetti}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Success + Confetti
            </button>
            
            <button
              onClick={handleErrorWithShake}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Error + Shake
            </button>
            
            <button
              onClick={handleLoading}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Loading
            </button>
            
            <button
              onClick={handleLoadingWithProgress}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Loading + Progress
            </button>
          </div>

          {/* Blockchain Feedback */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Blockchain Feedback</h3>
            
            <button
              onClick={handleBlockchainSuccess}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Blockchain Success
            </button>
            
            <button
              onClick={handleBlockchainError}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Blockchain Error
            </button>
            
            <button
              onClick={handleWalletConnection}
              className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Wallet Connection
            </button>
            
            <button
              onClick={handleNetworkError}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Network Error
            </button>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handleWrongNetwork}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Wrong Network
          </button>
          
          <button
            onClick={handleCertificateOperation}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Certificate Operation
          </button>
          
          <button
            onClick={handleDismissAll}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Dismiss All
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Instructions</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Click any button to trigger different types of feedback animations</li>
            <li>• Success animations can include confetti effects for celebrations</li>
            <li>• Error animations can include shake effects for emphasis</li>
            <li>• Loading animations can show progress indicators</li>
            <li>• Blockchain-specific feedback includes transaction links and error handling</li>
            <li>• All animations respect user motion preferences</li>
          </ul>
        </div>

        {/* Animation Features */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Animation Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
            <div>
              <h4 className="font-medium mb-2">Visual Effects</h4>
              <ul className="space-y-1 text-sm">
                <li>• Smooth slide-in animations</li>
                <li>• Scale and fade transitions</li>
                <li>• Confetti particles for success</li>
                <li>• Shake effects for errors</li>
                <li>• Pulse effects for loading</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Interaction Features</h4>
              <ul className="space-y-1 text-sm">
                <li>• Auto-dismiss with configurable timing</li>
                <li>• Manual dismiss with close button</li>
                <li>• Action buttons for additional interactions</li>
                <li>• Progress indicators for long operations</li>
                <li>• Position-based grouping</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FeedbackAnimationsDemo;