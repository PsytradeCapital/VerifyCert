// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Certificate is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    struct CertificateData {
        string recipientName;
        string courseName;
        string institutionName;
        uint256 issueDate;
        bool isRevoked;
        address issuer;
    }
    
    mapping(uint256 => CertificateData) public certificates;
    mapping(address => bool) public authorizedIssuers;
    mapping(address => uint256[]) public recipientCertificates;
    
    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        address indexed issuer,
        string recipientName,
        string courseName,
        string institutionName
    );
    
    event CertificateRevoked(uint256 indexed tokenId, address indexed revoker);
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);
    
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender] || msg.sender == owner(), "Not authorized to issue certificates");
        _;
    }
    
    modifier certificateExists(uint256 tokenId) {
        require(_exists(tokenId), "Certificate does not exist");
        _;
    }
    
    constructor() ERC721("VerifyCert Certificate", "VCERT") {}
    
    function issueCertificate(
        address recipient,
        string memory recipientName,
        string memory courseName,
        string memory institutionName
    ) external onlyAuthorizedIssuer nonReentrant returns (uint256) {
        require(recipient != address(0), "Invalid recipient address");
        require(bytes(recipientName).length > 0, "Recipient name required");
        require(bytes(courseName).length > 0, "Course name required");
        require(bytes(institutionName).length > 0, "Institution name required");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(recipient, newTokenId);
        
        certificates[newTokenId] = CertificateData({
            recipientName: recipientName,
            courseName: courseName,
            institutionName: institutionName,
            issueDate: block.timestamp,
            isRevoked: false,
            issuer: msg.sender
        });
        
        recipientCertificates[recipient].push(newTokenId);
        
        emit CertificateIssued(
            newTokenId,
            recipient,
            msg.sender,
            recipientName,
            courseName,
            institutionName
        );
        
        return newTokenId;
    }
    
    function revokeCertificate(uint256 tokenId) external certificateExists(tokenId) {
        require(
            msg.sender == owner() || msg.sender == certificates[tokenId].issuer,
            "Only owner or issuer can revoke"
        );
        require(!certificates[tokenId].isRevoked, "Certificate already revoked");
        
        certificates[tokenId].isRevoked = true;
        emit CertificateRevoked(tokenId, msg.sender);
    }
    
    function authorizeIssuer(address issuer) external onlyOwner {
        require(issuer != address(0), "Invalid issuer address");
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }
    
    function revokeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }
    
    function getCertificate(uint256 tokenId) external view certificateExists(tokenId) returns (CertificateData memory) {
        return certificates[tokenId];
    }
    
    function getRecipientCertificates(address recipient) external view returns (uint256[] memory) {
        return recipientCertificates[recipient];
    }
    
    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }
    
    function isValidCertificate(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId) && !certificates[tokenId].isRevoked;
    }
    
    // Override transfer functions to make certificates non-transferable
    function transferFrom(address, address, uint256) public pure override {
        revert("Certificates are non-transferable");
    }
    
    function safeTransferFrom(address, address, uint256) public pure override {
        revert("Certificates are non-transferable");
    }
    
    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("Certificates are non-transferable");
    }
    
    function approve(address, uint256) public pure override {
        revert("Certificates are non-transferable");
    }
    
    function setApprovalForAll(address, bool) public pure override {
        revert("Certificates are non-transferable");
    }
    
    function getApproved(uint256) public pure override returns (address) {
        return address(0);
    }
    
    function isApprovedForAll(address, address) public pure override returns (bool) {
        return false;
    }
}