// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Certificate is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
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
    
    mapping(uint256 => CertificateData) private certificates;
    mapping(address => bool) public authorizedIssuers;
    
    event CertificateMinted(uint256 indexed tokenId, address indexed recipient, address indexed issuer);
    event CertificateRevoked(uint256 indexed tokenId);
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);
    
    error CertificateNotFound();
    error UnauthorizedIssuer();
    error TransferNotAllowed();
    error CertificateAlreadyRevoked();
    
    constructor() ERC721("VerifyCert", "VCERT") {
        authorizedIssuers[msg.sender] = true;
    }
    
    modifier onlyAuthorizedIssuer() {
        if (!authorizedIssuers[msg.sender]) revert UnauthorizedIssuer();
        _;
    }
    
    function mintCertificate(
        address recipient,
        string memory recipientName,
        string memory courseName,
        string memory institutionName,
        string memory metadataURI
    ) external onlyAuthorizedIssuer returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        certificates[tokenId] = CertificateData({
            issuer: msg.sender,
            recipient: recipient,
            recipientName: recipientName,
            courseName: courseName,
            institutionName: institutionName,
            issueDate: block.timestamp,
            metadataURI: metadataURI,
            isValid: true
        });
        
        _safeMint(recipient, tokenId);
        
        emit CertificateMinted(tokenId, recipient, msg.sender);
        return tokenId;
    }
    
    function getCertificate(uint256 tokenId) external view returns (CertificateData memory) {
        if (!_exists(tokenId)) revert CertificateNotFound();
        return certificates[tokenId];
    }
    
    function verifyCertificate(uint256 tokenId) external view returns (bool) {
        if (!_exists(tokenId)) return false;
        return certificates[tokenId].isValid;
    }
    
    function revokeCertificate(uint256 tokenId) external {
        if (!_exists(tokenId)) revert CertificateNotFound();
        
        CertificateData storage cert = certificates[tokenId];
        if (msg.sender != cert.issuer && msg.sender != owner()) {
            revert UnauthorizedIssuer();
        }
        if (!cert.isValid) revert CertificateAlreadyRevoked();
        
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
    
    function getCertificatesByIssuer(address issuer) external view returns (uint256[] memory) {
        uint256 totalSupply = _tokenIdCounter.current();
        uint256[] memory result = new uint256[](totalSupply);
        uint256 counter = 0;
        
        for (uint256 i = 0; i < totalSupply; i++) {
            if (_exists(i) && certificates[i].issuer == issuer) {
                result[counter] = i;
                counter++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory trimmedResult = new uint256[](counter);
        for (uint256 i = 0; i < counter; i++) {
            trimmedResult[i] = result[i];
        }
        
        return trimmedResult;
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
    
    function approve(address, uint256) public pure override {
        revert TransferNotAllowed();
    }
    
    function setApprovalForAll(address, bool) public pure override {
        revert TransferNotAllowed();
    }
    
    function getApproved(uint256) public pure override returns (address) {
        return address(0);
    }
    
    function isApprovedForAll(address, address) public pure override returns (bool) {
        return false;
    }
}