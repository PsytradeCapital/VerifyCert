const { ethers } = require('ethers');
const config = require('../config');

class CertificateService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.contractAddress = config.blockchain.contractAddress;
    
    // Contract ABI - extracted from the smart contract
    this.contractABI = [
      // Events
      "event CertificateMinted(uint256 indexed tokenId, address indexed issuer, address indexed recipient)",
      "event CertificateRevoked(uint256 indexed tokenId)",
      "event IssuerAuthorized(address indexed issuer)",
      "event IssuerRevoked(address indexed issuer)",
      
      // Read functions
      "function certificates(uint256) view returns (address issuer, address recipient, string recipientName, string courseName, string institutionName, uint256 issueDate, string metadataURI, bool isValid)",
      "function authorizedIssuers(address) view returns (bool)",
      "function getCertificate(uint256 tokenId) view returns (tuple(address issuer, address recipient, string recipientName, string courseName, string institutionName, uint256 issueDate, string metadataURI, bool isValid))",
      "function verifyCertificate(uint256 tokenId) view returns (bool)",
      "function ownerOf(uint256 tokenId) view returns (address)",
      "function balanceOf(address owner) view returns (uint256)",
      
      // Write functions
      "function mintCertificate(address recipient, string recipientName, string courseName, string institutionName, string metadataURI) returns (uint256)",
      "function revokeCertificate(uint256 tokenId)",
      "function authorizeIssuer(address issuer)",
      "function revokeIssuer(address issuer)"
    ];
    
    this.initialize();
  }
  
  /**
   * Initialize blockchain connection
   */
  async initialize() {
    try {
      // Create provider
      this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
      
      // Create signer if private key is available
      if (config.blockchain.privateKey) {
        this.signer = new ethers.Wallet(config.blockchain.privateKey, this.provider);
      }
      
      // Initialize contract if address is available
      if (this.contractAddress) {
        this.contract = new ethers.Contract(
          this.contractAddress,
          this.contractABI,
          this.signer || this.provider
        );
      }
      
      console.log('CertificateService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize CertificateService:', error);
      throw this.createBlockchainError('Initialization failed', error);
    }
  }
  
  /**
   * Check if the service is properly initialized
   */
  isInitialized() {
    return this.provider !== null && this.contract !== null;
  }
  
  /**
   * Mint a new certificate
   * @param {Object} certificateData - Certificate data
   * @param {string} certificateData.recipientAddress - Recipient wallet address
   * @param {string} certificateData.recipientName - Recipient name
   * @param {string} certificateData.courseName - Course/achievement name
   * @param {string} certificateData.institutionName - Institution name
   * @param {string} certificateData.metadataURI - IPFS URI for metadata
   * @returns {Promise<Object>} Transaction result with token ID
   */
  async mintCertificate(certificateData) {
    try {
      if (!this.isInitialized()) {
        throw new Error('Service not initialized');
      }
      
      if (!this.signer) {
        throw new Error('No signer available for minting');
      }
      
      const { recipientAddress, recipientName, courseName, institutionName, metadataURI } = certificateData;
      
      // Validate inputs
      if (!ethers.isAddress(recipientAddress)) {
        throw new Error('Invalid recipient address');
      }
      
      // Estimate gas
      const gasEstimate = await this.contract.mintCertificate.estimateGas(
        recipientAddress,
        recipientName,
        courseName,
        institutionName,
        metadataURI || ''
      );
      
      // Add 20% buffer to gas estimate
      const gasLimit = gasEstimate * 120n / 100n;
      
      // Execute transaction
      const tx = await this.contract.mintCertificate(
        recipientAddress,
        recipientName,
        courseName,
        institutionName,
        metadataURI || '',
        {
          gasLimit: gasLimit,
          gasPrice: config.blockchain.gasPrice
        }
      );
      
      console.log('Certificate minting transaction sent:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      // Extract token ID from events
      const mintEvent = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed.name === 'CertificateMinted';
        } catch {
          return false;
        }
      });
      
      if (!mintEvent) {
        throw new Error('Certificate minting event not found in transaction receipt');
      }
      
      const parsedEvent = this.contract.interface.parseLog(mintEvent);
      const tokenId = parsedEvent.args.tokenId.toString();
      
      return {
        success: true,
        tokenId,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
      
    } catch (error) {
      console.error('Certificate minting failed:', error);
      throw this.createBlockchainError('Certificate minting failed', error);
    }
  }
  
  /**
   * Get certificate data by token ID
   * @param {string} tokenId - Certificate token ID
   * @returns {Promise<Object>} Certificate data
   */
  async getCertificate(tokenId) {
    try {
      if (!this.isInitialized()) {
        throw new Error('Service not initialized');
      }
      
      const certificateData = await this.contract.getCertificate(tokenId);
      
      return {
        tokenId,
        issuer: certificateData.issuer,
        recipient: certificateData.recipient,
        recipientName: certificateData.recipientName,
        courseName: certificateData.courseName,
        institutionName: certificateData.institutionName,
        issueDate: new Date(Number(certificateData.issueDate) * 1000).toISOString(),
        metadataURI: certificateData.metadataURI,
        isValid: certificateData.isValid
      };
      
    } catch (error) {
      console.error('Failed to get certificate:', error);
      
      // Handle specific contract errors
      if (error.reason === 'CertificateNotFound') {
        const notFoundError = new Error('Certificate not found');
        notFoundError.code = 'CERTIFICATE_NOT_FOUND';
        throw notFoundError;
      }
      
      throw this.createBlockchainError('Failed to retrieve certificate', error);
    }
  }
  
  /**
   * Verify certificate authenticity
   * @param {string} tokenId - Certificate token ID
   * @returns {Promise<boolean>} True if certificate is valid
   */
  async verifyCertificate(tokenId) {
    try {
      if (!this.isInitialized()) {
        throw new Error('Service not initialized');
      }
      
      return await this.contract.verifyCertificate(tokenId);
      
    } catch (error) {
      console.error('Certificate verification failed:', error);
      // For verification, return false instead of throwing for non-existent certificates
      return false;
    }
  }
  
  /**
   * Get certificates issued by a specific address
   * @param {string} issuerAddress - Issuer wallet address
   * @param {number} limit - Maximum number of certificates to return
   * @returns {Promise<Array>} Array of certificate data
   */
  async getCertificatesByIssuer(issuerAddress, limit = 50) {
    try {
      if (!this.isInitialized()) {
        throw new Error('Service not initialized');
      }
      
      if (!ethers.isAddress(issuerAddress)) {
        throw new Error('Invalid issuer address');
      }
      
      // Get CertificateMinted events for this issuer
      const filter = this.contract.filters.CertificateMinted(null, issuerAddress, null);
      const events = await this.contract.queryFilter(filter, -10000); // Last ~10k blocks
      
      // Limit results
      const limitedEvents = events.slice(-limit);
      
      // Fetch certificate data for each token
      const certificates = await Promise.all(
        limitedEvents.map(async (event) => {
          try {
            const tokenId = event.args.tokenId.toString();
            return await this.getCertificate(tokenId);
          } catch (error) {
            console.error(`Failed to fetch certificate ${event.args.tokenId}:`, error);
            return null;
          }
        })
      );
      
      // Filter out failed fetches and return
      return certificates.filter(cert => cert !== null);
      
    } catch (error) {
      console.error('Failed to get certificates by issuer:', error);
      throw this.createBlockchainError('Failed to retrieve issuer certificates', error);
    }
  }
  
  /**
   * Check if an address is an authorized issuer
   * @param {string} address - Address to check
   * @returns {Promise<boolean>} True if authorized
   */
  async isAuthorizedIssuer(address) {
    try {
      if (!this.isInitialized()) {
        throw new Error('Service not initialized');
      }
      
      if (!ethers.isAddress(address)) {
        return false;
      }
      
      return await this.contract.authorizedIssuers(address);
      
    } catch (error) {
      console.error('Failed to check issuer authorization:', error);
      return false;
    }
  }
  
  /**
   * Revoke a certificate (only by issuer or contract owner)
   * @param {string} tokenId - Certificate token ID
   * @returns {Promise<Object>} Transaction result
   */
  async revokeCertificate(tokenId) {
    try {
      if (!this.isInitialized()) {
        throw new Error('Service not initialized');
      }
      
      if (!this.signer) {
        throw new Error('No signer available for revocation');
      }
      
      const tx = await this.contract.revokeCertificate(tokenId, {
        gasLimit: config.blockchain.gasLimit,
        gasPrice: config.blockchain.gasPrice
      });
      
      console.log('Certificate revocation transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
      
    } catch (error) {
      console.error('Certificate revocation failed:', error);
      throw this.createBlockchainError('Certificate revocation failed', error);
    }
  }
  
  /**
   * Create a standardized blockchain error
   * @param {string} message - Error message
   * @param {Error} originalError - Original error object
   * @returns {Error} Formatted error
   */
  createBlockchainError(message, originalError) {
    const error = new Error(message);
    error.code = 'BLOCKCHAIN_ERROR';
    error.originalError = originalError;
    
    // Extract useful information from ethers errors
    if (originalError.reason) {
      error.reason = originalError.reason;
    }
    
    if (originalError.code) {
      error.ethersCode = originalError.code;
    }
    
    return error;
  }
  
  /**
   * Get network information
   * @returns {Promise<Object>} Network details
   */
  async getNetworkInfo() {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }
      
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      
      return {
        chainId: Number(network.chainId),
        name: network.name,
        blockNumber,
        contractAddress: this.contractAddress
      };
      
    } catch (error) {
      console.error('Failed to get network info:', error);
      throw this.createBlockchainError('Failed to get network information', error);
    }
  }
}

module.exports = CertificateService;