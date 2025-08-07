// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Certificate
 * @dev Non-transferable ERC721 certificate contract for issuing verifiable digital certificates
 */
contract Certificate is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Certificate data structure
    struct CertificateData {
        string recipientName;
        string courseName;
        string institutionName;
        uint256 issueDate;
        uint256 expiryDate;
        bool isRevoked;
        address issuer;
        string metadataURI;
    }

    // Mappings
    mapping(uint256 => CertificateData) public certificates;
    mapping(address => bool) public authorizedIssuers;
    mapping(address => uint256[]) public recipientCertificates;
    mapping(address => uint256[]) public issuerCertificates;

    // Events
    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        address indexed issuer,
        string recipientName,
        string courseName,
        string institutionName
    );
    
    event CertificateRevoked(uint256 indexed tokenId, address indexed revoker);
    event IssuerAuthorized(address indexed issuer, address indexed authorizer);
    event IssuerRevoked(address indexed issuer, address indexed revoker);

    // Modifiers
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender] || msg.sender == owner(), "Not authorized to issue certificates");
        _;
    }

    modifier certificateExists(uint256 tokenId) {
        require(_exists(tokenId), "Certificate does not exist");
        _;
    }

    modifier notRevoked(uint256 tokenId) {
        require(!certificates[tokenId].isRevoked, "Certificate has been revoked");
        _;
    }

    constructor() ERC721("VerifyCert Certificate", "VCERT") {}

    /**
     * @dev Issue a new certificate
     */
    function issueCertificate(
        address recipient,
        string memory recipientName,
        string memory courseName,
        string memory institutionName,
        uint256 expiryDate,
        string memory metadataURI
    ) public onlyAuthorizedIssuer nonReentrant returns (uint256) {
        require(recipient != address(0), "Invalid recipient address");
        require(bytes(recipientName).length > 0, "Recipient name required");
        require(bytes(courseName).length > 0, "Course name required");
        require(bytes(institutionName).length > 0, "Institution name required");
        require(expiryDate == 0 || expiryDate > block.timestamp, "Invalid expiry date");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Mint the certificate NFT
        _safeMint(recipient, tokenId);
        
        // Set metadata URI if provided
        if (bytes(metadataURI).length > 0) {
            _setTokenURI(tokenId, metadataURI);
        }

        // Store certificate data
        certificates[tokenId] = CertificateData({
            recipientName: recipientName,
            courseName: courseName,
            institutionName: institutionName,
            issueDate: block.timestamp,
            expiryDate: expiryDate,
            isRevoked: false,
            issuer: msg.sender,
            metadataURI: metadataURI
        });

        // Update mappings
        recipientCertificates[recipient].push(tokenId);
        issuerCertificates[msg.sender].push(tokenId);

        emit CertificateIssued(tokenId, recipient, msg.sender, recipientName, courseName, institutionName);
        
        return tokenId;
    }

    /**
     * @dev Revoke a certificate
     */
    function revokeCertificate(uint256 tokenId) 
        public 
        certificateExists(tokenId) 
        notRevoked(tokenId) 
    {
        require(
            msg.sender == certificates[tokenId].issuer || msg.sender == owner(),
            "Only issuer or owner can revoke certificate"
        );

        certificates[tokenId].isRevoked = true;
        emit CertificateRevoked(tokenId, msg.sender);
    }

    /**
     * @dev Authorize an issuer
     */
    function authorizeIssuer(address issuer) public onlyOwner {
        require(issuer != address(0), "Invalid issuer address");
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer, msg.sender);
    }

    /**
     * @dev Revoke issuer authorization
     */
    function revokeIssuer(address issuer) public onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer, msg.sender);
    }

    /**
     * @dev Get certificate details
     */
    function getCertificate(uint256 tokenId) 
        public 
        view 
        certificateExists(tokenId) 
        returns (CertificateData memory) 
    {
        return certificates[tokenId];
    }

    /**
     * @dev Check if certificate is valid (exists, not revoked, not expired)
     */
    function isValidCertificate(uint256 tokenId) public view returns (bool) {
        if (!_exists(tokenId)) return false;
        
        CertificateData memory cert = certificates[tokenId];
        if (cert.isRevoked) return false;
        if (cert.expiryDate > 0 && cert.expiryDate < block.timestamp) return false;
        
        return true;
    }

    /**
     * @dev Get certificates owned by an address
     */
    function getCertificatesByRecipient(address recipient) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return recipientCertificates[recipient];
    }

    /**
     * @dev Get certificates issued by an address
     */
    function getCertificatesByIssuer(address issuer) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return issuerCertificates[issuer];
    }

    /**
     * @dev Get total number of certificates issued
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // Override transfer functions to make certificates non-transferable
    function transferFrom(address, address, uint256) public pure override {
        revert("Certificates are non-transferable");
    }

    function safeTransferFrom(address, address, uint256) public pure override {
        revert("Certificates are non-transferable");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("Certificates are non-transferable");
    }

    function approve(address, uint256) public pure override {
        revert("Certificates are non-transferable");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("Certificates are non-transferable");
    }

    function getApproved(uint256) public pure override returns (address) {
        return address(0);
    }

    function isApprovedForAll(address, address) public pure override returns (bool) {
        return false;
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