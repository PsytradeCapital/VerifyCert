// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Certificate
 * @dev Non-transferable ERC721 certificate contract for VerifyCert
 * Implements tamper-proof digital certificates as NFTs on Polygon Mumbai
 */
contract Certificate is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Mapping from issuer address to authorization status
    mapping(address => bool) public authorizedIssuers;
    
    // Mapping from token ID to revocation status
    mapping(uint256 => bool) public revokedCertificates;
    
    // Certificate metadata structure
    struct CertificateData {
        string recipientName;
        string courseName;
        string institutionName;
        uint256 issueDate;
        address issuer;
        bool isRevoked;
    }
    
    // Mapping from token ID to certificate data
    mapping(uint256 => CertificateData) public certificates;

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

    constructor() ERC721("VerifyCert Certificate", "VCERT") {}

    /**
     * @dev Modifier to check if caller is authorized issuer
     */
    modifier onlyAuthorizedIssuer() {
        require(
            authorizedIssuers[msg.sender] || msg.sender == owner(),
            "Certificate: caller is not authorized issuer"
        );
        _;
    }

    /**
     * @dev Authorize an address to issue certificates
     * @param issuer Address to authorize
     */
    function authorizeIssuer(address issuer) public onlyOwner {
        require(issuer != address(0), "Certificate: invalid issuer address");
        require(!authorizedIssuers[issuer], "Certificate: issuer already authorized");
        
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer, msg.sender);
    }

    /**
     * @dev Revoke issuer authorization
     * @param issuer Address to revoke authorization from
     */
    function revokeIssuer(address issuer) public onlyOwner {
        require(authorizedIssuers[issuer], "Certificate: issuer not authorized");
        
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer, msg.sender);
    }

    /**
     * @dev Issue a new certificate
     * @param recipient Address to receive the certificate
     * @param recipientName Name of the certificate recipient
     * @param courseName Name of the course/program
     * @param institutionName Name of the issuing institution
     * @param tokenURI Metadata URI for the certificate
     */
    function issueCertificate(
        address recipient,
        string memory recipientName,
        string memory courseName,
        string memory institutionName,
        string memory tokenURI
    ) public onlyAuthorizedIssuer nonReentrant returns (uint256) {
        require(recipient != address(0), "Certificate: invalid recipient address");
        require(bytes(recipientName).length > 0, "Certificate: recipient name required");
        require(bytes(courseName).length > 0, "Certificate: course name required");
        require(bytes(institutionName).length > 0, "Certificate: institution name required");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Mint the certificate NFT
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);

        // Store certificate data
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
    function revokeCertificate(uint256 tokenId) public {
        require(_exists(tokenId), "Certificate: certificate does not exist");
        require(
            certificates[tokenId].issuer == msg.sender || msg.sender == owner(),
            "Certificate: caller cannot revoke this certificate"
        );
        require(!certificates[tokenId].isRevoked, "Certificate: certificate already revoked");

        certificates[tokenId].isRevoked = true;
        revokedCertificates[tokenId] = true;

        emit CertificateRevoked(tokenId, msg.sender);
    }

    /**
     * @dev Get certificate data
     * @param tokenId ID of the certificate
     */
    function getCertificate(uint256 tokenId) public view returns (CertificateData memory) {
        require(_exists(tokenId), "Certificate: certificate does not exist");
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

    /**
     * @dev Override transfer functions to make certificates non-transferable
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        require(
            from == address(0) || to == address(0),
            "Certificate: certificates are non-transferable"
        );
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /**
     * @dev Override approve to prevent approvals
     */
    function approve(address, uint256) public pure override {
        revert("Certificate: certificates are non-transferable");
    }

    /**
     * @dev Override setApprovalForAll to prevent approvals
     */
    function setApprovalForAll(address, bool) public pure override {
        revert("Certificate: certificates are non-transferable");
    }

    /**
     * @dev Override getApproved to always return zero address
     */
    function getApproved(uint256) public pure override returns (address) {
        return address(0);
    }

    /**
     * @dev Override isApprovedForAll to always return false
     */
    function isApprovedForAll(address, address) public pure override returns (bool) {
        return false;
    }

    // Required overrides for multiple inheritance
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