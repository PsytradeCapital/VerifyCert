import React from 'react';
import { AMOY_NETWORK, getBlockExplorerUrl } from '../../config/networks';

interface NetworkDisplayProps {
chainId?: number;
  contractAddress?: string;
  className?: string;

export const NetworkDisplay: React.FC<NetworkDisplayProps> = ({ 
  chainId = AMOY_NETWORK.chainId, 
  contractAddress = AMOY_NETWORK.contractAddress,
  className = ''
}) => {
  const explorerUrl = getBlockExplorerUrl(chainId, 'address', contractAddress);
  const faucetUrl = AMOY_NETWORK.faucetUrl;

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <h3 className="text-sm font-medium text-blue-900">
          {AMOY_NETWORK.displayName}
        </h3>
      </div>
      
      <div className="space-y-2 text-sm text-blue-700">
        <div>
          <span className="font-medium">Chain ID:</span> {chainId}
        </div>
        <div>
          <span className="font-medium">Contract:</span>{' '}
          <a 
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}
          </a>
        </div>
        <div className="flex space-x-4 mt-3">
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors"
          >
            View on Explorer
          </a>
          <a
            href={faucetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded transition-colors"
          >
            Get Test MATIC
          </a>
        </div>
      </div>
    </div>
  );
};
}