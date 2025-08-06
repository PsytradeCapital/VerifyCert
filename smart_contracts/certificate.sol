// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title Certificate
 * @dev Non-transferable ERC721 certificate contract for VerifyCert
 * Implements tamper-proof digital certificates on Polygon Amoy
 */
contract Certificate is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    uint256 private _tokenIdCounter;

    struct CertificateData {
        string recipientName;
        string courseName;
        string institutionName;
        uint256 issueDate;
        address issuer;
        bool isValid;
        string metadataHash;
    }

    mapping(uint256 => CertificateData) public certificates;
    mapping(address => bool) public authorizedIssuers;
    mapping(uint256 => bool) public revokedCertificates;
    mapping(address => uint256[]) public recipientCertificates;
    mapping(address => uint256[]) public issuerCertificates;
    mapping(string => uint256) public metadataHashToTokenId;

    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        address indexed issuer,
        string recipientName,
        string courseName,
        string institutionName,
        uint256 issueDate,
        string metadataHash
    );

    event CertificateRevoked(uint256 indexed tokenId, address indexed revoker, string reason);
    event IssuerAuthorized(address indexed issuer, address indexed authorizer);
    event IssuerRevoked(address indexed issuer, address indexed revoker);

    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender] || msg.sender == owner(), "Not authorized to issue certificates");
        _;
    }

    modifier validTokenId(uint256 tokenId) {
        require(_exists(tokenId), "Certificate does not exist");
        _;
    }

    constructor() ERC721("VerifyCert Certificate", "VCERT") {
        // Owner is automatically authorized to issue certificates
        authorizedIssuers[msg.sender] = true;
    }

    /**
     * @dev Issue a new certificate
     * @param recipient Address of the certificate recipient
     * @param recipientName Name of the recipient
     * @param courseName Name of the course/achievement
     * @param institutionName Name of the issuing institution
     * @param certificateURI URI pointing to certificate metadata
     * @param metadataHash Hash of the certificate metadata for integrity verification
     */
    function issueCertificate(
        address recipient,
        string memory recipientName,
        string memory courseName,
        string memory institutionName,
        string memory certificateURI,
        string memory metadataHash
    ) public onlyAuthorizedIssuer whenNotPaused nonReentrant returns (uint256) {
        require(recipient != address(0), "Invalid recipient address");
        require(bytes(recipientName).length > 0, "Recipient name required");
        require(bytes(courseName).length > 0, "Course name required");
        require(bytes(institutionName).length > 0, "Institution name required");
        require(bytes(metadataHash).length > 0, "Metadata hash required");
        require(metadataHashToTokenId[metadataHash] == 0, "Certificate with this hash already exists");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, certificateURI);

        certificates[tokenId] = CertificateData({
            recipientName: recipientName,
            courseName: courseName,
            institutionName: institutionName,
            issueDate: block.timestamp,
            issuer: msg.sender,
            isValid: true,
            metadataHash: metadataHash
        });

        recipientCertificates[recipient].push(tokenId);
        issuerCertificates[msg.sender].push(tokenId);
        metadataHashToTokenId[metadataHash] = tokenId;

        emit CertificateIssued(
            tokenId, 
            recipient, 
            msg.sender, 
            recipientName, 
            courseName, 
            institutionName, 
            block.timestamp, 
            metadataHash
        );

        return tokenId;
    }

    /**
     * @dev Revoke a certificate
     * @param tokenId ID of the certificate to revoke
     * @param reason Reason for revocation
     */
    function revokeCertificate(uint256 tokenId, string memory reason) 
        public 
        validTokenId(tokenId) 
        whenNotPaused 
    {
        require(
            certificates[tokenId].issuer == msg.sender || msg.sender == owner(), 
            "Only issuer or owner can revoke certificate"
        );
        require(!revokedCertificates[tokenId], "Certificate already revoked");

        revokedCertificates[tokenId] = true;
        certificates[tokenId].isValid = false;
        
        emit CertificateRevoked(tokenId, msg.sender, reason);
    }

    /**
     * @dev Authorize an address to issue certificates
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
        require(issuer != owner(), "Cannot revoke owner authorization");
        
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer, msg.sender);
    }

    /**
     * @dev Get certificate data
     * @param tokenId ID of the certificate
     */
    function getCertificate(uint256 tokenId) 
        public 
        view 
        validTokenId(tokenId) 
        returns (CertificateData memory) 
    {
        return certificates[tokenId];
    }

    /**
     * @dev Get certificates owned by an address
     * @param recipient Address of the certificate holder
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
     * @param issuer Address of the issuer
     */
    function getCertificatesByIssuer(address issuer) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return issuerCertificates[issuer];
    }

    /**
     * @dev Check if a certificate is valid
     * @param tokenId ID of the certificate
     */
    function isValidCertificate(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId) && certificates[tokenId].isValid && !revokedCertificates[tokenId];
    }

    /**
     * @dev Check if an address is an authorized issuer
     * @param issuer Address to check
     */
    function isAuthorizedIssuer(address issuer) public view returns (bool) {
        return authorizedIssuers[issuer] || issuer == owner();
    }

    /**
     * @dev Get total number of certificates issued
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Pause contract operations
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract operations
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Override to make certificates non-transferable
     */
    function _beforeTokenTransfer(
        address from, 
        address to, 
        uint256 tokenId, 
        uint256 batchSize
    ) internal override whenNotPaused {
        require(from == address(0) || to == address(0), "Certificates are non-transferable");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    // Override transfer functions to make certificates non-transferable
    function approve(address, uint256) public pure override {
        revert("Certificates are non-transferable");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("Certificates are non-transferable");
    }

    function transferFrom(address, address, uint256) public pure override {
        revert("Certificates are non-transferable");
    }

    function safeTransferFrom(address, address, uint256) public pure override {
        revert("Certificates are non-transferable");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("Certificates are non-transferable");
    }

    // Required overrides
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
}