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
 * @notice This contract implements a certificate system where certificates are issued as NFTs
 * but cannot be transferred, ensuring they remain with the original recipient
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
        bytes32 certificateHash; // Hash of certificate content for integrity
    }

    // Mappings
    mapping(uint256 => CertificateData) public certificates;
    mapping(address => bool) public authorizedIssuers;
    mapping(address => uint256[]) public recipientCertificates;
    mapping(address => uint256[]) public issuerCertificates;
    mapping(bytes32 => uint256) public certificateHashToTokenId;

    // Events
    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        address indexed issuer,
        string recipientName,
        string courseName,
        string institutionName,
        bytes32 certificateHash
    );
    
    event CertificateRevoked(
        uint256 indexed tokenId, 
        address indexed revoker,
        string reason
    );
    
    event IssuerAuthorized(address indexed issuer, address indexed authorizer);
    event IssuerRevoked(address indexed issuer, address indexed revoker);
    
    event CertificateMetadataUpdated(
        uint256 indexed tokenId,
        string newMetadataURI
    );

    // Modifiers
    modifier onlyAuthorizedIssuer() {
        require(
            authorizedIssuers[msg.sender] || msg.sender == owner(), 
            "Certificate: Not authorized to issue certificates"
        );
        _;
    }

    modifier certificateExists(uint256 tokenId) {
        require(_exists(tokenId), "Certificate: Certificate does not exist");
        _;
    }

    modifier notRevoked(uint256 tokenId) {
        require(
            !certificates[tokenId].isRevoked, 
            "Certificate: Certificate has been revoked"
        );
        _;
    }

    modifier onlyIssuerOrOwner(uint256 tokenId) {
        require(
            msg.sender == certificates[tokenId].issuer || msg.sender == owner(),
            "Certificate: Only issuer or owner can perform this action"
        );
        _;
    }

    constructor() ERC721("VerifyCert Certificate", "VCERT") {
        // Start token IDs from 1 instead of 0
        _tokenIdCounter.increment();
    }

    /**
     * @dev Issue a new certificate
     * @param recipient Address of the certificate recipient
     * @param recipientName Name of the certificate recipient
     * @param courseName Name of the course or program
     * @param institutionName Name of the issuing institution
     * @param expiryDate Expiry timestamp (0 for no expiry)
     * @param metadataURI URI pointing to certificate metadata
     * @return tokenId The ID of the newly minted certificate
     */
    function issueCertificate(
        address recipient,
        string memory recipientName,
        string memory courseName,
        string memory institutionName,
        uint256 expiryDate,
        string memory metadataURI
    ) public onlyAuthorizedIssuer nonReentrant returns (uint256) {
        require(recipient != address(0), "Certificate: Invalid recipient address");
        require(bytes(recipientName).length > 0, "Certificate: Recipient name required");
        require(bytes(courseName).length > 0, "Certificate: Course name required");
        require(bytes(institutionName).length > 0, "Certificate: Institution name required");
        require(
            expiryDate == 0 || expiryDate > block.timestamp, 
            "Certificate: Invalid expiry date"
        );

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Generate certificate hash for integrity verification
        bytes32 certificateHash = keccak256(
            abi.encodePacked(
                recipient,
                recipientName,
                courseName,
                institutionName,
                block.timestamp,
                msg.sender,
                tokenId
            )
        );

        // Ensure certificate hash is unique
        require(
            certificateHashToTokenId[certificateHash] == 0,
            "Certificate: Duplicate certificate detected"
        );

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
            metadataURI: metadataURI,
            certificateHash: certificateHash
        });

        // Update mappings
        recipientCertificates[recipient].push(tokenId);
        issuerCertificates[msg.sender].push(tokenId);
        certificateHashToTokenId[certificateHash] = tokenId;

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
     * @dev Issue a certificate with basic parameters (backward compatibility)
     */
    function issueCertificateBasic(
        address recipient,
        string memory recipientName,
        string memory courseName,
        string memory institutionName
    ) public onlyAuthorizedIssuer returns (uint256) {
        return issueCertificate(recipient, recipientName, courseName, institutionName, 0, "");
    }

    /**
     * @dev Revoke a certificate
     * @param tokenId ID of the certificate to revoke
     * @param reason Reason for revocation
     */
    function revokeCertificate(uint256 tokenId, string memory reason) 
        public 
        certificateExists(tokenId) 
        notRevoked(tokenId)
        onlyIssuerOrOwner(tokenId)
    {
        certificates[tokenId].isRevoked = true;
        emit CertificateRevoked(tokenId, msg.sender, reason);
    }

    /**
     * @dev Update certificate metadata URI
     * @param tokenId ID of the certificate
     * @param newMetadataURI New metadata URI
     */
    function updateCertificateMetadata(uint256 tokenId, string memory newMetadataURI)
        public
        certificateExists(tokenId)
        onlyIssuerOrOwner(tokenId)
    {
        certificates[tokenId].metadataURI = newMetadataURI;
        _setTokenURI(tokenId, newMetadataURI);
        emit CertificateMetadataUpdated(tokenId, newMetadataURI);
    }

    /**
     * @dev Authorize an issuer
     */
    function authorizeIssuer(address issuer) public onlyOwner {
        require(issuer != address(0), "Certificate: Invalid issuer address");
        require(!authorizedIssuers[issuer], "Certificate: Issuer already authorized");
        
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer, msg.sender);
    }

    /**
     * @dev Revoke issuer authorization
     */
    function revokeIssuer(address issuer) public onlyOwner {
        require(authorizedIssuers[issuer], "Certificate: Issuer not authorized");
        
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
        return _tokenIdCounter.current() - 1; // Subtract 1 since we start from 1
    }

    /**
     * @dev Verify certificate integrity using hash
     * @param tokenId ID of the certificate
     * @param expectedHash Expected certificate hash
     * @return bool indicating if certificate hash matches
     */
    function verifyCertificateIntegrity(uint256 tokenId, bytes32 expectedHash) 
        public 
        view 
        certificateExists(tokenId)
        returns (bool) 
    {
        return certificates[tokenId].certificateHash == expectedHash;
    }

    /**
     * @dev Check if an address is an authorized issuer
     * @param issuer Address to check
     * @return bool indicating if address is authorized
     */
    function isAuthorizedIssuer(address issuer) public view returns (bool) {
        return authorizedIssuers[issuer] || issuer == owner();
    }

    /**
     * @dev Get certificate by hash
     * @param certificateHash Hash of the certificate
     * @return tokenId Token ID associated with the hash
     */
    function getCertificateByHash(bytes32 certificateHash) 
        public 
        view 
        returns (uint256) 
    {
        uint256 tokenId = certificateHashToTokenId[certificateHash];
        require(tokenId > 0, "Certificate: Certificate not found for hash");
        return tokenId;
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
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        
        // Clean up mappings
        bytes32 certHash = certificates[tokenId].certificateHash;
        delete certificates[tokenId];
        if (certHash != bytes32(0)) {
            delete certificateHashToTokenId[certHash];
        }
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