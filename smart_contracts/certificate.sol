// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Certificate is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    struct CertificateData {
        address issuer;
        address recipient;
        string recipientName;
        string courseName;
        string institutionName;
        uint256 issueDate;
        string metadataURI;
        bool isValid;
    }
    
    mapping(uint256 => CertificateData) public certificates;
    mapping(address => bool) public authorizedIssuers;
    
    event CertificateMinted(uint256 indexed tokenId, address indexed issuer, address indexed recipient);
    event CertificateRevoked(uint256 indexed tokenId);
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);
    
    error UnauthorizedIssuer();
    error InvalidRecipient();
    error CertificateNotFound();
    error CertificateAlreadyRevoked();
    error TransferNotAllowed();
    
    modifier onlyAuthorizedIssuer() {
        if (!authorizedIssuers[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedIssuer();
        }
        _;
    }
    
    constructor() ERC721("VerifyCert", "VCERT") {}
    
    function mintCertificate(
        address recipient,
        string memory recipientName,
        string memory courseName,
        string memory institutionName,
        string memory metadataURI
    ) external onlyAuthorizedIssuer returns (uint256) {
        if (recipient == address(0)) {
            revert InvalidRecipient();
        }
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(recipient, newTokenId);
        
        certificates[newTokenId] = CertificateData({
            issuer: msg.sender,
            recipient: recipient,
            recipientName: recipientName,
            courseName: courseName,
            institutionName: institutionName,
            issueDate: block.timestamp,
            metadataURI: metadataURI,
            isValid: true
        });
        
        emit CertificateMinted(newTokenId, msg.sender, recipient);
        return newTokenId;
    }
    
    function getCertificate(uint256 tokenId) external view returns (CertificateData memory) {
        if (!_exists(tokenId)) {
            revert CertificateNotFound();
        }
        return certificates[tokenId];
    }
    
    function verifyCertificate(uint256 tokenId) external view returns (bool) {
        if (!_exists(tokenId)) {
            return false;
        }
        return certificates[tokenId].isValid;
    }
    
    function revokeCertificate(uint256 tokenId) external {
        if (!_exists(tokenId)) {
            revert CertificateNotFound();
        }
        
        CertificateData storage cert = certificates[tokenId];
        if (msg.sender != cert.issuer && msg.sender != owner()) {
            revert UnauthorizedIssuer();
        }
        
        if (!cert.isValid) {
            revert CertificateAlreadyRevoked();
        }
        
        cert.isValid = false;
        emit CertificateRevoked(tokenId);
    }
    
    function authorizeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }
    
    function revokeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }
    
    // Override transfer functions to make NFTs non-transferable
    function transferFrom(address, address, uint256) public pure override {
        revert TransferNotAllowed();
    }
    
    function safeTransferFrom(address, address, uint256) public pure override {
        revert TransferNotAllowed();
    }
    
    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert TransferNotAllowed();
    }
}