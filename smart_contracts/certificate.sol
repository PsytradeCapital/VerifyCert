// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Certificate
 * @dev Non-transferable ERC721 token for digital certificates
 * @notice This contract implements certificates as non-transferable NFTs
 */
contract Certificate is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;

    // Token ID counter
    Counters.Counter private _tokenIdCounter;

    // Certificate structure
    struct CertificateData {
        string recipientName;
        string courseName;
        string institutionName;
        uint256 issueDate;
        uint256 expiryDate;
        bool isRevoked;
        address issuer;
        string certificateHash;
    }

    // Mappings
    mapping(uint256 => CertificateData) public certificates;
    mapping(address => bool) public authorizedIssuers;
    mapping(string => uint256) public hashToTokenId;
    mapping(string => bool) public usedHashes;
    mapping(address => uint256[]) public issuerCertificates;

    // Events
    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        address indexed issuer,
        string recipientName,
        string courseName,
        string institutionName,
        string certificateHash
    );

    event CertificateRevoked(
        uint256 indexed tokenId,
        address indexed revoker,
        string reason
    );

    event IssuerAuthorized(address indexed issuer, address indexed authorizer);
    event IssuerRevokeIssuers[msg.sender] || msg.sender == owner(),
            "Certificate: Not authorized to issue certificates"
        );
        _;
    }
    
    modifier validRecipient(address recipient) {
        require(recipient != address(0), "Certificate: Invalid recipient address");
        _;
    }
    
    modifier certificateExists(uint256 tokenId) {
        require(_exists(tokenId), "Certificate: Certificate does not exist");
        _;
    }
    
    constructor() ERC721("VerifyCert Certificate", "VCERT") {
        // Owner is automatically authorized to issue certificates
        authorizedIssuers[msg.sender] = true;
    }
    
    /**
     * @dev Issue a new certificate
     * @param recipient Address of the certificate recipient
     * @param recipientName Name of the certificate recipient
     * @param courseName Name of the course/program
     * @param institutionName Name of the issuing institution
     * @param expiryDate Expiry date of the certificate (0 for no expiry)
     * @param certificateHash Unique hash of the certificate content
     */
    function issueCertificate(
        address recipient,
        string memory recipientName,
        string memory courseName,
        string memory institutionName,
        uint256 expiryDate,
        string memory certificateHash
    ) 
        external 
        onlyAuthorizedIssuer 
        validRecipient(recipient) 
        nonReentrant 
        returns (uint256) 
    {
        require(bytes(recipientName).length > 0, "Certificate: Recipient name required");
        require(bytes(courseName).length > 0, "Certificate: Course name required");
        require(bytes(institutionName).length > 0, "Certificate: Institution name required");
        require(bytes(certificateHash).length > 0, "Certificate: Certificate hash required");
        require(!usedHashes[certificateHash], "Certificate: Hash already used");
        
        if (expiryDate > 0) {
            require(expiryDate > block.timestamp, "Certificate: Expiry date must be in the future");
        }
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Store certificate data
        certificates[tokenId] = CertificateData({
            recipientName: recipientName,
            courseName: courseName,
            institutionName: institutionName,
            issueDate: block.timestamp,
            expiryDate: expiryDate,
            isRevoked: false,
            issuer: msg.sender,
            certificateHash: certificateHash
        });
        
        // Mark hash as used and map to token ID
        usedHashes[certificateHash] = true;
        hashToTokenId[certificateHash] = tokenId;
        
        // Mint the NFT
        _safeMint(recipient, tokenId);
        
        emit CertificateIssued(
            tokenId,
            recipient,
            msg.sender,
            recipientName,
            courseName,
            institutionName,
            certificateHash
        );
        
        return tokenId;
    }
    
    /**
     * @dev Revoke a certificate
     * @param tokenId ID of the certificate to revoke
     * @param reason Reason for revocation
     */
    function revokeCertificate(uint256 tokenId, string memory reason) 
        external 
        certificateExists(tokenId) 
    {
        CertificateData storage cert = certificates[tokenId];
        
        // Only the issuer or contract owner can revoke
        require(
            msg.sender == cert.issuer || msg.sender == owner(),
            "Certificate: Not authorized to revoke this certificate"
        );
        
        require(!cert.isRevoked, "Certificate: Certificate already revoked");
        
        cert.isRevoked = true;
        
        emit CertificateRevoked(tokenId, msg.sender, reason);
    }
    
    /**
     * @dev Verify certificate by token ID
     * @param tokenId ID of the certificate to verify
     * @return isValid True if certificate is valid
     * @return isExpired True if certificate is expired
     * @return isRevoked True if certificate is revoked
     * @return certificateData The certificate data
     */
    function verifyCertificate(uint256 tokenId) 
        external 
        view 
        certificateExists(tokenId)
        returns (
            bool isValid,
            bool isExpired,
            bool isRevoked,
            CertificateData memory certificateData
        ) 
    {
        CertificateData memory cert = certificates[tokenId];
        
        isRevoked = cert.isRevoked;
        isExpired = cert.expiryDate > 0 && block.timestamp > cert.expiryDate;
        isValid = !isRevoked && !isExpired;
        certificateData = cert;
    }
    
    /**
     * @dev Verify certificate by hash
     * @param certificateHash Hash of the certificate to verify
     * @return exists True if certificate exists
     * @return tokenId ID of the certificate
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
     * @dev Authorize an address to issue certificates
     * @param issuer Address to authorize
     */
    function authorizeIssuer(address issuer) external onlyOwner {
        require(issuer != address(0), "Certificate: Invalid issuer address");
        require(!authorizedIssuers[issuer], "Certificate: Issuer already authorized");
        
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer, msg.sender);
    }
    
    /**
     * @dev Revoke issuer authorization
     * @param issuer Address to revoke authorization from
     */
    function revokeIssuer(address issuer) external onlyOwner {
        require(authorizedIssuers[issuer], "Certificate: Issuer not authorized");
        require(issuer != owner(), "Certificate: Cannot revoke owner authorization");
        
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer, msg.sender);
    }
    
    /**
     * @dev Get certificates issued by a specific issuer
     * @param issuer Address of the issuer
     * @param offset Starting index for pagination
     * @param limit Maximum number of certificates to return
     * @return tokenIds Array of token IDs
     * @return hasMore True if there are more certificates
     */
    function getCertificatesByIssuer(address issuer, uint256 offset, uint256 limit) 
        external 
        view 
        returns (uint256[] memory tokenIds, bool hasMore) 
    {
        require(limit > 0 && limit <= 100, "Certificate: Invalid limit");
        
        uint256 totalSupply = _tokenIdCounter.current();
        uint256[] memory tempTokenIds = new uint256[](limit);
        uint256 count = 0;
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < totalSupply && count < limit; i++) {
            if (_exists(i) && certificates[i].issuer == issuer) {
                if (currentIndex >= offset) {
                    tempTokenIds[count] = i;
                    count++;
                }
                currentIndex++;
            }
        }
        
        // Create array with exact size
        tokenIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            tokenIds[i] = tempTokenIds[i];
        }
        
        // Check if there are more certificates
        hasMore = false;
        for (uint256 i = 0; i < totalSupply; i++) {
            if (_exists(i) && certificates[i].issuer == issuer) {
                currentIndex++;
                if (currentIndex > offset + limit) {
                    hasMore = true;
                    break;
                }
            }
        }
    }
    
    /**
     * @dev Get total number of certificates issued
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Override transfer functions to make certificates non-transferable
     */
    function transferFrom(address, address, uint256) public pure override {
        revert("Certificate: Certificates are non-transferable");
    }
    
    function safeTransferFrom(address, address, uint256) public pure override {
        revert("Certificate: Certificates are non-transferable");
    }
    
    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("Certificate: Certificates are non-transferable");
    }
    
    function approve(address, uint256) public pure override {
        revert("Certificate: Certificates are non-transferable");
    }
    
    function setApprovalForAll(address, bool) public pure override {
        revert("Certificate: Certificates are non-transferable");
    }
    
    /**
     * @dev Override tokenURI to return certificate metadata
     */
    function tokenURI(uint256 tokenId) public view override certificateExists(tokenId) returns (string memory) {
        CertificateData memory cert = certificates[tokenId];
        
        // In production, this would return a proper JSON metadata URI
        // For now, return a simple string representation
        return string(abi.encodePacked(
            "Certificate for ", cert.recipientName,
            " - ", cert.courseName,
            " from ", cert.institutionName
        ));
    }
    
    /**
     * @dev Check if certificate is expired
     */
    function isExpired(uint256 tokenId) external view certificateExists(tokenId) returns (bool) {
        CertificateData memory cert = certificates[tokenId];
        return cert.expiryDate > 0 && block.timestamp > cert.expiryDate;
    }
    
    /**
     * @dev Emergency pause function (if needed in future)
     */
    function pause() external onlyOwner {
        // Implementation for pausing contract if needed
        // This is a placeholder for future emergency functionality
    }
}