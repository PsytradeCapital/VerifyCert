// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title Certificate
 * @dev Non-transferable ERC721 certificate contract for VerifyCert system
 * @notice This contract issues certificates as NFTs that cannot be transferred after minting
 */
contract Certificate is ERC721, Ownable {
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
    
    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        string recipientName,
        string courseName,
        string institutionName,
        address indexed issuer
    );
    
    event CertificateRevoked(uint256 indexed tokenId);
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);
    
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender] || msg.sender == owner(), "Not authorized to issue certificates");
        _;
    }
    
    constructor() ERC721("VerifyCert Certificate", "VCERT") {}
    
    function issueCertificate(
        address recipient,
        string memory recipientName,
        string memory courseName,
        string memory institutionName
    ) public onlyAuthorizedIssuer returns (uint256) {
        require(recipient != address(0), "Invalid recipient address");
        require(bytes(recipientName).length > 0, "Recipient name required");
        require(bytes(courseName).length > 0, "Course name required");
        require(bytes(institutionName).length > 0, "Institution name required");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(recipient, newTokenId);
        
        certificates[newTokenId] = CertificateData({
            recipientName: recipientName,
            courseName: courseName,
            institutionName: institutionName,
            issueDate: block.timestamp,
            isRevoked: false,
            issuer: msg.sender
        });
        
        emit CertificateIssued(newTokenId, recipient, recipientName, courseName, institutionName, msg.sender);
        
        return newTokenId;
    }
    
    function revokeCertificate(uint256 tokenId) public {
        require(_exists(tokenId), "Certificate does not exist");
        require(
            certificates[tokenId].issuer == msg.sender || msg.sender == owner(),
            "Only issuer or owner can revoke certificate"
        );
        require(!certificates[tokenId].isRevoked, "Certificate already revoked");
        
        certificates[tokenId].isRevoked = true;
        emit CertificateRevoked(tokenId);
    }
    
    function authorizeIssuer(address issuer) public onlyOwner {
        require(issuer != address(0), "Invalid issuer address");
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }
    
    function revokeIssuer(address issuer) public onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }
    
    function getCertificate(uint256 tokenId) public view returns (CertificateData memory) {
        require(_exists(tokenId), "Certificate does not exist");
        return certificates[tokenId];
    }
    
    function isValidCertificate(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId) && !certificates[tokenId].isRevoked;
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
    
    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}