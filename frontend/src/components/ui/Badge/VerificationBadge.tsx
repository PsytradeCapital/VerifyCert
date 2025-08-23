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

ult {
  isValid: boolean;
  isRevoked: boolean;
  transactionHash?: ng;
  blockNumber?: string
  timestamp?: number;
}

export interface VerificationBadgeProps {
  tokenId: string;
lean;
  isRevoked?: boolean;
 an;
 
 ;
  onVerificationComplete?: oid;
  className?: string;
}

interface BlockchainProf {
  transactionHash: tring;
;
  timestamp: number;
  networkNg;
  explorerUrl: string;
}

const Verifica({
  tokenId,
  isValid,
  isRevoked = fa
  showD
  size = 'md',
  variant = 'minimal',
  onVerificationComplete,
  className = ''
}) => {
g');
  const [blockchainProof, setBlockchainProof] = );
  const [isExpanded;
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
) {
      if (isRevoked) {
        setVerificationStoked');
 {
        setVerificationSt
      } else {

      }
    } else {
      verifyOnBlockchain();
    }
  }, [isValid, isRevoked, tokenId]);

  const verifyOnBlockchain = async () => {
    setIsVerifying(true);
    setVerificationStatus('pending');

    try {
      // Simulate blockchain verification
      await new Promise(resolve => setTimeout(reso
      
      const mockResult: VerificationResu
        isValid: true,
        isR,
78',
        blockNumber: '12345678',
        timestamp: Date.now() / 1000
      };

      const mockProof: Blockc {
        transactionHash: mock,
        blockNumber: mor!,
        timestamp: mockp!,
        networkName: 'Polygon ',
        explorerUrl: `https://amoy.polygoh}`
      };

      setBlockchainProof(moc
    );
ult);
    } catch (error) {
      console.error(
      setVerif
    } finally {
      setIsVerifying(fe);
    }
  };

  const > {
{
      case 'verified':
        return{
          icon: CheckCircle,
          text: 'Vered',
          color: 'text600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        

      case 'inva
        return {
          icon: XCircle,
          text: 'Invalid',
          color: 'text-re',
          bgColor: 'bg-red-50',
          borderColor: 'bo0',
        st
   };
      case 'revoked':
        return {
          icon: ,
          text: 'Revoked',
          color: 'text-',
          bgColor: 'bg-oran50',
          borderColor: 'border-orange-200',
          badgeVariant: 'warning' as const
        };
      case 'error':
        return {
          icon: XCircle,
          text: 'Error',
          color: 'text-re',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          
        };
      case 'pend
      default:
        return {
          icon: Clock,
          text: 'Verifying...',
          color: 'text-yellow-600',
          
',
          badgeVariant: 
        };
    }
  };

  const statusConfig = ge
  const IconComponent =

  const 
  <Badge
      varian}
      size={size}
      className={className}
      icon={
        verificationSta? (
          <motion.div
      0 }}
    
    >
            <IconComponent className="w-3 h-3" />
          </motion.div>
     (
/>
        )
      }
    >
text}
    </Badge>
  );

  const renderDetailedBadge = () => (
    <motion.div
    

      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}

      <div className="flex iteace-x-2">
        {verding' ? (
          <m.div
            animate={{ rotate: 360 }}
            transit
          >
       } />
          </motion.div>
        ) : (
      
)}
        <span className={`text->
          {s
        </span>
      </div>

      {verificationStatus === 'verified' && bl(
        <div className="flex items-center s>
          <button
         
            clas
          >
            Details
          </button>
          <a
            href={blockchainProof.explorerUrl}
            target="_blank"
            rel="no
            className={`${statusConfig.color} hover:oity`}
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </dv>
      )}
    </motion.div>
  );

  const renderPremiumBadge = () => (
    <div className={`resName}`}>
      <motion.div
        className={`inline-flex items-cente
        initial={{ opacity: 0, y: 10 }}
        anima y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="f">
          <d
            {verificationStatus === 'pending
              <motion.div
                ani0 }}
                transition={{ duration: 1,' }}
              >
             `} />
              </motion.div>
            ) : (
              <IconCo />
            
          </div>
 <div>
            <div className={`text-sm fon
              {statusConf.text}
            </div>
            <div classN>
              Token #{tokenId}
            </div>
          </div>
        </div>

        {verificationStatus === 'verified' && blockchainProof && (
          <div className="flex items-center space-x-2">
            <button
              onClic}

            >
              <Info className="w-3 h-3" />
              <span>Proof</span>
            </button>
            <a
              href={blockchainProof.explorerUrl}
              target="_blank"
              rel="nor"
              className={`${statusConfig.color} hover:opacity-75 transition-opacity`}
            >
              <ExternalLink c>
            </a>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {isExpanded && b (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 mt-2 p-4 
          >
            <div className=t-xs">
              <div class
                <s</span>
                <span className="font-mono">{bloc.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Block:<an>
                <span className="font-mono">#{blockchainProof.blockNumber}</span>
              </div>
              <div class
                <s/span>
                <span>{blockchainProof.networkName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Verified:</span>
                <span>{ne
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

  );

  switch (variant) {
    case 'd':
      returnadge();
    ca

    case 'minimal':
    defaul
      return re;
  }
};

exporge;ationBadt Verifict defaul