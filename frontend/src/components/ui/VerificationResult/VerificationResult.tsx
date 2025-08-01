import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Shield, 
  Clock,
  ExternalLink,
  Download,
  Share2,
  Copy,
  Eye,
  Zap
} from 'lucide-react';
import { Card, Button, Badge } from '../';
import { SuccessAnimation, ErrorAnimation } from '../Feedback/FeedbackAnimations';

export interface VerificationResultProps {
  result: {
    isValid: boolean;
    isRevoked: boolean;
    onChain: boolean;
    verificationDate: string;
    transactionHash?: string;
    blockNumber?: string;
    contractAddress?: string;
    confidence?: number;
  };
  certificate?: {
    tokenId: string;
    recipientName: string;
    courseName: string;
    institutionName: string;
    issueDate: number;
    issuer: string;
  };
  onDownload?: () => void;
  onShare?: () => void;
  onViewOnBlockchain?: () => void;
  className?: string;
}

const VerificationResult: React.FC<VerificationResultProps> = ({
  result,
  certificate,
  onDownload,
  onShare,
  onViewOnBlockchain,
  className = ''
}) => {
  const [showSuccessAnimation, setShowSuccessAnimation] = React.useState(false);
  const [showErrorAnimation, setShowErrorAnimation] = React.useState(false);
  const [copiedHash, setCopiedHash] = React.useState(false);

  React.useEffect(() => {
    if (result.isValid && !result.isRevoked) {
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 3000);
    } else if (result.isRevoked || !result.isValid) {
      setShowErrorAnimation(true);
      setTimeout(() => setShowErrorAnimation(false), 3000);
    }
  }, [result.isValid, result.isRevoked]);

  const getVerificationStatus = () => {
    if (result.isRevoked) {
      return {
        type: 'revoked' as const,
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        badgeVariant: 'error' as const,
        title: 'Certificate Revoked',
        subtitle: 'This certificate has been revoked and is no longer valid',
        description: 'The issuing institution has invalidated this certificate. It should not be considered as proof of achievement.',
        confidence: 0
      };
    }
    
    if (result.isValid && result.onChain) {
      return {
        type: 'valid' as const,
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        badgeVariant: 'success' as const,
        title: 'Certificate Verified',
        subtitle: 'Authentic certificate verified on blockchain',
        description: 'This certificate is genuine and has been cryptographically verified on the Polygon blockchain.',
        confidence: result.confidence || 100
      };
    }
    
    if (result.isValid && !result.onChain) {
      return {
        type: 'pending' as const,
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        badgeVariant: 'warning' as const,
        title: 'Verification Pending',
        subtitle: 'Certificate found but blockchain verification pending',
        description: 'The certificate exists in our database but blockchain verification is still in progress.',
        confidence: result.confidence || 75
      };
    }

    return {
      type: 'invalid' as const,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      badgeVariant: 'error' as const,
      title: 'Invalid Certificate',
      subtitle: 'Certificate could not be verified',
      description: 'This certificate could not be found or verified in our system.',
      confidence: 0
    };
  };

  const status = getVerificationStatus();

  const copyTransactionHash = async () => {
    if (result.transactionHash) {
      await navigator.clipboard.writeText(result.transactionHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const ConfidenceBar = ({ confidence }: { confidence: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${
          confidence >= 80 ? 'bg-green-500' :
          confidence >= 60 ? 'bg-yellow-500' :
          'bg-red-500'
        }`}
        initial={{ width: 0 }}
        animate={{ width: `${confidence}%` }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
      />
    </div>
  );

  return (
    <>
      <motion.div
        className={`space-y-6 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Main Verification Status */}
        <Card
          variant="elevated"
          padding="lg"
          className={`${status.bgColor} ${status.borderColor} border-2`}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <motion.div
                  className={`p-3 rounded-full ${status.bgColor}`}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    delay: 0.2 
                  }}
                >
                  <status.icon className={`w-8 h-8 ${status.color}`} />
                </motion.div>
                
                <div>
                  <motion.h2
                    className={`text-2xl font-bold ${status.color}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {status.title}
                  </motion.h2>
                  <motion.p
                    className="text-gray-700 text-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {status.subtitle}
                  </motion.p>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Badge
                  variant={status.badgeVariant}
                  size="lg"
                  className="text-sm font-semibold"
                >
                  {status.type.toUpperCase()}
                </Badge>
              </motion.div>
            </div>

            <motion.p
              className="text-gray-600 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {status.description}
            </motion.p>

            {/* Confidence Score */}
            {status.confidence > 0 && (
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Verification Confidence
                  </span>
                  <span className={`text-sm font-bold ${status.color}`}>
                    {status.confidence}%
                  </span>
                </div>
                <ConfidenceBar confidence={status.confidence} />
              </motion.div>
            )}

            {/* Verification Details */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div>
                <span className="text-gray-500">Verified On:</span>
                <p className="font-medium text-gray-900">
                  {new Date(result.verificationDate).toLocaleString()}
                </p>
              </div>
              
              {result.onChain && (
                <div>
                  <span className="text-gray-500">Blockchain Status:</span>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-700">On-Chain Verified</span>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </Card>

        {/* Certificate Details */}
        {certificate && (
          <Card variant="outlined" padding="lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-blue-600" />
                Certificate Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Course Name</label>
                    <p className="text-lg font-semibold text-gray-900">{certificate.courseName}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Recipient</label>
                    <p className="text-lg font-semibold text-gray-900">{certificate.recipientName}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Institution</label>
                    <p className="text-lg font-semibold text-gray-900">{certificate.institutionName}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Issue Date</label>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(certificate.issueDate)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </Card>
        )}

        {/* Blockchain Information */}
        {result.onChain && (
          <Card variant="outlined" padding="lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-purple-600" />
                Blockchain Verification
              </h3>
              
              <div className="space-y-4">
                {result.transactionHash && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Transaction Hash</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="flex-1 text-sm bg-gray-100 p-2 rounded font-mono break-all">
                        {result.transactionHash}
                      </code>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={copyTransactionHash}
                        icon={<Copy className="w-4 h-4" />}
                        className={copiedHash ? 'bg-green-100 text-green-700' : ''}
                      >
                        {copiedHash ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.blockNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Block Number</label>
                      <p className="font-mono text-sm text-gray-900">{result.blockNumber}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Network</label>
                    <p className="text-sm text-gray-900">Polygon Mumbai Testnet</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </Card>
        )}

        {/* Action Buttons */}
        <motion.div
          className="flex flex-wrap gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          {onDownload && (
            <Button
              variant="primary"
              size="lg"
              onClick={onDownload}
              icon={<Download className="w-5 h-5" />}
              className="flex-1 sm:flex-none"
            >
              Download Certificate
            </Button>
          )}
          
          {onShare && (
            <Button
              variant="secondary"
              size="lg"
              onClick={onShare}
              icon={<Share2 className="w-5 h-5" />}
              className="flex-1 sm:flex-none"
            >
              Share
            </Button>
          )}
          
          {result.transactionHash && onViewOnBlockchain && (
            <Button
              variant="secondary"
              size="lg"
              onClick={onViewOnBlockchain}
              icon={<ExternalLink className="w-5 h-5" />}
              className="flex-1 sm:flex-none"
            >
              View on Blockchain
            </Button>
          )}
        </motion.div>
      </motion.div>

      {/* Success/Error Animations */}
      <SuccessAnimation
        message="Certificate successfully verified!"
        isVisible={showSuccessAnimation}
        onClose={() => setShowSuccessAnimation(false)}
        showConfetti={true}
      />
      
      <ErrorAnimation
        message={result.isRevoked ? "Certificate has been revoked" : "Certificate verification failed"}
        isVisible={showErrorAnimation}
        onClose={() => setShowErrorAnimation(false)}
        shake={true}
      />
    </>
  );
};

export default VerificationResult;