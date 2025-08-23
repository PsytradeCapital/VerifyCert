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
 * @notice This contract creates non-transferable certificate NFTs that can be issued by authorized entities
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
        bool isRevoked;
        address issuer;
        string grade;
        uint256 credits;
        string certificateType;
    }

    // Mapping from token ID to certificate data
    mapping(uint256 => CertificateData) private _certificates;
    
    // Mapping of authorized issuers
    mapping(address => bool) public authorizedIssuers;

    // Events
    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        string recipientName,
        string courseName,
        string institutionName,
        address indexed issuer
    );

    event CertificateRevoked(uint256 indexed tokenId, address indexed revoker);
    event IssuerAuthorized(address indexed issuer, address indexed authorizer);
    event IssuerRevoked(address indexed issuer, address indexed revoker);

    constructor() ERC721("VerifyCert Certificate", "VCERT") {}

    /**
     * @dev Modifier to check if caller is authorized issuer or owner
     */
    modifier onlyAuthorizedIssuer() {
        require(
            authorizedIssuers[msg.sender] || msg.sender == owner(),
            "Not authorized to issue certificates"
        );
        _;
    }

    /**
     * @dev Issue a new certificate
     * @param recipient Address to receive the certificate
     * @param recipientName Name of the certificate recipient
     * @param courseName Name of the course/program
     * @param institutionName Name of the issuing institution
     */
    function issueCertificateBasic(
        address recipient,
        string memory recipientName,
        string memory courseName,
        string memory institutionName
    ) public onlyAuthorizedIssuer nonReentrant returns (uint256) {
        require(recipient != address(0), "Invalid recipient address");
        require(bytes(recipientName).length > 0, "Recipient name required");
        require(bytes(courseName).length > 0, "Course name required");
        require(bytes(institutionName).length > 0, "Institution name required");

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        // Mint the certificate NFT
        _safeMint(recipient, tokenId);

        // Store certificate data
        _certificates[tokenId] = CertificateData({
            recipientName: recipientName,
            courseName: courseName,
            institutionName: institutionName,
            issueDate: block.timestamp,
            isRevoked: false,
            issuer: msg.sender,
            grade: "",
            credits: 0,
            certificateType: "Basic"
        });

        emit CertificateIssued(
            tokenId,
            recipient,
            recipientName,
            courseName,
            institutionName,
            msg.sender
        );

        return tokenId;
    }

    /**
     * @dev Revoke a certificate
     * @param tokenId ID of the certificate to revoke
     */
    function revokeCertificate(uint256 tokenId) public {
        require(_exists(tokenId), "Certificate does not exist");
        
        CertificateData storage cert = _certificates[tokenId];
        require(!cert.isRevoked, "Certificate already revoked");
        require(
            cert.issuer == msg.sender || msg.sender == owner(),
            "Not authorized to revoke this certificate"
        );

        cert.isRevoked = true;
        emit CertificateRevoked(tokenId, msg.sender);
    }

    /**
     * @dev Get certificate data
     * @param tokenId ID of the certificate
     */
    function getCertificate(uint256 tokenId) public view returns (CertificateData memory) {
        require(_exists(tokenId), "Certificate does not exist");
        return _certificates[tokenId];
    }

    /**
     * @dev Check if certificate is valid (exists and not revoked)
     * @param tokenId ID of the certificate
     */
    function isValidCertificate(uint256 tokenId) public view returns (bool) {
        if (!_exists(tokenId)) {
            return false;
        }
        return !_certificates[tokenId].isRevoked;
    }

    /**
     * @dev Authorize an issuer
     * @param issuer Address to authorize
     */
    function authorizeIssuer(address issuer) public onlyOwner {
        require(issuer != address(0), "Invalid issuer address");
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer, msg.sender);
    }

    /**
     * @dev Revoke issuer authorization
     * @param issuer Address to revoke authorization from
     */
    function revokeIssuerAuthorization(address issuer) public onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer, msg.sender);
    }

    /**
     * @dev Check if address is authorized issuer
     * @param issuer Address to check
     */
    function isAuthorizedIssuer(address issuer) public view returns (bool) {
        return authorizedIssuers[issuer] || issuer == owner();
    }

    /**
     * @dev Issue a detailed certificate with additional metadata
     * @param recipient Address to receive the certificate
     * @param recipientName Name of the certificate recipient
     * @param courseName Name of the course/program
     * @param institutionName Name of the issuing institution
     * @param grade Grade or score achieved
     * @param credits Number of credits earned
     * @param certificateType Type of certificate
     */
    function issueCertificateDetailed(
        address recipient,
        string memory recipientName,
        string memory courseName,
        string memory institutionName,
        string memory grade,
        uint256 credits,
        string memory certificateType
    ) public onlyAuthorizedIssuer nonReentrant returns (uint256) {
        require(recipient != address(0), "Invalid recipient address");
        require(bytes(recipientName).length > 0, "Recipient name required");
        require(bytes(courseName).length > 0, "Course name required");
        require(bytes(institutionName).length > 0, "Institution name required");

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        // Mint the certificate NFT
        _safeMint(recipient, tokenId);

        // Store certificate data
        _certificates[tokenId] = CertificateData({
            recipientName: recipientName,
            courseName: courseName,
            institutionName: institutionName,
            issueDate: block.timestamp,
            isRevoked: false,
            issuer: msg.sender,
            grade: grade,
            credits: credits,
            certificateType: bytes(certificateType).length > 0 ? certificateType : "Detailed"
        });

        emit CertificateIssued(
            tokenId,
            recipient,
            recipientName,
            courseName,
            institutionName,
            msg.sender
        );

        return tokenId;
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
        require(from == address(0), "Certificates are non-transferable");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /**
     * @dev Override approve to prevent approvals
     */
    function approve(address, uint256) public pure override {
        revert("Certificates are non-transferable");
    }

    /**
     * @dev Override setApprovalForAll to prevent approvals
     */
    function setApprovalForAll(address, bool) public pure override {
        revert("Certificates are non-transferable");
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