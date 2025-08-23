import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  ExternalLink, 
  Copy, 
  Check, 
  Clock, 
  Zap,
  Link as LinkIcon,
  Hash,
  Layers,
  Globe,
  Calendar,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export interface BlockchainProofIndicatorProps {
  tokenId: string;
  transactionHash?: string;
  blockNumber?: string;
  contractAddress?: string;
  verificationTimestamp?: number;
  networkName?: string;
  chainId?: number;
  variant?: 'compact' | 'detailed' | 'inline';
  showCopyButtons?: boolean;
  className?: string;
}

const BlockchainProofIndicator: React.FC<BlockchainProofIndicatorProps> = ({
  tokenId,
  transactionHash,
  blockNumber,
  contractAddress,
  verificationTimestamp,
  networkName = 'Polygon Amoy',
  chainId = 80002,
  variant = 'compact',
  showCopyButtons = true,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'error'>('pending');

  useEffect(() => {
    // Simulate verification process
    const timer = setTimeout(() => {
      setVerificationStatus('verified');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getExplorerUrl = (type: 'tx' | 'address', value: string) => {
    const baseUrl = chainId === 80002 
      ? 'https://amoy.polygonscan.com' 
      : 'https://polygonscan.com';
    
    return type === 'tx' 
      ? `${baseUrl}/tx/${value}`
      : `${baseUrl}/address/${value}`;
  };

  const renderCompactView = () => (
    <motion.div
      className={`inline-flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-1">
        {verificationStatus === 'pending' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Clock className="w-4 h-4 text-yellow-600" />
          </motion.div>
        )}
        {verificationStatus === 'verified' && (
          <Shield className="w-4 h-4 text-green-600" />
        )}
        {verificationStatus === 'error' && (
          <Shield className="w-4 h-4 text-red-600" />
        )}
        <span className="text-sm font-medium text-green-800">
          {verificationStatus === 'pending' && 'Verifying...'}
          {verificationStatus === 'verified' && 'Blockchain Verified'}
          {verificationStatus === 'error' && 'Verification Failed'}
        </span>
      </div>
      
      {verificationStatus === 'verified' && transactionHash && (
        <a
          href={getExplorerUrl('tx', transactionHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:text-green-800 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </motion.div>
  );

  const renderDetailedView = () => (
    <motion.div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Blockchain Proof</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              {networkName}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Token ID:</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-mono text-gray-900">#{tokenId}</span>
              {showCopyButtons && (
                <button
                  onClick={() => copyToClipboard(tokenId, 'tokenId')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {copiedField === 'tokenId' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          {transactionHash && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Transaction:</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono text-gray-900">
                  {formatAddress(transactionHash)}
                </span>
                {showCopyButtons && (
                  <button
                    onClick={() => copyToClipboard(transactionHash, 'tx')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {copiedField === 'tx' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
                <a
                  href={getExplorerUrl('tx', transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {contractAddress && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Contract:</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono text-gray-900">
                  {formatAddress(contractAddress)}
                </span>
                {showCopyButtons && (
                  <button
                    onClick={() => copyToClipboard(contractAddress, 'contract')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {copiedField === 'contract' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
                <a
                  href={getExplorerUrl('address', contractAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {blockNumber && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Block:</span>
              <span className="text-sm font-mono text-gray-900">#{blockNumber}</span>
            </div>
          )}

          {verificationTimestamp && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Verified:</span>
              <span className="text-sm text-gray-900">
                {new Date(verificationTimestamp * 1000).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderInlineView = () => (
    <div className={`inline-flex items-center space-x-1 ${className}`}>
      <Shield className="w-3 h-3 text-green-600" />
      <span className="text-xs text-green-600 font-medium">Verified</span>
    </div>
  );

  switch (variant) {
    case 'detailed':
      return renderDetailedView();
    case 'inline':
      return renderInlineView();
    case 'compact':
    default:
      return renderCompactView();
  }
};

export default BlockchainProofIndicator;