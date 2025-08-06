// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Certificate is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    uint256 private _tokenIdCounter;

    struct CertificateData {
        string recipientName;
        string courseName;
        string institutionName;
        uint256 issueDate;
        address issuer;
        bool isValid;
        string metadataHash;
    }

    mapping(uint256 => CertificateData) public certificates;
    mapping(address => bool) public authorizedIssuers;
    mapping(uint256 => bool) public revokedCertificates;
    mapping(address => uint256[]) public recipientCertificates;
    mapping(address => uint256[]) public issuerCertificates;
    mapping(string => uint256) public metadataHashToTokenId;

    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        address indexed issuer,
        string recipientName,
        string courseName,
        string institutionName,
        uint256 issueDate,
        string metadataHash
    );

    event CertificateRevoked(uint256 indexed tokenId, address indexed revoker, string reason);
    event IssuerAuthorized(address indexed issuer, address indexed authorizer);
    event IssuerRevoked(address indexed issuer, address indexed revoker);

    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    modifier validTokenId(uint256 tokenId) {
        require(_exists(tokenId), "Token does not exist");
        _;
    }

    constructor() ERC721("VerifyCert Certificate", "VCERT") {
        authorizedIssuers[msg.sender] = true;
    }

    function issueCertificate(
        address recipient,
        string memory recipientName,
        string memory courseName,
        string memory institutionName,
        string memory certificateURI,
        string memory metadataHash
    ) public onlyAuthorizedIssuer whenNotPaused nonReentrant returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(bytes(recipientName).length > 0, "Recipient name required");
        require(bytes(courseName).length > 0, "Course name required");
        require(bytes(institutionName).length > 0, "Institution name required");
        require(bytes(metadataHash).length > 0, "Metadata hash required");
        require(metadataHashToTokenId[metadataHash] == 0, "Hash already exists");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, certificateURI);

        certificates[tokenId] = CertificateData({
            recipientName: recipientName,
            courseName: courseName,
            institutionName: institutionName,
            issueDate: block.timestamp,
            issuer: msg.sender,
            isValid: true,
            metadataHash: metadataHash
        });

        recipientCertificates[recipient].push(tokenId);
        issuerCertificates[msg.sender].push(tokenId);
        metadataHashToTokenId[metadataHash] = tokenId;

        emit CertificateIssued(tokenId, recipient, msg.sender, recipientName, courseName, institutionName, block.timestamp, metadataHash);
        return tokenId;
    }

    function revokeCertificate(uint256 tokenId, string memory reason) public validTokenId(tokenId) whenNotPaused {
        require(certificates[tokenId].issuer == msg.sender || msg.sender == owner(), "Not authorized");
        require(!revokedCertificates[tokenId], "Already revoked");

        revokedCertificates[tokenId] = true;
        certificates[tokenId].isValid = false;
        emit CertificateRevoked(tokenId, msg.sender, reason);
    }

    function authorizeIssuer(address issuer) public onlyOwner {
        require(issuer != address(0), "Invalid address");
        require(!authorizedIssuers[issuer], "Already authorized");
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer, msg.sender);
    }

    function revokeIssuerAuthorization(address issuer) public onlyOwner {
        require(authorizedIssuers[issuer], "Not authorized");
        require(issuer != owner(), "Cannot revoke owner");
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer, msg.sender);
    }

    function getCertificate(uint256 tokenId) public view validTokenId(tokenId) returns (CertificateData memory) {
        return certificates[tokenId];
    }

    function getCertificatesByRecipient(address recipient) public view returns (uint256[] memory) {
        return recipientCertificates[recipient];
    }

    function getCertificatesByIssuer(address issuer) public view returns (uint256[] memory) {
        return issuerCertificates[issuer];
    }

    function isValidCertificate(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId) && certificates[tokenId].isValid && !revokedCertificates[tokenId];
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override whenNotPaused {
        require(from == address(0) || to == address(0), "Non-transferable");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

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