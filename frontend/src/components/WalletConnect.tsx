import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { generateAriaId } from '../utils/ariaUtils';

interface WalletConnectProps {
  onConnect?: (address: string, provider: ethers.BrowserProvider) => void;
  onDisconnect?: () => void;
  requiredNetwork?: string;
  className?: string;

interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;
  isConnecting: boolean;
  networkName: string | null;
  hasShownSuccessMessage: boolean;

const POLYGON_AMOY_CHAIN_ID = '0x13882'; // 80002 in hex
const POLYGON_AMOY_CONFIG = {
  chainId: POLYGON_AMOY_CHAIN_ID,
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc-amoy.polygon.technology/'],
  blockExplorerUrls: ['https://amoy.polygonscan.com/'],
};

export default function WalletConnect({
  onConnect,
  onDisconnect,
  requiredNetwork = 'polygon-amoy',
  className = '',
}: WalletConnectProps) {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    provider: null,
    isConnecting: false,
    networkName: null,
    hasShownSuccessMessage: false,
  });

  // Debounce success messages and track connection state
  const lastSuccessMessageTime = React.useRef<number>(0);
  const connectionAttemptId = React.useRef<string>('');
  const isInitialMount = React.useRef<boolean>(true);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';
  }, []);

  // Get network name from chain ID
  const getNetworkName = useCallback((chainId: string) => {
    switch (chainId) {
      case '0x1':
        return 'Ethereum Mainnet';
      case '0x89':
        return 'Polygon Mainnet';
      case '0x13881':
        return 'Polygon Mumbai';
      case '0x13882':
        return 'Polygon Amoy';
      case '0x5':
        return 'Goerli Testnet';
      default:
        return 'Unknown Network';
  }, []);

  // Switch to Polygon Amoy network
  const switchToPolygonAmoy = useCallback(async () => {
    if (!(window as any).ethereum) return false;

    try {
      // Try to switch to the network
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_AMOY_CHAIN_ID }],
      });
      return true;
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [POLYGON_AMOY_CONFIG],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add Polygon Amoy network:', addError);
          toast.error('Failed to add Polygon Amoy network');
          return false;
      } else {
        console.error('Failed to switch to Polygon Amoy:', switchError);
        toast.error('Failed to switch to Polygon Amoy network');
        return false;
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      window.open('https://metamask.io/download/', '_blank');
      return;

    // Generate unique connection attempt ID
    const attemptId = Date.now().toString();
    connectionAttemptId.current = attemptId;
    
    setWalletState(prev => ({ ...prev, isConnecting: true }));

    try {
      // Request account access
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const network = await provider.getNetwork();
      const chainId = `0x${network.chainId.toString(16)}`;
      const networkName = getNetworkName(chainId);

      // Check if we need to switch to Polygon Amoy
      if (requiredNetwork === 'polygon-amoy' && chainId !== POLYGON_AMOY_CHAIN_ID) {
        const switched = await switchToPolygonAmoy();
        if (!switched) {
          setWalletState(prev => ({ ...prev, isConnecting: false }));
          return;
        // Refresh network info after switching
        const newNetwork = await provider.getNetwork();
        const newChainId = `0x${newNetwork.chainId.toString(16)}`;
        const newNetworkName = getNetworkName(newChainId);
        
        setWalletState({
          isConnected: true,
          address: accounts[0],
          provider,
          isConnecting: false,
          networkName: newNetworkName,
          hasShownSuccessMessage: false,
        });
      } else {
        setWalletState({
          isConnected: true,
          address: accounts[0],
          provider,
          isConnecting: false,
          networkName,
          hasShownSuccessMessage: false,
        });

      onConnect?.(accounts[0], provider);
      
      // Only show success message for user-initiated connections (not initial checks)
      const now = Date.now();
      const isUserInitiated = connectionAttemptId.current === attemptId;
      const hasRecentMessage = (now - lastSuccessMessageTime.current) < 10000; // 10 second cooldown
      
      if (!walletState.isConnected && !walletState.hasShownSuccessMessage && 
          isUserInitiated && !isInitialMount.current && !hasRecentMessage) {
        toast.success('Wallet connected successfully!');
        setWalletState(prev => ({ ...prev, hasShownSuccessMessage: true }));
        lastSuccessMessageTime.current = now;
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      setWalletState(prev => ({ ...prev, isConnecting: false }));
      
      if (error.code === 4001) {
        toast.error('Connection rejected by user');
      } else {
        toast.error('Failed to connect wallet');
  }, [isMetaMaskInstalled, getNetworkName, requiredNetwork, switchToPolygonAmoy, onConnect]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      provider: null,
      isConnecting: false,
      networkName: null,
      hasShownSuccessMessage: false, // Reset the flag on disconnect
    });
    onDisconnect?.();
    toast.success('Wallet disconnected');
  }, [onDisconnect]);

  // Handle account changes
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else if (accounts[0] !== walletState.address) {
      setWalletState(prev => ({ 
        ...prev, 
        address: accounts[0],
        // Don't reset success message flag for account changes
      }));
      if (walletState.provider) {
        onConnect?.(accounts[0], walletState.provider);
        // Never show success message for account changes
  }, [disconnectWallet, walletState.address, walletState.provider, onConnect]);

  // Handle network changes
  const handleChainChanged = useCallback(async (chainId: string) => {
    const networkName = getNetworkName(chainId);
    setWalletState(prev => ({ ...prev, networkName }));
    
    // If required network is polygon-amoy and we're not on it, show warning
    if (requiredNetwork === 'polygon-amoy' && chainId !== POLYGON_AMOY_CHAIN_ID) {
      toast.error('Please switch to Polygon Amoy network');
  }, [getNetworkName, requiredNetwork]);

  // Set up event listeners
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
    (window as any).ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if ((window as any).ethereum?.removeListener) {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
        (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [isMetaMaskInstalled, handleAccountsChanged, handleChainChanged]);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskInstalled()) return;

      try {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const network = await provider.getNetwork();
          const chainId = `0x${network.chainId.toString(16)}`;
          const networkName = getNetworkName(chainId);

          setWalletState({
            isConnected: true,
            address: accounts[0],
            provider,
            isConnecting: false,
            networkName,
            hasShownSuccessMessage: true, // Mark as already shown for initial connection
          });

          // Only call onConnect for initial connection check, don't show success message
          onConnect?.(accounts[0], provider);
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
      } finally {
        // Mark initial mount as complete
        setTimeout(() => {
          isInitialMount.current = false;
        }, 1000);
    };

    checkConnection();
  }, [isMetaMaskInstalled, getNetworkName, onConnect]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const warningId = generateAriaId('metamask-warning');

  if (!isMetaMaskInstalled()) {
    return (
      <div 
        className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}
        role="alert"
        aria-labelledby={`${warningId}-title`}
        aria-describedby={`${warningId}-description`}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 id={`${warningId}-title`} className="text-sm font-medium text-yellow-800">
              MetaMask Required
            </h3>
            <p id={`${warningId}-description`} className="text-sm text-yellow-700 mt-1">
              Please install MetaMask to connect your wallet.
            </p>
            <button
              onClick={() => window.open('https://metamask.io/download/', '_blank')}
              className="mt-2 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
              aria-label="Install MetaMask browser extension"
            >
              Install MetaMask
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className={`${className}`}>
      {!walletState.isConnected ? (
        <button
          onClick={connectWallet}
          disabled={walletState.isConnecting}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 dark:bg-green-700 dark:hover:bg-green-800 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 connect-wallet-btn border-2 border-green-600 dark:border-green-700 shadow-lg hover:shadow-xl"
          style={{
            backgroundColor: '#059669 !important',
            color: '#ffffff !important',
            border: '2px solid #059669 !important',
            minHeight: '48px'
          }}
        >
          {walletState.isConnecting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span style={{ color: '#ffffff !important' }}>Connecting...</span>
            </>
          ) : (
            <>
              <svg 
                className="h-5 w-5" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                style={{ color: '#ffffff !important' }}
              >
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
              </svg>
              <span style={{ color: '#ffffff !important' }}>Connect Wallet</span>
            </>
          )}
        </button>
      ) : (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-3 w-3 bg-green-400 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {formatAddress(walletState.address!)}
                </p>
                <p className="text-xs text-green-600 dark:text-green-300">
                  {walletState.networkName}
                </p>
              </div>
            </div>
            <button
              onClick={disconnectWallet}
              className="text-sm text-green-700 hover:text-green-900 font-medium transition-colors"
            >
              Disconnect
            </button>
          </div>
          {requiredNetwork === 'polygon-amoy' && walletState.networkName !== 'Polygon Amoy' && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-yellow-700">
                  Please switch to Polygon Amoy
                </p>
                <button
                  onClick={switchToPolygonAmoy}
                  className="text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded transition-colors"
                >
                  Switch Network
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );