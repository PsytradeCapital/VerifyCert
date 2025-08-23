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
  Calendar,;
  Info,;;
  ChevronDown,;;
  ChevronUp;;
} from 'lucide-react';
import { getBlockchainService } from '../../../services/blockchainService';

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
  autoExpand?: boolean;
  className?: string;

const BlockchainProofIndicator: React.FC<BlockchainProofIndicatorProps> = ({
  tokenId,
  transactionHash,
  blockNumber,
  contractAddress,
  verificationTimestamp,
  networkName,
  chainId,
  variant = 'detailed',
  showCopyButtons = true,
  autoExpand = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(autoExpand);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [proofData, setProofData] = useState({
    transactionHash,
    blockNumber,
    contractAddress,
    verificationTimestamp,
    networkName,
    chainId
  });

  // Auto-fetch proof data if not provided
  useEffect(() => {
    if (tokenId && !transactionHash && !blockNumber) {
      fetchProofData();
  }, [tokenId]);

  const fetchProofData = async () => {
    if (!tokenId) return;

    setIsLoading(true);
    try {
      const blockchainService = getBlockchainService();
      const result = await blockchainService.verifyCertificate(tokenId);
      const networkInfo = await blockchainService.getNetworkInfo();

      setProofData({
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        contractAddress: result.contractAddress,
        verificationTimestamp: result.verificationTimestamp,
        networkName: networkInfo.name,
        chainId: networkInfo.chainId
      });
    } catch (error) {
      console.error('Failed to fetch proof data:', error);
    } finally {
      setIsLoading(false);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatFullAddress = (address: string) => {
    return address;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getBlockExplorerUrl = (type: 'tx' | 'address', value: string) => {
    const baseUrl = proofData.chainId === 80001 
      ? 'https://mumbai.polygonscan.com'
      : 'https://polygonscan.com';
    
    return type === 'tx' 
      ? `${baseUrl}/tx/${value}`
      : `${baseUrl}/address/${value}`;
  };

  const openInExplorer = (type: 'tx' | 'address', value: string) => {
    window.open(getBlockExplorerUrl(type, value), '_blank');
  };

  const CopyButton: React.FC<{ text: string; field: string; size?: 'sm' | 'md' }> = ({ 
    text, 
    field, 
    size = 'sm' 
  }) => (
    <button
      onClick={() => copyToClipboard(text, field)}
      className={`text-neutral-400 hover:text-neutral-600 transition-colors ${
        size === 'sm' ? 'p-1' : 'p-1.5'
      }`}
      title={`Copy ${field}`}
    >
      {copiedField === field ? (
        <Check className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} text-green-500`} />
      ) : (
        <Copy className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`} />
      )}
    </button>
  );

  const ExplorerButton: React.FC<{ type: 'tx' | 'address'; value: string; size?: 'sm' | 'md' }> = ({ 
    type, 
    value, 
    size = 'sm' 
  }) => (
    <button
      onClick={() => openInExplorer(type, value)}
      className={`text-blue-500 hover:text-blue-600 transition-colors ${
        size === 'sm' ? 'p-1' : 'p-1.5'
      }`}
      title="View on block explorer"
    >
      <ExternalLink className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`} />
    </button>
  );

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 text-sm text-neutral-500 ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Clock className="h-4 w-4" />
        </motion.div>
        <span>Loading blockchain proof...</span>
      </div>
    );

  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
          <Shield className="h-3 w-3" />
          <span className="font-medium">Blockchain Verified</span>
        </div>
        
        {proofData.transactionHash && (
          <div className="flex items-center space-x-1">
            <span className="text-xs text-neutral-500">Tx:</span>
            <code className="text-xs font-mono text-neutral-700">
              {formatAddress(proofData.transactionHash)}
            </code>
            {showCopyButtons && (
              <CopyButton text={proofData.transactionHash} field="transaction" />
            )}
            <ExplorerButton type="tx" value={proofData.transactionHash} />
          </div>
        )}
      </div>
    );

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-green-50 border border-green-200 rounded-lg p-3 ${className}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Blockchain Verified</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
            <Zap className="h-3 w-3" />
            <span>On-Chain</span>
          </div>
        </div>

        {proofData.transactionHash && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-600">Transaction:</span>
            <div className="flex items-center space-x-1">
              <code className="font-mono text-green-700">
                {formatAddress(proofData.transactionHash)}
              </code>
              {showCopyButtons && (
                <CopyButton text={proofData.transactionHash} field="transaction" />
              )}
              <ExplorerButton type="tx" value={proofData.transactionHash} />
            </div>
          </div>
        )}
      </motion.div>
    );

  // Detailed variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border border-neutral-200 rounded-lg shadow-sm ${className}`}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">Blockchain Proof</h3>
            <p className="text-sm text-neutral-500">Verified on Polygon network</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
            <Zap className="h-3 w-3" />
            <span className="font-medium">On-Chain</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-neutral-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          )}
        </div>
      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-neutral-200"
          >
            <div className="p-4 space-y-4">
              {/* Transaction Hash */}
              {proofData.transactionHash && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-700">Transaction Hash</span>
                  </div>
                  <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-lg">
                    <code className="text-sm font-mono text-neutral-800 break-all">
                      {proofData.transactionHash}
                    </code>
                    <div className="flex items-center space-x-1 ml-2">
                      {showCopyButtons && (
                        <CopyButton text={proofData.transactionHash} field="transaction" size="default" />
                      )}
                      <ExplorerButton type="tx" value={proofData.transactionHash} size="default" />
                    </div>
                  </div>
                </div>
              )}

              {/* Block Number */}
              {proofData.blockNumber && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Layers className="h-4 w-4 text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-700">Block Number</span>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <code className="text-sm font-mono text-neutral-800">
                      #{proofData.blockNumber}
                    </code>
                  </div>
                </div>
              )}

              {/* Contract Address */}
              {proofData.contractAddress && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <LinkIcon className="h-4 w-4 text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-700">Contract Address</span>
                  </div>
                  <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-lg">
                    <code className="text-sm font-mono text-neutral-800 break-all">
                      {proofData.contractAddress}
                    </code>
                    <div className="flex items-center space-x-1 ml-2">
                      {showCopyButtons && (
                        <CopyButton text={proofData.contractAddress} field="contract" size="default" />
                      )}
                      <ExplorerButton type="address" value={proofData.contractAddress} size="default" />
                    </div>
                  </div>
                </div>
              )}

              {/* Network Info */}
              {proofData.networkName && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-700">Network</span>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <span className="text-sm text-neutral-800">
                      {proofData.networkName} {proofData.chainId && `(Chain ID: ${proofData.chainId})`}
                    </span>
                  </div>
                </div>
              )}

              {/* Verification Timestamp */}
              {proofData.verificationTimestamp && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-700">Verified On</span>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <span className="text-sm text-neutral-800">
                      {formatTimestamp(proofData.verificationTimestamp)}
                    </span>
                  </div>
                </div>
              )}

              {/* Info Note */}
              <div className="flex items-start space-x-2 bg-blue-50 p-3 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Blockchain Verification</p>
                  <p>This certificate is permanently recorded on the Polygon blockchain, ensuring its authenticity and preventing tampering.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BlockchainProofIndicator;
}}}}}}}