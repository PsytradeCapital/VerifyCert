// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title Certificate
 * @dev Non-transferable ERC721 certificate contract for VerifyCert system
 * @author VerifyCert Team
 */
contract Certificate is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;

    // Token ID counter
    Counters.Counter private _tokenIdCounter;

    // Certificate data structure
    struct CertificateData {
        address issuer;
        string recipientName;
        string courseName;
        string institutionName;
        uint256 issueDate;
        string metadataHash;
        bool isValid;
    }

    // Mappings
    mapping(uint256 => CertificateData) private _certificates;
    mapping(address => bool) private _authorizedIssuers;
    mapping(string => bool) private _usedMetadataHashes;

    // Events
    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        address indexed issuer,
        string recipientName,
        string courseName,
        string institutionName
    );

    event CertificateRevoked(uint256 indexed tokenId, address indexed revokedBy);
    event IssuerAuthorized(address indexed issuer, address indexed authorizedBy);
    event IssuerRevoked(address indexed issuer, address indexed revokedBy);

    // Modifiers
    modifier onlyAuthorizedIssuer() {
        require(_authorizedIssuers[msg.sender] || msg.sender == owner(), "Not authorized to issue certificates");
        _;
    }

    modifier validTokenId(uint256 tokenId) {
        require(_exists(tokenId), "Certificate does not exist");
        _;
    }

    constructor() ERC721("VerifyCert Certificate", "VCERT") {
        // Owner is automatically authorized
        _authorizedIssuers[msg.sender] = true;
    }

    /**
     * @dev Issue a new certificate
     * @param recipient Address of the certificate recipient
     * @param recipientName Name of the certificate recipient
     * @param courseName Name of the course/program
     * @param institutionName Name of the issuing institution
     * @param metadataURI URI pointing to certificate metadata
     * @return tokenId The ID of the newly minted certificate
     */
    function issueCertificate(
        address recipient,
        string memory recipientName,
        string memory courseName,
        string memory institutionName,
        string memory metadataURI
    ) external onlyAuthorizedIssuer nonReentrant whenNotPaused returns (uint256) {
        require(recipient != address(0), "Invalid recipient address");
        require(bytes(recipientName).length > 0, "Recipient name required");
        require(bytes(courseName).length > 0, "Course name required");
        require(bytes(institutionName).length > 0, "Institution name required");

        // Generate metadata hash for uniqueness check
        string memory metadataHash = _generateMetadataHash(
            recipient,
            recipientName,
            courseName,
            institutionName,
            block.timestamp
        );
        
        require(!_usedMetadataHashes[metadataHash], "Certificate with identical data already exists");

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        // Mint the certificate NFT
        _safeMint(recipient, tokenId);
        
        // Set metadata URI if provided
        if (bytes(metadataURI).length > 0) {
            _setTokenURI(tokenId, metadataURI);
        }

        // Store certificate data
        _certificates[tokenId] = CertificateData({
            issuer: msg.sender,
            recipientName: recipientName,
            courseName: courseName,
            institutionName: institutionName,
            issueDate: block.timestamp,
            metadataHash: metadataHash,
            isValid: true
        });

        // Mark metadata hash as used
        _usedMetadataHashes[metadataHash] = true;

        emit CertificateIssued(tokenId, recipient, msg.sender, recipientName, courseName, institutionName);

        return tokenId;
    }

    /**
     * @dev Revoke a certificate
     * @param tokenId ID of the certificate to revoke
     */
    function revokeCertificate(uint256 tokenId) external validTokenId(tokenId) {
        CertificateData storage cert = _certificates[tokenId];
        require(
            msg.sender == cert.issuer || msg.sender == owner(),
            "Only issuer or owner can revoke certificate"
        );
        require(cert.isValid, "Certificate already revoked");

        cert.isValid = false;
        emit CertificateRevoked(tokenId, msg.sender);
    }

    /**
     * @dev Get certificate data
     * @param tokenId ID of the certificate
     * @return Certificate data structure
     */
    function getCertificate(uint256 tokenId) external view validTokenId(tokenId) returns (CertificateData memory) {
        return _certificates[tokenId];
    }

    /**
     * @dev Check if a certificate is valid (exists and not revoked)
     * @param tokenId ID of the certificate
     * @return True if certificate is valid
     */
    function isValidCertificate(uint256 tokenId) external view returns (bool) {
        if (!_exists(tokenId)) {
            return false;
        }
        return _certificates[tokenId].isValid;
    }

    /**
     * @dev Authorize an address to issue certificates
     * @param issuer Address to authorize
     */
    function authorizeIssuer(address issuer) external onlyOwner {
        require(issuer != address(0), "Invalid issuer address");
        require(!_authorizedIssuers[issuer], "Issuer already authorized");
        
        _authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer, msg.sender);
    }

    /**
     * @dev Revoke issuer authorization
     * @param issuer Address to revoke authorization from
     */
    function revokeIssuer(address issuer) external onlyOwner {
        require(_authorizedIssuers[issuer], "Issuer not authorized");
        
        _authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer, msg.sender);
    }

    /**
     * @dev Check if an address is authorized to issue certificates
     * @param issuer Address to check
     * @return True if authorized
     */
    function isAuthorizedIssuer(address issuer) external view returns (bool) {
        return _authorizedIssuers[issuer] || issuer == owner();
    }

    /**
     * @dev Get total number of certificates issued
     * @return Total supply of certificates
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Pause the contract (emergency function)
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
     * @dev Override transfer functions to make certificates non-transferable
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        require(from == address(0), "Certificates are non-transferable");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /**
     * @dev Generate a unique hash for certificate metadata
     */
    function _generateMetadataHash(
        address recipient,
        string memory recipientName,
        string memory courseName,
        string memory institutionName,
        uint256 timestamp
    ) private pure returns (string memory) {
        return string(abi.encodePacked(
            recipient,
            recipientName,
            courseName,
            institutionName,
            timestamp
        ));
    }

    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}