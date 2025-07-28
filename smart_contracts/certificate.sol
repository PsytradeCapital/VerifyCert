// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title Certificate
 * @dev Non-transferable ERC721 token for digital certificates
 * @notice This contract implements certificates as non-transferable NFTs
 */
contract Certificate is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;

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
    event IssuerRevoked(address indexed issuer, address indexed revoker);

    // Modifiers
    modifier onlyAuthorizedIssuer() {
        require(
            authorizedIssuers[msg.sender] || msg.sender == owner(),
            "Certificate: Not authorized to issue certificates"
        );
        _;
    }

    modifier validRecipient(address recipient) {
        require(recipient != address(0), "Certificate: Invalid recipient address");
        require(recipient != address(this), "Certificate: Cannot issue to contract");
        _;
    }

    modifier certificateExists(uint256 tokenId) {
        require(_exists(tokenId), "Certificate: Certificate does not exist");
        _;
    }

    constructor() ERC721("VerifyCert Certificate", "VCERT") {
        // Owner is automatically authorized
        authorizedIssuers[msg.sender] = true;
    }

    /**
     * @dev Issue a new certificate
     * @param recipient Address to receive the certificate
     * @param recipientName Name of the certificate recipient
     * @param courseName Name of the course/program
     * @param institutionName Name of the issuing institution
     * @param expiryDate Expiry date (0 for no expiry)
     * @param certificateHash Unique hash for the certificate
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
        whenNotPaused
        returns (uint256)
    {
        require(bytes(recipientName).length > 0, "Certificate: Recipient name required");
        require(bytes(courseName).length > 0, "Certificate: Course name required");
        require(bytes(institutionName).length > 0, "Certificate: Institution name required");
        require(bytes(certificateHash).length > 0, "Certificate: Certificate hash required");
        require(!usedHashes[certificateHash], "Certificate: Hash already used");
        
        if (expiryDate > 0) {
            require(expiryDate > block.timestamp, "Certificate: Expiry date must be in future");
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
        issuerCertificates[msg.sender].push(tokenId);

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
     * @param tokenId Token ID of the certificate to revoke
     * @param reason Reason for revocation
     */
    function revokeCertificate(uint256 tokenId, string memory reason) 
        external 
        certificateExists(tokenId)
        nonReentrant
    {
        CertificateData storage cert = certificates[tokenId];
        require(!cert.isRevoked, "Certificate: Already revoked");
        require(
            msg.sender == cert.issuer || msg.sender == owner(),
            "Certificate: Not authorized to revoke"
        );

        cert.isRevoked = true;

        emit CertificateRevoked(tokenId, msg.sender, reason);
    }

    /**
     * @dev Verify certificate by token ID
     * @param tokenId Token ID to verify
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
     * @param issuer Address of the issuer
     * @param offset Starting index for pagination
     * @param limit Maximum number of certificates to return
     * @return tokenIds Array of token IDs
     * @return hasMore True if there are more certificates
     */
    function getCertificatesByIssuer(
        address issuer,
        uint256 offset,
        uint256 limit
    ) 
        external 
        view 
        returns (uint256[] memory tokenIds, bool hasMore)
    {
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
     * @param issuer Address to revoke authorization from
     */
    function revokeIssuerAuthorization(address issuer) external onlyOwner {
        require(authorizedIssuers[issuer], "Certificate: Not authorized");
        require(issuer != owner(), "Certificate: Cannot revoke owner");
        
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer, msg.sender);
    }

    /**
     * @dev Check if an address is an authorized issuer
     * @param issuer Address to check
     * @return True if authorized
     */
    function isAuthorizedIssuer(address issuer) external view returns (bool) {
        return authorizedIssuers[issuer] || issuer == owner();
    }

    /**
     * @dev Get total number of certificates issued
     * @return Total supply of certificates
     */
    function totalSupply() public view override returns (uint256) {
        return _tokenIdCounter.current();
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

    // Override transfer functions to make certificates non-transferable
    function transferFrom(address, address, uint256) public pure override(ERC721, IERC721) {
        revert("Certificate: Certificates are non-transferable");
    }

    function safeTransferFrom(address, address, uint256) public pure override(ERC721, IERC721) {
        revert("Certificate: Certificates are non-transferable");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override(ERC721, IERC721) {
        revert("Certificate: Certificates are non-transferable");
    }

    function approve(address, uint256) public pure override(ERC721, IERC721) {
        revert("Certificate: Certificates are non-transferable");
    }

    function setApprovalForAll(address, bool) public pure override(ERC721, IERC721) {
        revert("Certificate: Certificates are non-transferable");
    }

    function getApproved(uint256) public pure override(ERC721, IERC721) returns (address) {
        return address(0);
    }

    function isApprovedForAll(address, address) public pure override(ERC721, IERC721) returns (bool) {
        return false;
    }

    // Required overrides for multiple inheritance
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}