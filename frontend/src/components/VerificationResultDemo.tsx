import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { VerificationResult, Card, Button } from './ui';

const VerificationResultDemo: React.FC = () => {
  const [currentDemo, setCurrentDemo] = useState<'valid' | 'revoked' | 'pending' | 'invalid'>('valid');

  const mockCertificate = {
    tokenId: '12345',
    recipientName: 'John Doe',
    courseName: 'Advanced Web Development Certification',
    institutionName: 'Tech University',
    issueDate: 1640995200, // Jan 1, 2022
    issuer: '0x1234567890abcdef1234567890abcdef12345678'
  };

  const demoResults = {
    valid: {
      isValid: true,
      isRevoked: false,
      onChain: true,
      verificationDate: new Date().toISOString(),
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      blockNumber: '12345678',
      contractAddress: '0x9876543210fedcba9876543210fedcba98765432',
      confidence: 100
    },
    revoked: {
      isValid: false,
      isRevoked: true,
      onChain: true,
      verificationDate: new Date().toISOString(),
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      blockNumber: '12345678',
      contractAddress: '0x9876543210fedcba9876543210fedcba98765432',
      confidence: 0
    },
    pending: {
      isValid: true,
      isRevoked: false,
      onChain: false,
      verificationDate: new Date().toISOString(),
      confidence: 75
    },
    invalid: {
      isValid: false,
      isRevoked: false,
      onChain: false,
      verificationDate: new Date().toISOString(),
      confidence: 0
    }
  };

  const handleDownload = () => {
    console.log('Download certificate');
  };

  const handleShare = () => {
    console.log('Share certificate');
  };

  const handleViewOnBlockchain = () => {
    console.log('View on blockchain');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Enhanced Verification Results Display
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Redesigned verification results with better visual feedback, animations, and comprehensive information presentation.
        </p>
      </div>

      {/* Demo Controls */}
      <Card variant="outlined" padding="md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Demo Controls</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={currentDemo === 'valid' ? 'primary' : 'secondary'}
            onClick={() => setCurrentDemo('valid')}
            size="md"
          >
            Valid Certificate
          </Button>
          <Button
            variant={currentDemo === 'revoked' ? 'primary' : 'secondary'}
            onClick={() => setCurrentDemo('revoked')}
            size="md"
          >
            Revoked Certificate
          </Button>
          <Button
            variant={currentDemo === 'pending' ? 'primary' : 'secondary'}
            onClick={() => setCurrentDemo('pending')}
            size="md"
          >
            Pending Verification
          </Button>
          <Button
            variant={currentDemo === 'invalid' ? 'primary' : 'secondary'}
            onClick={() => setCurrentDemo('invalid')}
            size="md"
          >
            Invalid Certificate
          </Button>
        </div>
      </Card>

      {/* Enhanced Verification Result Display */}
      <motion.div
        key={currentDemo}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VerificationResult
          result={demoResults[currentDemo]}
          certificate={currentDemo !== 'invalid' ? mockCertificate : undefined}
          onDownload={handleDownload}
          onShare={handleShare}
          onViewOnBlockchain={demoResults[currentDemo].onChain ? handleViewOnBlockchain : undefined}
        />
      </motion.div>

      {/* Features Showcase */}
      <Card variant="outlined" padding="lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Enhanced Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Visual Improvements</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Enhanced status indicators with color-coded badges</li>
              <li>• Confidence score visualization with animated progress bars</li>
              <li>• Improved visual hierarchy and information organization</li>
              <li>• Professional card-based layout with proper spacing</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Interactive Features</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• One-click transaction hash copying</li>
              <li>• Direct blockchain explorer links</li>
              <li>• Enhanced download and sharing options</li>
              <li>• Responsive design for all screen sizes</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Animations & Feedback</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Smooth entrance animations with staggered timing</li>
              <li>• Success celebrations with confetti effects</li>
              <li>• Error feedback with shake animations</li>
              <li>• Loading states with progress indicators</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Information Display</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Comprehensive certificate details section</li>
              <li>• Detailed blockchain verification information</li>
              <li>• Clear verification timestamps and metadata</li>
              <li>• Organized layout with proper information hierarchy</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VerificationResultDemo;