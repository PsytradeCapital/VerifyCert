// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title Certificate
 * @dev Non-transferable ERC721 certificate contract for VerifyCert system
 * Implements tamper-proof digital certificates as NFTs on Polygon Mumbai
 */
contract Certificate is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Certificate metadata structure
    struct CertificateData {
        string recipientName;
        string courseName;
        string institutionName;
        uint256 issueDate;
        uint256 expiryDate;
        bool isRevoked;
        address issuer;
        string certificateHash;
        string metadataURI;
    }

    // Mappings
    mapping(uint256 => CertificateData) public certificates;
    mapping(address => bool) public authorizedIssuers;
    mapping(string => uint256) public hashToTokenId;
    mapping(string => bool) public usedHashes;
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

    modifier validTokenId(uint256 tokenId) {
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
     * @param recipient Address of the certificate recipient
     * @param recipientName Name of the certificate recipient
     * @param courseName Name of the course/program
     * @param institutionName Name of the issuing institution
     * @param expiryDate Expiry date (0 for no expiry)
     * @param metadataURI IPFS URI for certificate metadata
     * @param certificateHash Unique hash for certificate verification
     */
    function issueCertificate(
        address recipient,
        string memory recipientName,
        string memory courseName,
        string memory institutionName,
        uint256 expiryDate,
        string memory metadataURI,
        string memory certificateHash
    ) public onlyAuthorizedIssuer nonReentrant whenNotPaused returns (uint256) {
        require(recipient != address(0), "Certificate: Invalid recipient address");
        require(bytes(recipientName).length > 0, "Certificate: Recipient name required");
        require(bytes(courseName).length > 0, "Certificate: Course name required");
        require(bytes(institutionName).length > 0, "Certificate: Institution name required");
        require(bytes(certificateHash).length > 0, "Certificate: Certificate hash required");
        require(!usedHashes[certificateHash], "Certificate: Hash already exists");

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
            expiryDate: expiryDate,
            isRevoked: false,
            issuer: msg.sender,
            certificateHash: certificateHash,
            metadataURI: metadataURI
        });

        // Mark hash as used and map to token ID
        usedHashes[certificateHash] = true;
        hashToTokenId[certificateHash] = tokenId;
        
        // Add to recipient's and issuer's certificates
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
     * @dev Revoke a certificate
     * @param tokenId ID of the certificate to revoke
     */
    function revokeCertificate(uint256 tokenId) 
        public 
        validTokenId(tokenId) 
        notRevoked(tokenId) 
        whenNotPaused
    {
        require(
            msg.sender == owner() || 
            msg.sender == certificates[tokenId].issuer,
            "Certificate: Not authorized to revoke this certificate"
        );

        certificates[tokenId].isRevoked = true;
        emit CertificateRevoked(tokenId, msg.sender);
    }

    /**
     * @dev Get certificate data by token ID
     * @param tokenId Token ID of the certificate
     * @return certificateData Certificate data struct
     */
    function getCertificate(uint256 tokenId) 
        external 
        view 
        validTokenId(tokenId) 
        returns (CertificateData memory certificateData) 
    {
        return certificates[tokenId];
    }

    /**
     * @dev Verify certificate by hash with detailed status
     * @param certificateHash Hash to verify
     * @return exists True if certificate exists
     * @return tokenId Token ID of the certificate
     * @return isValid True if certificate is valid
     * @return isExpired True if certificate is expired
     * @return isRevoked True if certificate is revoked
     */
    function verifyCertificateByHash(string memory certificateHash)
        external
        view
        returns (
            bool exists,
            uint256 tokenId,
            bool isValid,
            bool isExpired,
            bool isRevoked
        )
    {
        exists = usedHashes[certificateHash];
        if (!exists) {
            return (false, 0, false, false, false);
        }

        tokenId = hashToTokenId[certificateHash];
        CertificateData memory cert = certificates[tokenId];
        
        isRevoked = cert.isRevoked;
        isExpired = cert.expiryDate > 0 && block.timestamp > cert.expiryDate;
        isValid = !isRevoked && !isExpired;
    }

    /**
     * @dev Get certificates issued by a specific issuer
     * @param issuer Issuer address
     * @param offset Starting index
     * @param limit Maximum number of certificates to return
     * @return tokenIds Array of token IDs
     * @return hasMore True if there are more certificates
     */
    function getCertificatesByIssuer(
        address issuer,
        uint256 offset,
        uint256 limit
    ) external view returns (uint256[] memory tokenIds, bool hasMore) {
        uint256[] memory issuerTokens = issuerCertificates[issuer];
        uint256 totalCount = issuerTokens.length;

        if (offset >= totalCount) {
            return (new uint256[](0), false);
        }

        uint256 endIndex = offset + limit;
        if (endIndex > totalCount) {
            endIndex = totalCount;
        }

        uint256 resultLength = endIndex - offset;
        tokenIds = new uint256[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            tokenIds[i] = issuerTokens[offset + i];
        }

        hasMore = endIndex < totalCount;
    }

    /**
     * @dev Get certificates owned by a specific recipient
     * @param recipient Recipient address
     * @param offset Starting index
     * @param limit Maximum number of certificates to return
     * @return tokenIds Array of token IDs
     * @return hasMore True if there are more certificates
     */
    function getCertificatesByRecipient(
        address recipient,
        uint256 offset,
        uint256 limit
    ) external view returns (uint256[] memory tokenIds, bool hasMore) {
        uint256[] memory recipientTokens = recipientCertificates[recipient];
        uint256 totalCount = recipientTokens.length;

        if (offset >= totalCount) {
            return (new uint256[](0), false);
        }

        uint256 endIndex = offset + limit;
        if (endIndex > totalCount) {
            endIndex = totalCount;
        }

        uint256 resultLength = endIndex - offset;
        tokenIds = new uint256[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            tokenIds[i] = recipientTokens[offset + i];
        }

        hasMore = endIndex < totalCount;
    }

    /**
     * @dev Authorize an issuer
     * @param issuer Address to authorize
     */
    function authorizeIssuer(address issuer) external onlyOwner {
        require(issuer != address(0), "Certificate: Invalid issuer address");
        require(!authorizedIssuers[issuer], "Certificate: Already authorized");

        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer, msg.sender);
    }

    /**
     * @dev Revoke issuer authorization
     * @param issuer Address to revoke
     */
    function revokeIssuer(address issuer) external onlyOwner {
        require(authorizedIssuers[issuer], "Certificate: Not an authorized issuer");
        require(issuer != owner(), "Certificate: Cannot revoke owner");

        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer, msg.sender);
    }

    /**
     * @dev Get total number of certificates issued
     */
    function totalSupply() public view override returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Override tokenURI to return custom metadata
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) validTokenId(tokenId) returns (string memory) {
        string memory metadataURI = certificates[tokenId].metadataURI;
        if (bytes(metadataURI).length > 0) {
            return metadataURI;
        }
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Pause the contract (emergency use)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Override transfer functions to make tokens non-transferable
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        // Allow minting (from == address(0)) but not transfers
        require(from == address(0), "Certificate: Certificates are non-transferable");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /**
     * @dev Override approve to prevent approvals
     */
    function approve(address, uint256) public pure override {
        revert("Certificate: Certificates are non-transferable");
    }

    /**
     * @dev Override setApprovalForAll to prevent approvals
     */
    function setApprovalForAll(address, bool) public pure override {
        revert("Certificate: Certificates are non-transferable");
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

    /**
     * @dev Required override for ERC721Enumerable
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Override _burn to handle URI storage
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}