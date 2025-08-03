// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title Certificate
 * @dev Non-transferable ERC721 certificate contract for VerifyCert
 * Implements tamper-proof digital certificates as NFTs on Polygon Mumbai
 */
contract Certificate is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Mapping from issuer address to authorization status
    mapping(address => bool) public authorizedIssuers;
    
    // Mapping from token ID to revocation status
    mapping(uint256 => bool) public revokedCertificates;
    
    // Mapping from issuer to issued certificate count
    mapping(address => uint256) public issuerCertificateCount;
    
    // Certificate metadata structure
    struct CertificateData {
        string recipientName;
        string courseName;
        string institutionName;
        uint256 issueDate;
        address issuer;
        address recipient;
        bool isRevoked;
        string metadataHash; // IPFS hash for additional metadata
    }
    
    // Mapping from token ID to certificate data
    mapping(uint256 => CertificateData) public certificates;

    // Events
    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        address indexed issuer,
        string recipientName,
        string courseName,
        string institutionName
    );
    
    event CertificateRevoked(
        uint256 indexed tokenId, 
        address indexed revoker,
        string reason
    );
    
    event IssuerAuthorized(
        address indexed issuer, 
        address indexed authorizer
    );
    
    event IssuerRevoked(
        address indexed issuer, 
        address indexed revoker
    );

    event CertificateMetadataUpdated(
        uint256 indexed tokenId,
        string newTokenURI
    );

    constructor() ERC721("VerifyCert Certificate", "VCERT") {}

    /**
     * @dev Modifier to check if caller is authorized issuer
     */
    modifier onlyAuthorizedIssuer() {
        require(
            authorizedIssuers[msg.sender] || msg.sender == owner(),
            "Certificate: caller is not authorized issuer"
        );
        _;
    }

    /**
     * @dev Modifier to check if certificate exists and is not revoked
     */
    modifier validCertificate(uint256 tokenId) {
        require(_exists(tokenId), "Certificate: certificate does not exist");
        require(!certificates[tokenId].isRevoked, "Certificate: certificate is revoked");
        _;
    }

    /**
     * @dev Authorize an address to issue certificates
     * @param issuer Address to authorize
     */
    function authorizeIssuer(address issuer) public onlyOwner {
        require(issuer != address(0), "Certificate: invalid issuer address");
        require(!authorizedIssuers[issuer], "Certificate: issuer already authorized");
        
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer, msg.sender);
    }

    /**
     * @dev Revoke issuer authorization
     * @param issuer Address to revoke authorization from
     */
    function revokeIssuer(address issuer) public onlyOwner {
        require(authorizedIssuers[issuer], "Certificate: issuer not authorized");
        
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer, msg.sender);
    }

    /**
     * @dev Issue a new certificate
     * @param recipient Address to receive the certificate
     * @param recipientName Name of the certificate recipient
     * @param courseName Name of the course/program
     * @param institutionName Name of the issuing institution
     * @param tokenURI Metadata URI for the certificate
     * @param metadataHash IPFS hash for additional metadata
     */
    function issueCertificate(
        address recipient,
        string memory recipientName,
        string memory courseName,
        string memory institutionName,
        string memory tokenURI,
        string memory metadataHash
    ) public onlyAuthorizedIssuer nonReentrant whenNotPaused returns (uint256) {
        require(recipient != address(0), "Certificate: invalid recipient address");
        require(bytes(recipientName).length > 0, "Certificate: recipient name required");
        require(bytes(courseName).length > 0, "Certificate: course name required");
        require(bytes(institutionName).length > 0, "Certificate: institution name required");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Mint the certificate NFT
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);

        // Store certificate data
        certificates[tokenId] = CertificateData({
            recipientName: recipientName,
            courseName: courseName,
            institutionName: institutionName,
            issueDate: block.timestamp,
            issuer: msg.sender,
            recipient: recipient,
            isRevoked: false,
            metadataHash: metadataHash
        });

        // Update issuer statistics
        issuerCertificateCount[msg.sender]++;

        emit CertificateIssued(
            tokenId,
            recipient,
            msg.sender,
            recipientName,
            courseName,
            institutionName
        );

        return tokenId;
    }

    /**
     * @dev Batch issue multiple certificates
     * @param recipients Array of recipient addresses
     * @param recipientNames Array of recipient names
     * @param courseName Name of the course/program (same for all)
     * @param institutionName Name of the issuing institution (same for all)
     * @param baseTokenURI Base URI for metadata (will append tokenId)
     * @param metadataHash IPFS hash for additional metadata (same for all)
     */
    function batchIssueCertificates(
        address[] memory recipients,
        string[] memory recipientNames,
        string memory courseName,
        string memory institutionName,
        string memory baseTokenURI,
        string memory metadataHash
    ) public onlyAuthorizedIssuer nonReentrant whenNotPaused returns (uint256[] memory) {
        require(recipients.length == recipientNames.length, "Certificate: arrays length mismatch");
        require(recipients.length > 0, "Certificate: empty arrays");
        require(recipients.length <= 100, "Certificate: batch size too large");

        uint256[] memory tokenIds = new uint256[](recipients.length);

        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Certificate: invalid recipient address");
            require(bytes(recipientNames[i]).length > 0, "Certificate: recipient name required");

            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();

            // Mint the certificate NFT
            _safeMint(recipients[i], tokenId);
            
            // Set token URI with tokenId appended
            string memory tokenURI = string(abi.encodePacked(baseTokenURI, "/", Strings.toString(tokenId)));
            _setTokenURI(tokenId, tokenURI);

            // Store certificate data
            certificates[tokenId] = CertificateData({
                recipientName: recipientNames[i],
                courseName: courseName,
                institutionName: institutionName,
                issueDate: block.timestamp,
                issuer: msg.sender,
                recipient: recipients[i],
                isRevoked: false,
                metadataHash: metadataHash
            });

            tokenIds[i] = tokenId;

            emit CertificateIssued(
                tokenId,
                recipients[i],
                msg.sender,
                recipientNames[i],
                courseName,
                institutionName
            );
        }

        // Update issuer statistics
        issuerCertificateCount[msg.sender] += recipients.length;

        return tokenIds;
    }

    /**
     * @dev Revoke a certificate
     * @param tokenId ID of the certificate to revoke
     * @param reason Reason for revocation
     */
    function revokeCertificate(uint256 tokenId, string memory reason) public {
        require(_exists(tokenId), "Certificate: certificate does not exist");
        require(
            certificates[tokenId].issuer == msg.sender || msg.sender == owner(),
            "Certificate: caller cannot revoke this certificate"
        );
        require(!certificates[tokenId].isRevoked, "Certificate: certificate already revoked");

        certificates[tokenId].isRevoked = true;
        revokedCertificates[tokenId] = true;

        emit CertificateRevoked(tokenId, msg.sender, reason);
    }

    /**
     * @dev Update certificate metadata URI
     * @param tokenId ID of the certificate
     * @param newTokenURI New metadata URI
     */
    function updateCertificateMetadata(uint256 tokenId, string memory newTokenURI) 
        public 
        validCertificate(tokenId) 
    {
        require(
            certificates[tokenId].issuer == msg.sender || msg.sender == owner(),
            "Certificate: caller cannot update this certificate"
        );

        _setTokenURI(tokenId, newTokenURI);
        emit CertificateMetadataUpdated(tokenId, newTokenURI);
    }

    /**
     * @dev Get certificate data
     * @param tokenId ID of the certificate
     */
    function getCertificate(uint256 tokenId) public view returns (CertificateData memory) {
        require(_exists(tokenId), "Certificate: certificate does not exist");
        return certificates[tokenId];
    }

    /**
     * @dev Check if certificate is valid (exists and not revoked)
     * @param tokenId ID of the certificate
     */
    function isValidCertificate(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId) && !certificates[tokenId].isRevoked;
    }

    /**
     * @dev Get certificates issued by a specific issuer
     * @param issuer Address of the issuer
     * @param offset Starting index for pagination
     * @param limit Maximum number of certificates to return
     */
    function getCertificatesByIssuer(address issuer, uint256 offset, uint256 limit) 
        public 
        view 
        returns (uint256[] memory tokenIds, uint256 total) 
    {
        require(limit > 0 && limit <= 100, "Certificate: invalid limit");
        
        uint256 totalSupply = _tokenIdCounter.current();
        uint256[] memory tempTokenIds = new uint256[](limit);
        uint256 count = 0;
        uint256 found = 0;

        for (uint256 i = 0; i < totalSupply && found < limit; i++) {
            if (_exists(i) && certificates[i].issuer == issuer) {
                if (count >= offset) {
                    tempTokenIds[found] = i;
                    found++;
                }
                count++;
            }
        }

        // Create array with exact size
        tokenIds = new uint256[](found);
        for (uint256 i = 0; i < found; i++) {
            tokenIds[i] = tempTokenIds[i];
        }

        return (tokenIds, count);
    }

    /**
     * @dev Get certificates owned by a specific address
     * @param owner Address of the owner
     */
    function getCertificatesByOwner(address owner) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](balance);
        uint256 totalSupply = _tokenIdCounter.current();
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalSupply && currentIndex < balance; i++) {
            if (_exists(i) && ownerOf(i) == owner) {
                tokenIds[currentIndex] = i;
                currentIndex++;
            }
        }

        return tokenIds;
    }

    /**
     * @dev Get total number of certificates issued
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Get total number of valid (non-revoked) certificates
     */
    function totalValidCertificates() public view returns (uint256) {
        uint256 totalSupply = _tokenIdCounter.current();
        uint256 validCount = 0;

        for (uint256 i = 0; i < totalSupply; i++) {
            if (_exists(i) && !certificates[i].isRevoked) {
                validCount++;
            }
        }

        return validCount;
    }

    /**
     * @dev Pause the contract (emergency stop)
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() public onlyOwner {
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
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        require(
            from == address(0) || to == address(0),
            "Certificate: certificates are non-transferable"
        );
    }

    /**
     * @dev Override approve to prevent approvals
     */
    function approve(address, uint256) public pure override {
        revert("Certificate: certificates are non-transferable");
    }

    /**
     * @dev Override setApprovalForAll to prevent approvals
     */
    function setApprovalForAll(address, bool) public pure override {
        revert("Certificate: certificates are non-transferable");
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