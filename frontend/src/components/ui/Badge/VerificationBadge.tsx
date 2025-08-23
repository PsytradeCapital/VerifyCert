import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ExternalLink,
  Info,
  Zap,
  Link as LinkIcon,
  Eye
} from 'lucide-react';
import { Badge } from './Badge';

export interface VerificationResult {
  isValid: boolean;
  isRevoked: boolean;
  transactionHash?: string;
  blockNumber?: string;
  timestamp?: number;
}

export interface VerificationBadgeProps {
  tokenId: string;
  isValid?: boolean;
  isRevoked?: boolean;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'minimal' | 'detailed' | 'compact';
  onVerificationComplete?: (result: VerificationResult) => void;
  className?: string;
}

interface BlockchainProof {
  transactionHash: string;
  blockNumber: string;
  timestamp: number;
  networkName: string;
  explorerUrl: string;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  tokenId,
  isValid,
  isRevoked = false,
  showDetails = false,
  size = 'md',
  variant = 'minimal',
  onVerificationComplete,
  className = ''
}) => {
  const [verificationState, setVerificationState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [blockchainProof, setBlockchainProof] = useState<BlockchainProof | null>(null);
  const [showProofDetails, setShowProofDetails] = useState(false);

  useEffect(() => {
    if (tokenId && isValid === undefined) {
      verifyToken();
    }
  }, [tokenId]);

  const verifyToken = async () => {
    setVerificationState('loading');
    try {
      // Simulate blockchain verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result: VerificationResult = {
        isValid: true,
        isRevoked: false,
        transactionHash: '0x1234567890abcdef',
        blockNumber: '12345678',
        timestamp: Date.now()
      };

      setVerificationState('success');
      onVerificationComplete?.(result);
    } catch (error) {
      setVerificationState('error');
    }
  };

  const getStatusIcon = () => {
    if (verificationState === 'loading') return <Clock className="w-4 h-4" />;
    if (isRevoked) return <XCircle className="w-4 h-4" />;
    if (isValid) return <CheckCircle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const getStatusColor = () => {
    if (verificationState === 'loading') return 'yellow';
    if (isRevoked) return 'red';
    if (isValid) return 'green';
    return 'red';
  };

  const getStatusText = () => {
    if (verificationState === 'loading') return 'Verifying...';
    if (isRevoked) return 'Revoked';
    if (isValid) return 'Verified';
    return 'Invalid';
  };

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <Badge
        variant={getStatusColor()}
        size={size}
        className="flex items-center space-x-1"
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </Badge>

      {showDetails && blockchainProof && (
        <button
          onClick={() => setShowProofDetails(!showProofDetails)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      )}

      <AnimatePresence>
        {showProofDetails && blockchainProof && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 mt-2 p-4 bg-white border rounded-lg shadow-lg"
          >
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Transaction:</span>
                <span className="ml-2 font-mono text-xs">{blockchainProof.transactionHash}</span>
              </div>
              <div>
                <span className="font-medium">Block:</span>
                <span className="ml-2">{blockchainProof.blockNumber}</span>
              </div>
              <div>
                <span className="font-medium">Network:</span>
                <span className="ml-2">{blockchainProof.networkName}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerificationBadge;