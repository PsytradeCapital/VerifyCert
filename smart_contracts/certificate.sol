// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title Certificate
 * @dev Non-transferable ERC721 certificate contract for VerifyCert
 * Implements tamper-proof digital certificates as NFTs
 */
contract Certificate is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Mapping from issuer address to authorization status
    mapping(address => bool) public authorizedIssuers;
    
    // Mapping from token ID to certificate metadata
    mapping(uint256 => CertificateData) public certificates;
    
    // Mapping from token ID to revocation status
    mapping(uint256 => bool) public revokedCertificates;
    
    struct CertificateData {
        string recipientName;
        string courseName;
        string institutionName;
        uint256 issueDate;
        address issuer;
        bool isRevoked;
    }
    
    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        address indexed issuer,
        string recipientName,
        string courseName,
        string institutionName
    );
    
    event CertificateRevoked(uint256 indexed tokenId, address indexed revoker);
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);
    
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender] || msg.sender == owner(), "Not authorized to issue certificates");
        _;
    }
    
    modifier certificateExists(uint256 tokenId) {
        require(_exists(tokenId), "Certificate does not exist");
        _;
    }
    
    constructor() ERC721("VerifyCert Certificate", "VCERT") {
        // Owner is automatically authorized
        authorizedIssuers[msg.sender] = true;
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
    ) public onlyAuthorizedIssuer returns (uint256) {
        require(recipient != address(0), "Invalid recipient address");
        require(bytes(recipientName).length > 0, "Recipient name required");
        require(bytes(courseName).length > 0, "Course name required");
        require(bytes(institutionName).length > 0, "Institution name required");
        
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
            isRevoked: false
        });
        
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
     * @dev Revoke a certificate
     * @param tokenId ID of the certificate to revoke
     */
    function revokeCertificate(uint256 tokenId) public certificateExists(tokenId) {
        require(
            msg.sender == certificates[tokenId].issuer || msg.sender == owner(),
            "Only issuer or owner can revoke certificate"
        );
        require(!certificates[tokenId].isRevoked, "Certificate already revoked");
        
        certificates[tokenId].isRevoked = true;
        revokedCertificates[tokenId] = true;
        
        emit CertificateRevoked(tokenId, msg.sender);
    }
    
    /**
     * @dev Authorize an issuer
     * @param issuer Address to authorize
     */
    function authorizeIssuer(address issuer) public onlyOwner {
        require(issuer != address(0), "Invalid issuer address");
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }
    
    /**
     * @dev Revoke issuer authorization
     * @param issuer Address to revoke authorization from
     */
    function revokeIssuerAuthorization(address issuer) public onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
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
     * @dev Get total number of certificates issued
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    // Override transfer functions to make certificates non-transferable
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
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