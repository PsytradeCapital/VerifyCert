// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title Certificate
 * @dev Non-transferable NFT contract for digital certificates
 * @notice This contract creates soulbound tokens that cannot be transferred
 */
contract Certificate is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    struct CertificateData {
        address issuer;
        address recipient;
        string recipientName;
        string courseName;
        string institutionName;
        uint256 issueDate;
        string metadataURI;
        bool isValid;
    }
    
    mapping(uint256 => CertificateData) public certificates;
    mapping(address => bool) public authorizedIssuers;
    mapping(address => uint256[]) private _issuerCertificates;
    mapping(address => uint256[]) private _recipientCertificates;
    
    event CertificateMinted(uint256 indexed tokenId, address indexed issuer, address indexed recipient);
    event CertificateRevoked(uint256 indexed tokenId);
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);
    
    error UnauthorizedIssuer();
    error InvalidRecipient();
    error CertificateNotFound();
    error CertificateAlreadyRevoked();
    error TransferNotAllowed();
    error EmptyString();
    error InvalidTokenId();
    
    modifier onlyAuthorizedIssuer() {
        if (!authorizedIssuers[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedIssuer();
        }
        _;
    }
    
    modifier validString(string memory str) {
        if (bytes(str).length == 0) {
            revert EmptyString();
        }
        _;
    }
    
    modifier tokenExists(uint256 tokenId) {
        if (!_exists(tokenId)) {
            revert CertificateNotFound();
        }
        _;
    }
    
    constructor() ERC721("VerifyCert", "VCERT") {
        // Owner is automatically authorized
        authorizedIssuers[msg.sender] = true;
    }
    
    /**
     * @dev Mint a new certificate NFT
     * @param recipient Address of the certificate recipient
     * @param recipientName Name of the recipient
     * @param courseName Name of the course/achievement
     * @param institutionName Name of the issuing institution
     * @param metadataURI URI for certificate metadata
     * @return tokenId The ID of the newly minted certificate
     */
    function mintCertificate(
        address recipient,
        string memory recipientName,
        string memory courseName,
        string memory institutionName,
        string memory metadataURI
    ) external onlyAuthorizedIssuer nonReentrant 
      validString(recipientName)
      validString(courseName)
      validString(institutionName)
      returns (uint256) {
        
        if (recipient == address(0)) {
            revert InvalidRecipient();
        }
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(recipient, newTokenId);
        
        certificates[newTokenId] = CertificateData({
            issuer: msg.sender,
            recipient: recipient,
            recipientName: recipientName,
            courseName: courseName,
            institutionName: institutionName,
            issueDate: block.timestamp,
            metadataURI: metadataURI,
            isValid: true
        });
        
        // Track certificates by issuer and recipient
        _issuerCertificates[msg.sender].push(newTokenId);
        _recipientCertificates[recipient].push(newTokenId);
        
        emit CertificateMinted(newTokenId, msg.sender, recipient);
        return newTokenId;
    }
    
    /**
     * @dev Get certificate data by token ID
     * @param tokenId The certificate token ID
     * @return Certificate data struct
     */
    function getCertificate(uint256 tokenId) external view tokenExists(tokenId) returns (CertificateData memory) {
        return certificates[tokenId];
    }
    
    /**
     * @dev Verify if a certificate is valid
     * @param tokenId The certificate token ID
     * @return True if certificate exists and is valid
     */
    function verifyCertificate(uint256 tokenId) external view returns (bool) {
        if (!_exists(tokenId)) {
            return false;
        }
        return certificates[tokenId].isValid;
    }
    
    /**
     * @dev Revoke a certificate (only by issuer or owner)
     * @param tokenId The certificate token ID to revoke
     */
    function revokeCertificate(uint256 tokenId) external nonReentrant tokenExists(tokenId) {
        CertificateData storage cert = certificates[tokenId];
        if (msg.sender != cert.issuer && msg.sender != owner()) {
            revert UnauthorizedIssuer();
        }
        
        if (!cert.isValid) {
            revert CertificateAlreadyRevoked();
        }
        
        cert.isValid = false;
        emit CertificateRevoked(tokenId);
    }
    
    /**
     * @dev Authorize an address to issue certificates
     * @param issuer Address to authorize
     */
    function authorizeIssuer(address issuer) external onlyOwner {
        require(issuer != address(0), "Invalid issuer address");
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }
    
    /**
     * @dev Revoke issuer authorization
     * @param issuer Address to revoke authorization from
     */
    function revokeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }
    
    /**
     * @dev Get certificates issued by a specific address
     * @param issuer The issuer address
     * @return Array of token IDs issued by the address
     */
    function getCertificatesByIssuer(address issuer) external view returns (uint256[] memory) {
        return _issuerCertificates[issuer];
    }
    
    /**
     * @dev Get certificates owned by a specific address
     * @param recipient The recipient address
     * @return Array of token IDs owned by the address
     */
    function getCertificatesByRecipient(address recipient) external view returns (uint256[] memory) {
        return _recipientCertificates[recipient];
    }
    
    /**
     * @dev Get total number of certificates minted
     * @return Total certificate count
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }
    
    /**
     * @dev Check if a token exists
     * @param tokenId Token ID to check
     * @return True if token exists
     */
    function exists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }
    
    // Override transfer functions to make NFTs non-transferable (soulbound)
    function transferFrom(address, address, uint256) public pure override {
        revert TransferNotAllowed();
    }
    
    function safeTransferFrom(address, address, uint256) public pure override {
        revert TransferNotAllowed();
    }
    
    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert TransferNotAllowed();
    }
    
    function approve(address, uint256) public pure override {
        revert TransferNotAllowed();
    }
    
    function setApprovalForAll(address, bool) public pure override {
        revert TransferNotAllowed();
    }
    
    function getApproved(uint256) public pure override returns (address) {
        return address(0);
    }
    
    function isApprovedForAll(address, address) public pure override returns (bool) {
        return false;
    }
    
    /**
     * @dev Override tokenURI to return metadata URI from certificate data
     * @param tokenId Token ID
     * @return URI string
     */
    function tokenURI(uint256 tokenId) public view override tokenExists(tokenId) returns (string memory) {
        return certificates[tokenId].metadataURI;
    }
}