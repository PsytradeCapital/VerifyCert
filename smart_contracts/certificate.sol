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
 * @dev Non-transferable NFT certificate contract for VerifyCert platform
 * @notice This contract creates immutable, non-transferable certificates on the blockchain
 */
contract Certificate is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;

    // Token ID counter
    Counters.Counter private _tokenIdCounter;

    // Certificate structure
    struct CertificateData {
        string recipientName;
        string courseName;
        string institutionName;
        uint256 issueDate;
        address issuer;
        bool isRevoked;
        string metadataHash; // IPFS hash for additional metadata
    }

    // Mappings
    mapping(uint256 => CertificateData) public certificates;
    mapping(address => bool) public authorizedIssuers;
    mapping(address => uint256[]) public recipientCertificates;
    mapping(address => uint256[]) public issuerCertificates;
    mapping(string => bool) private usedHashes; // Prevent duplicate certificates

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
    event MetadataUpdated(uint256 indexed tokenId, string newMetadataURI);

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

    constructor() ERC721("VerifyCert Certificate", "VCERT") {
        // Owner is automatically an authorized issuer
        authorizedIssuers[msg.sender] = true;
    }

    /**
     * @dev Issue a new certificate
     * @param recipient Address of the certificate recipient
     * @param recipientName Name of the recipient
     * @param courseName Name of the course/achievement
     * @param institutionName Name of the issuing institution
     * @param metadataURI URI for certificate metadata (IPFS)
     * @param metadataHash Hash of the metadata for integrity verification
     */
    function issueCertificate(
        address recipient,
        string memory recipientName,
        string memory courseName,
        string memory institutionName,
        string memory metadataURI,
        string memory metadataHash
    ) public onlyAuthorizedIssuer whenNotPaused nonReentrant returns (uint256) {
        require(recipient != address(0), "Invalid recipient address");
        require(bytes(recipientName).length > 0, "Recipient name required");
        require(bytes(courseName).length > 0, "Course name required");
        require(bytes(institutionName).length > 0, "Institution name required");
        require(bytes(metadataHash).length > 0, "Metadata hash required");
        require(!usedHashes[metadataHash], "Certificate with this hash already exists");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Mint the certificate NFT
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, metadataURI);

        // Store certificate data
        certificates[tokenId] = CertificateData({
            recipientName: recipientName,
            courseName: courseName,
            institutionName: institutionName,
            issueDate: block.timestamp,
            issuer: msg.sender,
            isRevoked: false,
            metadataHash: metadataHash
        });

        // Track certificates by recipient and issuer
        recipientCertificates[recipient].push(tokenId);
        issuerCertificates[msg.sender].push(tokenId);
        usedHashes[metadataHash] = true;

        emit CertificateIssued(tokenId, recipient, msg.sender, recipientName, courseName, institutionName);
        
        return tokenId;
    }

    /**
     * @dev Revoke a certificate (can only be done by issuer or owner)
     * @param tokenId ID of the certificate to revoke
     */
    function revokeCertificate(uint256 tokenId) 
        public 
        certificateExists(tokenId) 
        notRevoked(tokenId) 
        whenNotPaused 
    {
        require(
            certificates[tokenId].issuer == msg.sender || msg.sender == owner(),
            "Only issuer or owner can revoke certificate"
        );

        certificates[tokenId].isRevoked = true;
        emit CertificateRevoked(tokenId, msg.sender);
    }

    /**
     * @dev Authorize a new issuer (only owner)
     * @param issuer Address to authorize as issuer
     */
    function authorizeIssuer(address issuer) public onlyOwner {
        require(issuer != address(0), "Invalid issuer address");
        require(!authorizedIssuers[issuer], "Issuer already authorized");
        
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer, msg.sender);
    }

    /**
     * @dev Revoke issuer authorization (only owner)
     * @param issuer Address to revoke authorization from
     */
    function revokeIssuerAuthorization(address issuer) public onlyOwner {
        require(authorizedIssuers[issuer], "Issuer not authorized");
        require(issuer != owner(), "Cannot revoke owner authorization");
        
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer, msg.sender);
    }

    /**
     * @dev Update certificate metadata URI (only issuer or owner)
     * @param tokenId ID of the certificate
     * @param newMetadataURI New metadata URI
     */
    function updateMetadataURI(uint256 tokenId, string memory newMetadataURI) 
        public 
        certificateExists(tokenId) 
        whenNotPaused 
    {
        require(
            certificates[tokenId].issuer == msg.sender || msg.sender == owner(),
            "Only issuer or owner can update metadata"
        );
        require(bytes(newMetadataURI).length > 0, "Metadata URI required");

        _setTokenURI(tokenId, newMetadataURI);
        emit MetadataUpdated(tokenId, newMetadataURI);
    }

    /**
     * @dev Get certificate data
     * @param tokenId ID of the certificate
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
     * @dev Get certificates owned by an address
     * @param owner Address to query
     */
    function getCertificatesByOwner(address owner) public view returns (uint256[] memory) {
        return recipientCertificates[owner];
    }

    /**
     * @dev Get certificates issued by an address
     * @param issuer Address to query
     */
    function getCertificatesByIssuer(address issuer) public view returns (uint256[] memory) {
        return issuerCertificates[issuer];
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
     * @dev Verify certificate authenticity using metadata hash
     * @param tokenId ID of the certificate
     * @param providedHash Hash to verify against
     */
    function verifyCertificateHash(uint256 tokenId, string memory providedHash) 
        public 
        view 
        certificateExists(tokenId) 
        returns (bool) 
    {
        return keccak256(abi.encodePacked(certificates[tokenId].metadataHash)) == 
               keccak256(abi.encodePacked(providedHash));
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

    // Emergency functions
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // Override required by Solidity
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