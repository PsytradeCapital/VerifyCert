import React from 'react';
import { ethers } from 'ethers';

// Contract ABI - only the functions we need for verification
const CERTIFICATE_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
    ],
    "name": "getCertificate",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "issuer",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "recipientName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "courseName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "institutionName",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "issueDate",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "metadataURI",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "isValid",
            "type": "bool"
        ],
        "internalType": "struct Certificate.CertificateData",
        "name": "",
        "type": "tuple"
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
    ],
    "name": "verifyCertificate",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
    ],
    "stateMutability": "view",
    "type": "function"
];

// Configuration from environment variables
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const RPC_URL = process.env.REACT_APP_POLYGON_MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com';
const CHAIN_ID = parseInt(process.env.REACT_APP_CHAIN_ID || '80001');

export interface CertificateData {
}
}
}
  tokenId: string;
  issuer: string;
  recipient: string;
  recipientName: string;
  courseName: string;
  institutionName: string;
  issueDate: number;
  metadataURI: string;
  isValid: boolean;
  verificationURL?: string;
  qrCodeURL?: string;
  transactionHash?: string;

export interface VerificationResult {
}
}
}
  isValid: boolean;
  onChain: boolean;
  message: string;
  verificationTimestamp: number;
  transactionHash?: string;
  blockNumber?: string;
  contractAddress?: string;

class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor() {
    if (!CONTRACT_ADDRESS) {
      throw new Error('Contract address not configured. Please set REACT_APP_CONTRACT_ADDRESS environment variable.');

    // Create public provider (no wallet needed)
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Create contract instance
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CERTIFICATE_ABI, this.provider);

  /**
   * Get certificate data directly from blockchain
   */
  async getCertificate(tokenId: string): Promise<CertificateData> {
    try {
      // Call the smart contract to get certificate data
      const certificateData = await this.contract.getCertificate(tokenId);
      
      // Transform the blockchain data to our interface
      const certificate: CertificateData = {
        tokenId,
        issuer: certificateData.issuer,
        recipient: certificateData.recipient,
        recipientName: certificateData.recipientName,
        courseName: certificateData.courseName,
        institutionName: certificateData.institutionName,
        issueDate: Number(certificateData.issueDate),
        metadataURI: certificateData.metadataURI,
        isValid: certificateData.isValid,
        verificationURL: `${window.location.origin}/verify/${tokenId}`,
        qrCodeURL: `${window.location.origin}/api/v1/qr-code/${tokenId}` // Fallback to backend for QR generation
      };

      return certificate;
    } catch (error) {
      console.error('Error fetching certificate from blockchain:', error);
      
      // Handle specific contract errors
      if (error instanceof Error) {
        if (error.message.includes('CertificateNotFound') || error.message.includes('execution reverted')) {
          throw new Error('Certificate not found on blockchain');
        if (error.message.includes('network') || error.message.includes('connection')) {
          throw new Error('Network connection error. Please check your internet connection.');
      
      throw new Error('Failed to fetch certificate from blockchain');

  /**
   * Verify certificate authenticity on blockchain
   */
  async verifyCertificate(tokenId: string): Promise<VerificationResult> {
    try {
      // First check if certificate exists and get its data
      const certificate = await this.getCertificate(tokenId);
      
      // Then verify it using the contract's verify function
      const isValid = await this.contract.verifyCertificate(tokenId);
      
      // Additional verification: check if the certificate owner exists
      let ownerExists = false;
      let transactionHash: string | undefined;
      let blockNumber: string | undefined;
      
      try {
        const owner = await this.contract.ownerOf(tokenId);
        ownerExists = owner && owner !== ethers.ZeroAddress;
        
        // Try to get transaction information from Transfer events
        if (ownerExists) {
          const filter = this.contract.filters.Transfer(ethers.ZeroAddress, null, tokenId);
          const events = await this.contract.queryFilter(filter);
          
          if (events.length > 0) {
            const mintEvent = events[0];
            transactionHash = mintEvent.transactionHash;
            blockNumber = mintEvent.blockNumber.toString();
      } catch (ownerError) {
        // If ownerOf fails, the token doesn't exist
        ownerExists = false;

      const result: VerificationResult = {
        isValid: isValid && certificate.isValid && ownerExists,
        onChain: true,
        message: isValid && certificate.isValid && ownerExists 
          ? 'Certificate is valid and verified on blockchain'
          : certificate.isValid 
            ? 'Certificate exists but may have been revoked'
            : 'Certificate is not valid or has been revoked',
        verificationTimestamp: Date.now(),
        transactionHash,
        blockNumber,
        contractAddress: CONTRACT_ADDRESS
      };

      return result;
    } catch (error) {
      console.error('Error verifying certificate on blockchain:', error);
      
      // Return verification failure result
      return {
        isValid: false,
        onChain: false,
        message: error instanceof Error ? error.message : 'Verification failed',
        verificationTimestamp: Date.now(),
        contractAddress: CONTRACT_ADDRESS
      };

  /**
   * Check if the blockchain service is properly configured
   */
  isConfigured(): boolean {
    return !!(CONTRACT_ADDRESS && RPC_URL);

  /**
   * Get network information
   */
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      return {
        name: network.name,
        chainId: Number(network.chainId),
        isCorrectNetwork: Number(network.chainId) === CHAIN_ID
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      return {
        name: 'Unknown',
        chainId: 0,
        isCorrectNetwork: false
      };

// Lazy-loaded singleton instance
let blockchainServiceInstance: BlockchainService | null = null;

export const getBlockchainService = (): BlockchainService => {
  if (!blockchainServiceInstance) {
    blockchainServiceInstance = new BlockchainService();
  return blockchainServiceInstance;
};

// Export the getter function as default
export default getBlockchainService;
}
}}}}}}}}}}}}}}}}}}}}