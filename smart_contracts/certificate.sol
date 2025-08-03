// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title Certificate
 * @dev Non-transferable ERC721 certificate contract for VerifyCert
 * Implements tamper-proof digital certificates as NFTs with enhanced security
 */
contract Certificate is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Mapping from issuer address to authorization status
    mapping(address => bool) public authorizedIssuers;
    
    // Mapping from token ID to certificate metadata
    mapping(uint256 => CertificateData) public certificates;
    
    // Mapping from token ID to revocation status
    mapping(uint256 => bool) public revokedCertificates;
    
    // Mapping to track certificates by recipient
    mapping(address => uint256[]) public recipientCertificates;
    
    // Mapping to track certificates by issuer
    mapping(address => uint256[]) public issuerCertificates;
    
    struct CertificateData {
        string recipientName;
        string courseName;
        string institutionName;
        uint256 issueDate;
        address issuer;
        address recipient;
        bool isRevoked;
        string ipfsHash;
    }
    
    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        address indexed issuer,
        string recipientName,
        string courseName,
        string institutionName
    );
    
    event CertificateRevoked(uint256 indexed tokenId, address indexed revoker, string reason);
    event IssuerAuthorized(address indexed issuer, address indexed authorizer);
    event IssuerRevoked(address indexed issuer, address indexed revoker);
    event CertificateMetadataUpdated(uint256 indexed tokenId, string newTokenURI);
    
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender] || msg.sender == owner(), "Not authorized to issue certificates");
        _;
    }
    
    modifier certificateExists(uint256 tokenId) {
        require(_exists(tokenId), "Certificate does not exist");
        _;
    }
    
    modifier onlyIssuerOrOwner(uint256 tokenId) {
        require(
            msg.sender == certificates[tokenId].issuer || msg.sender == owner(),
            "Only issuer or owner can perform this action"
        );
        _;
    }
    
    constructor() ERC721("VerifyCert Certificate", "VCERT") {
        // Owner is automatically authorized
        authorizedIssuers[msg.sender] = true;
        emit IssuerAuthorized(msg.sender, msg.sender);
    }
    
    /**
     * @dev Issue a new certificate
     * @param recipient Address of the certificate recipient
     * @param recipientName Name of the certificate recipient
     * @param courseName Name of the course/program
     * @param institutionName Name of the issuing institution
     * @param tokenURI IPFS URI for certificate metadata
     */
    function issueCertificate(
        address recipient,
        string memory recipientName,
        string memory courseName,
        string memory institutionName,
        string memory tokenURI
    ) public onlyAuthorizedIssuer nonReentrant whenNotPaused returns (uint256) {
        require(recipient != address(0), "Invalid recipient address");
        require(bytes(recipientName).length > 0, "Recipient name required");
        require(bytes(courseName).length > 0, "Course name required");
        require(bytes(institutionName).length > 0, "Institution name required");
        require(bytes(tokenURI).length > 0, "Token URI required");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        certificates[tokenId] = CertificateData({
            recipientName: recipientName,
            courseName: courseName,
            institutionName: institutionName,
            issueDate: block.timestamp,
            issuer: msg.sender,
            recipient: recipient,
            isRevoked: false,
            ipfsHash: ""
        });
        
        // Track certificates by recipient and issuer
        recipientCertificates[recipient].push(tokenId);
        issuerCertificates[msg.sender].push(tokenId);
        
        emit CertificateIssued(
            tokenId,
            recipient,
            msg.sender,
            recipientName,
            courseName,
            institutionName
        );
        
        return tokenId;
    }
    
    /**
     * @dev Batch issue certificates
     * @param recipients Array of recipient addresses
     * @param recipientNames Array of recipient names
     * @param courseName Name of the course/program
     * @param institutionName Name of the issuing institution
     * @param baseTokenURI Base URI for certificate metadata
     */
    function batchIssueCertificates(
        address[] memory recipients,
        string[] memory recipientNames,
        string memory courseName,
        string memory institutionName,
        string memory baseTokenURI
    ) public onlyAuthorizedIssuer nonReentrant whenNotPaused returns (uint256[] memory) {
        require(recipients.length == recipientNames.length, "Arrays length mismatch");
        require(recipients.length > 0, "Empty arrays");
        require(recipients.length <= 100, "Batch size too large");
        
        uint256[] memory tokenIds = new uint256[](recipients.length);
        
        for (uint256 i = 0; i < recipients.length; i++) {
            string memory tokenURI = string(abi.encodePacked(baseTokenURI, "/", Strings.toString(_tokenIdCounter.current())));
            tokenIds[i] = issueCertificate(
                recipients[i],
                recipientNames[i],
                courseName,
                institutionName,
                tokenURI
            );
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Revoke a certificate
     * @param tokenId ID of the certificate to revoke
     * @param reason Reason for revocation
     */
    function revokeCertificate(uint256 tokenId, string memory reason) 
        public 
        certificateExists(tokenId) 
        onlyIssuerOrOwner(tokenId) 
        nonReentrant 
    {
        require(!certificates[tokenId].isRevoked, "Certificate already revoked");
        require(bytes(reason).length > 0, "Revocation reason required");
        
        certificates[tokenId].isRevoked = true;
        revokedCertificates[tokenId] = true;
        
        emit CertificateRevoked(tokenId, msg.sender, reason);
    }
    
    /**
     * @dev Authorize an issuer
     * @param issuer Address to authorize
     */
    function authorizeIssuer(address issuer) public onlyOwner {
        require(issuer != address(0), "Invalid issuer address");
        require(!authorizedIssuers[issuer], "Issuer already authorized");
        
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer, msg.sender);
    }
    
    /**
     * @dev Revoke issuer authorization
     * @param issuer Address to revoke authorization from
     */
    function revokeIssuerAuthorization(address issuer) public onlyOwner {
        require(authorizedIssuers[issuer], "Issuer not authorized");
        
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer, msg.sender);
    }
    
    /**
     * @dev Update certificate metadata URI
     * @param tokenId ID of the certificate
     * @param newTokenURI New metadata URI
     */
    function updateCertificateURI(uint256 tokenId, string memory newTokenURI) 
        public 
        certificateExists(tokenId) 
        onlyIssuerOrOwner(tokenId) 
    {
        require(bytes(newTokenURI).length > 0, "Token URI required");
        
        _setTokenURI(tokenId, newTokenURI);
        emit CertificateMetadataUpdated(tokenId, newTokenURI);
    }
    
    /**
     * @dev Get certificate data
     * @param tokenId ID of the certificate
     */
    function getCertificate(uint256 tokenId) public view certificateExists(tokenId) returns (CertificateData memory) {
        return certificates[tokenId];
    }
    
    /**
     * @dev Check if certificate is valid (exists and not revoked)
     * @param tokenId ID of the certificate
     */
    function isValidCertificate(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId) && !certificates[tokenId].isRevoked;
    }
    
    /**
     * @dev Get certificates by recipient
     * @param recipient Address of the recipient
     */
    function getCertificatesByRecipient(address recipient) public view returns (uint256[] memory) {
        return recipientCertificates[recipient];
    }
    
    /**
     * @dev Get certificates by issuer
     * @param issuer Address of the issuer
     */
    function getCertificatesByIssuer(address issuer) public view returns (uint256[] memory) {
        return issuerCertificates[issuer];
    }
    
    /**
     * @dev Get total number of certificates issued
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Get certificate statistics
     */
    function getCertificateStats() public view returns (
        uint256 totalIssued,
        uint256 totalRevoked,
        uint256 totalValid,
        uint256 totalIssuers
    ) {
        totalIssued = _tokenIdCounter.current();
        
        // Count revoked certificates
        for (uint256 i = 0; i < totalIssued; i++) {
            if (revokedCertificates[i]) {
                totalRevoked++;
            }
        }
        
        totalValid = totalIssued - totalRevoked;
        
        // This is a simplified count - in practice, you'd maintain a separate counter
        totalIssuers = 1; // Placeholder
    }
    
    /**
     * @dev Emergency pause function
     */
    function pause() public onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause function
     */
    function unpause() public onlyOwner {
        _unpause();
    }
    
    // Override transfer functions to make certificates non-transferable
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override whenNotPaused {
        require(from == address(0), "Certificates are non-transferable");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function approve(address to, uint256 tokenId) public override {
        revert("Certificates are non-transferable");
    }
    
    function setApprovalForAll(address operator, bool approved) public override {
        revert("Certificates are non-transferable");
    }
    
    function transferFrom(address from, address to, uint256 tokenId) public override {
        revert("Certificates are non-transferable");
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        revert("Certificates are non-transferable");
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override {
        revert("Certificates are non-transferable");
    }
    
    // Required overrides
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}