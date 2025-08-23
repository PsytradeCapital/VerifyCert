import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, ;
  ExternalLink,;
  Info,;
  Zap,;
  Link as LinkIcon,;
  Eye;
} from 'lucide-react';
import { Badge } from './Badge';
import { getBlockchainService, VerificationResult } from '../../../services/blockchainService';

export interface VerificationBadgeProps {
tokenId: string;
  isValid?: boolean;
  isRevoked?: boolean;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'minimal' | 'detailed' | 'premium';
  onVerificationComplete?: (result: VerificationResult) => void;
  className?: string;

interface BlockchainProof {
}
}
}
  transactionHash?: string;
  blockNumber?: string;
  contractAddress?: string;
  verificationTimestamp: number;
  networkName?: string;
  chainId?: number;

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  tokenId,
  isValid = false,
  isRevoked = false,
  showDetails = false,
  size = 'md',
  variant = 'detailed',
  onVerificationComplete,
  className = ''
}) => {
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [blockchainProof, setBlockchainProof] = useState<BlockchainProof | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showProofDetails, setShowProofDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-verify on mount if tokenId is provided
  useEffect(() => {
    if (tokenId && variant !== 'minimal' && !process.env.NODE_ENV?.includes('test')) {
      handleVerification();
  }, [tokenId, variant]);

  const handleVerification = async () => {
    if (!tokenId) return;

    setIsVerifying(true);
    setError(null);

    try {
      const blockchainService = getBlockchainService();
      const result = await blockchainService.verifyCertificate(tokenId);
      
      setVerificationResult(result);
      
      // Get additional blockchain proof data
      if (result.onChain) {
        const networkInfo = await blockchainService.getNetworkInfo();
        setBlockchainProof({
          transactionHash: result.transactionHash,
          blockNumber: result.blockNumber,
          contractAddress: result.contractAddress,
          verificationTimestamp: result.verificationTimestamp,
          networkName: networkInfo.name,
          chainId: networkInfo.chainId
        });

      if (onVerificationComplete) {
        onVerificationComplete(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      setVerificationResult({
        isValid: false,
        onChain: false,
        message: errorMessage,
        verificationTimestamp: Date.now()
      });
    } finally {
      setIsVerifying(false);
  };

  const getVerificationStatus = () => {
    if (isRevoked) {
      return {
        status: 'revoked',
        icon: XCircle,
        color: 'error',
        label: 'Revoked',
        description: 'This certificate has been revoked'
      };

    if (isVerifying) {
      return {
        status: 'verifying',
        icon: Clock,
        color: 'info',
        label: 'Verifying...',
        description: 'Checking blockchain verification'
      };

    if (error) {
      return {
        status: 'error',
        icon: AlertTriangle,
        color: 'warning',
        label: 'Verification Error',
        description: error
      };

    if (verificationResult) {
      if (verificationResult.isValid && verificationResult.onChain) {
        return {
          status: 'verified',
          icon: Shield,
          color: 'success',
          label: 'Blockchain Verified',
          description: 'Verified on Polygon blockchain'
        };
      } else if (verificationResult.onChain) {
        return {
          status: 'invalid',
          icon: XCircle,
          color: 'error',
          label: 'Invalid',
          description: verificationResult.message
        };
      } else {
        return {
          status: 'not-found',
          icon: AlertTriangle,
          color: 'warning',
          label: 'Not Found',
          description: 'Certificate not found on blockchain'
        };

    // Fallback to props
    if (isValid) {
      return {
        status: 'valid',
        icon: CheckCircle,
        color: 'success',
        label: 'Valid',
        description: 'Certificate is valid'
      };

    return {
      status: 'unknown',
      icon: AlertTriangle,
      color: 'warning',
      label: 'Unknown',
      description: 'Verification status unknown'
    };
  };

  const formatAddress = (address: string) => {
    return ${address.slice(0, 6)}...${address.slice(-4)};
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const openBlockExplorer = (hash: string) => {
    const baseUrl = blockchainProof?.chainId === 80001 
      ? 'https://mumbai.polygonscan.com'
      : 'https://polygonscan.com';
    window.open(${baseUrl}/tx/${hash}, '_blank');
  };

  const verification = getVerificationStatus();
  const IconComponent = verification.icon;

  if (variant === 'minimal') {
    return (
      <Badge
        variant={verification.color as any}
        size={size}
        className={className}
      >
        {verification.label}
      </Badge>
    );

  if (variant === 'detailed') {
    return (
      <div className={space-y-2 ${className}}>
        {/* Main Verification Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }
          animate={{ opacity: 1, scale: 1 }
          className="flex items-center space-x-2"
        >
          <Badge
            variant={verification.color as any}
            size={size}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }
                >
                  <Clock className="h-4 w-4" />
                </motion.div>
              ) : (
                <IconComponent className="h-4 w-4" />
              )
            onClick={showDetails ? () => setShowProofDetails(!showProofDetails) : undefined}
            className={showDetails ? 'cursor-pointer hover:shadow-md' : ''}
          >
            {verification.label}
          </Badge>

          {/* Blockchain Proof Indicator */}
          {verificationResult?.onChain && (
            <motion.div
              initial={{ opacity: 0, x: -10 }
              animate={{ opacity: 1, x: 0 }
              className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200"
            >
              <Zap className="h-3 w-3" />
              <span className="font-medium">On-Chain</span>
            </motion.div>
          )}
          {/* Manual Verification Button */}
          {!isVerifying && !verificationResult && tokenId && (
            <button
              onClick={handleVerification}
              className="text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-full border border-blue-200 transition-colors"
            >
              <Eye className="h-3 w-3 inline mr-1" />
              Verify
            </button>
          )}
        </motion.div>

        {/* Expandable Proof Details */}
        <AnimatePresence>
          {showProofDetails && blockchainProof && (
            <motion.div
              initial={{ opacity: 0, height: 0 }
              animate={{ opacity: 1, height: 'auto' }
              exit={{ opacity: 0, height: 0 }
              className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 space-y-2"
            >
              <div className="flex items-center space-x-2 text-sm font-medium text-neutral-700">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Blockchain Proof</span>
              </div>

              <div className="space-y-2 text-xs">
                {blockchainProof.transactionHash && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Transaction:</span>
                    <button
                      onClick={() => openBlockExplorer(blockchainProof.transactionHash!)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-mono"
                    >
                      <span>{formatAddress(blockchainProof.transactionHash)}</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {blockchainProof.blockNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Block:</span>
                    <span className="font-mono text-neutral-700">#{blockchainProof.blockNumber}</span>
                  </div>
                )}
                {blockchainProof.contractAddress && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Contract:</span>
                    <span className="font-mono text-neutral-700">
                      {formatAddress(blockchainProof.contractAddress)}
                    </span>
                  </div>
                )}
                {blockchainProof.networkName && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Network:</span>
                    <span className="text-neutral-700">
                      {blockchainProof.networkName} ({blockchainProof.chainId})
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Verified:</span>
                  <span className="text-neutral-700">
                    {formatTimestamp(blockchainProof.verificationTimestamp)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Description */}
        {verification.description && (
          <p className="text-xs text-neutral-500">{verification.description}</p>
        )}
      </div>
    );

  // Premium variant with enhanced styling
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }
      animate={{ opacity: 1, y: 0 }
      className={bg-white rounded-xl shadow-soft border border-neutral-200 p-4 ${className}}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={p-2 rounded-lg ${
            verification.color === 'success' ? 'bg-green-100' :
            verification.color === 'error' ? 'bg-red-100' :
            verification.color === 'warning' ? 'bg-yellow-100' :
            'bg-blue-100'
          }}>
            {isVerifying ? (
              <motion.div
                animate={{ rotate: 360 }
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }
              >
                <Clock className={h-5 w-5 ${
                  verification.color === 'success' ? 'text-green-600' :
                  verification.color === 'error' ? 'text-red-600' :
                  verification.color === 'warning' ? 'text-yellow-600' :
                  'text-blue-600'
                }} />
              </motion.div>
            ) : (
              <IconComponent className={h-5 w-5 ${
                verification.color === 'success' ? 'text-green-600' :
                verification.color === 'error' ? 'text-red-600' :
                verification.color === 'warning' ? 'text-yellow-600' :
                'text-blue-600'
              }} />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">{verification.label}</h3>
            <p className="text-sm text-neutral-500">{verification.description}</p>
          </div>
        </div>

        {verificationResult?.onChain && (
          <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
            <Zap className="h-3 w-3" />
            <span className="font-medium">Blockchain</span>
          </div>
        )}
      </div>

      {/* Blockchain Proof Details */}
      {blockchainProof && (
        <div className="space-y-2 pt-3 border-t border-neutral-200">
          <div className="flex items-center space-x-2 text-sm font-medium text-neutral-700">
            <LinkIcon className="h-4 w-4" />
            <span>Blockchain Proof</span>
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs">
            {blockchainProof.transactionHash && (
              <div className="flex items-center justify-between bg-neutral-50 px-2 py-1 rounded">
                <span className="text-neutral-500">Transaction:</span>
                <button
                  onClick={() => openBlockExplorer(blockchainProof.transactionHash!)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-mono"
                >
                  <span>{formatAddress(blockchainProof.transactionHash)}</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            )}
            {blockchainProof.blockNumber && (
              <div className="flex items-center justify-between bg-neutral-50 px-2 py-1 rounded">
                <span className="text-neutral-500">Block Number:</span>
                <span className="font-mono text-neutral-700">#{blockchainProof.blockNumber}</span>
              </div>
            )}
            <div className="flex items-center justify-between bg-neutral-50 px-2 py-1 rounded">
              <span className="text-neutral-500">Verified:</span>
              <span className="text-neutral-700">
                {formatTimestamp(blockchainProof.verificationTimestamp)}
              </span>
            </div>
          </div>
        </div>
      )}
      {/* Manual Verification */}
      {!isVerifying && !verificationResult && tokenId && (
        <div className="pt-3 border-t border-neutral-200">
          <button
            onClick={handleVerification}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>Verify on Blockchain</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default VerificationBadge;
}
}