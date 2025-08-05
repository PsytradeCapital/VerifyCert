// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleCertificate is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    
    struct CertificateData {
        string recipientName;
        string courseName;
        string institutionName;
        uint256 issueDate;
        address issuer;
        bool isValid;
    }

    mapping(uint256 => CertificateData) public certificates;
    mapping(address => bool) public authorizedIssuers;
    mapping(uint256 => bool) public revokedCertificates;

    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        address indexed issuer,
        string recipientName,
        string courseName,
        string institutionName,
        uint256 issueDate
    );

    event CertificateRevoked(uint256 indexed tokenId, address indexed revoker);
    event IssuerAuthorized(address indexed issuer, address indexed authorizer);

    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor() ERC721("VerifyCert Certificate", "VCERT") {
        authorizedIssuers[msg.sender] = true;
    }

    function issueCertificate(
        address recipient,
        string memory recipientName,
        string memory courseName,
        string memory institutionName
    ) public onlyAuthorizedIssuer returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(bytes(recipientName).length > 0, "Recipient name required");
        require(bytes(courseName).length > 0, "Course name required");
        require(bytes(institutionName).length > 0, "Institution name required");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(recipient, tokenId);

        certificates[tokenId] = CertificateData({
            recipientName: recipientName,
            courseName: courseName,
            institutionName: institutionName,
            issueDate: block.timestamp,
            issuer: msg.sender,
            isValid: true
        });

        emit CertificateIssued(tokenId, recipient, msg.sender, recipientName, courseName, institutionName, block.timestamp);
        return tokenId;
    }

    function revokeCertificate(uint256 tokenId) public {
        require(_exists(tokenId), "Token does not exist");
        require(certificates[tokenId].issuer == msg.sender || msg.sender == owner(), "Not authorized");
        require(!revokedCertificates[tokenId], "Already revoked");

        revokedCertificates[tokenId] = true;
        certificates[tokenId].isValid = false;
        emit CertificateRevoked(tokenId, msg.sender);
    }

    function authorizeIssuer(address issuer) public onlyOwner {
        require(issuer != address(0), "Invalid address");
        require(!authorizedIssuers[issuer], "Already authorized");
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer, msg.sender);
    }

    function getCertificate(uint256 tokenId) public view returns (CertificateData memory) {
        require(_exists(tokenId), "Token does not exist");
        return certificates[tokenId];
    }

    function isValidCertificate(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId) && certificates[tokenId].isValid && !revokedCertificates[tokenId];
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    // Override transfer functions to make certificates non-transferable
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override {
        require(from == address(0) || to == address(0), "Non-transferable");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}