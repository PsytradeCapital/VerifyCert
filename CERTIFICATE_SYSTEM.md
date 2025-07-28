# VerifyCert Certificate System

A comprehensive decentralized certificate verification system built on Polygon blockchain using ERC721 non-transferable NFTs.

## System Overview

The VerifyCert system consists of three main components:

1. **Smart Contract** (`smart_contracts/certificate.sol`) - Solidity contract for certificate NFTs
2. **Backend API** (`backend/routes/`) - Node.js/Express API for blockchain interaction
3. **Frontend Interface** (`frontend/`) - React application for user interaction

## Smart Contract Features

### Core Functionality
- **Non-transferable ERC721 NFTs** - Certificates cannot be transferred between addresses
- **Authorized Issuers** - Only authorized addresses can mint certificates
- **Certificate Verification** - Public verification by hash or token ID
- **Revocation System** - Issuers can revoke certificates with reasons
- **Expiry Management** - Certificates can have expiry dates

### Contract Structure
```solidity
struct CertificateData {
    string recipientName;
    string courseName;
    string institutionName;
    uint256 issueDate;
    uint256 expiryDate;
    bool isRevoked;
    address issuer;
    string certificateHash;
}
```

### Key Functions
- `issueCertificate()` - Mint new certificate NFT
- `verifyCertificate()` - Verify certificate by token ID
- `verifyCertificateByHash()` - Verify certificate by hash
- `revokeCertificate()` - Revoke a certificate
- `authorizeIssuer()` - Authorize new issuer (owner only)

## Backend API Endpoints

### Certificate Minting
```
POST /api/certificates/mint
```
Mint a new certificate NFT with validation and blockchain interaction.

**Request Body:**
```json
{
  "recipientAddress": "0x...",
  "recipientName": "John Doe",
  "courseName": "Blockchain Development",
  "institutionName": "Tech University",
  "expiryDate": 1735689600,
  "metadata": {
    "description": "Advanced blockchain course",
    "skills": ["Solidity", "Web3"],
    "grade": "A+"
  }
}
```

### Batch Minting
```
POST /api/certificates/batch-mint
```
Mint multiple certificates in a single request (max 50).

### Certificate Verification
```
GET /api/certificates/verify/:hash
GET /api/certificates/verify/token/:tokenId
```
Verify certificate authenticity and get detailed information.

### Issuer Management
```
GET /api/certificates/issuer/:address
```
Get all certificates issued by a specific address with pagination.

### Cost Estimation
```
GET /api/certificates/estimate-cost
```
Estimate gas cost for minting certificates.

## Frontend Components

### CertificateCard Component
A comprehensive React component for displaying certificate information:

**Features:**
- Verification status badges
- Expandable details section
- Copy/share functionality
- Responsive design
- Animation effects

**Usage:**
```jsx
import CertificateCard from '../components/CertificateCard';

<CertificateCard
  certificate={certificateData}
  variant="elevated"
  showActions={true}
  showVerificationStatus={true}
  onVerify={handleVerify}
  onShare={handleShare}
  onDownload={handleDownload}
/>
```

### Verification Page
Full-featured certificate verification interface:

**Features:**
- Multiple verification methods (hash, QR upload, camera scan)
- Real-time verification status
- Certificate details display
- Share and download options
- Mobile-responsive design

## Installation & Setup

### Prerequisites
- Node.js v16+
- npm or yarn
- MetaMask or compatible wallet
- Polygon Mumbai testnet access

### Environment Variables

**Root `.env`:**
```
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
ISSUER_PRIVATE_KEY=your_private_key_here
POLYGONSCAN_API_KEY=your_api_key_here
```

**Backend `.env`:**
```
PORT=5000
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
ISSUER_PRIVATE_KEY=your_private_key_here
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env`:**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NETWORK_ID=80001
REACT_APP_CONTRACT_ADDRESS=deployed_contract_address
```

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm run install:all
   ```

2. **Compile Smart Contracts**
   ```bash
   npm run compile
   ```

3. **Deploy Contract**
   ```bash
   npm run deploy
   ```

4. **Start Development Servers**
   ```bash
   npm run dev:all
   ```

## Usage Examples

### Minting a Certificate

```javascript
// Backend API call
const response = await fetch('/api/certificates/mint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    recipientAddress: '0x742d35Cc6634C0532925a3b8D0C9e3e0C8b0e4c1',
    recipientName: 'Alice Johnson',
    courseName: 'Advanced React Development',
    institutionName: 'Code Academy',
    expiryDate: 0, // No expiry
    metadata: {
      description: 'Comprehensive React course with hooks and context',
      skills: ['React', 'JavaScript', 'TypeScript'],
      grade: 'A'
    }
  })
});

const result = await response.json();
console.log('Certificate minted:', result.data.certificate);
```

### Verifying a Certificate

```javascript
// Frontend verification
const verifyCertificate = async (hash) => {
  const response = await fetch(`/api/certificates/verify/${hash}`);
  const result = await response.json();
  
  if (result.success && result.data.exists) {
    console.log('Certificate is valid:', result.data.isValid);
    console.log('Certificate data:', result.data.certificate);
  } else {
    console.log('Certificate not found');
  }
};
```

### Smart Contract Interaction

```javascript
// Direct contract interaction
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Verify certificate
const [isValid, isExpired, isRevoked, certData] = await contract.verifyCertificate(tokenId);

// Check if address is authorized issuer
const isAuthorized = await contract.authorizedIssuers(address);
```

## Security Features

### Smart Contract Security
- **ReentrancyGuard** - Prevents reentrancy attacks
- **Access Control** - Role-based permissions for issuers
- **Input Validation** - Comprehensive parameter validation
- **Non-transferable** - Certificates cannot be transferred or sold

### API Security
- **Input Validation** - Joi schema validation for all inputs
- **Rate Limiting** - Prevents API abuse
- **Error Handling** - Secure error messages without sensitive data
- **Gas Estimation** - Prevents failed transactions

### Frontend Security
- **XSS Protection** - Sanitized user inputs
- **HTTPS Only** - Secure communication
- **Wallet Integration** - Secure Web3 wallet connections

## Testing

### Smart Contract Tests
```bash
npm test
```

### Backend API Tests
```bash
cd backend && npm test
```

### Frontend Tests
```bash
cd frontend && npm test
```

### End-to-End Tests
```bash
npm run test:e2e
```

## Deployment

### Smart Contract Deployment
```bash
# Deploy to Mumbai testnet
npm run deploy

# Verify on PolygonScan
npm run verify
```

### Backend Deployment
```bash
# Using PM2
pm2 start backend/ecosystem.config.js

# Using Docker
docker build -t verifycert-backend ./backend
docker run -p 5000:5000 verifycert-backend
```

### Frontend Deployment
```bash
# Build for production
cd frontend && npm run build

# Deploy to Vercel
vercel --prod
```

## API Documentation

### Response Format
All API responses follow this format:
```json
{
  "success": boolean,
  "message": string,
  "data": object,
  "errors": array (optional)
}
```

### Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden (not authorized issuer)
- `404` - Not Found (certificate doesn't exist)
- `409` - Conflict (duplicate certificate)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error
- `503` - Service Unavailable (blockchain network issues)

## Monitoring & Analytics

### Blockchain Events
The contract emits events for monitoring:
- `CertificateIssued` - New certificate minted
- `CertificateRevoked` - Certificate revoked
- `IssuerAuthorized` - New issuer authorized
- `IssuerRevoked` - Issuer authorization revoked

### Metrics to Track
- Total certificates issued
- Verification requests per day
- Gas costs and optimization
- API response times
- Error rates

## Troubleshooting

### Common Issues

1. **Transaction Failed**
   - Check gas price and limit
   - Verify account has sufficient MATIC
   - Ensure issuer is authorized

2. **Certificate Not Found**
   - Verify hash format (64 character hex)
   - Check if certificate exists on blockchain
   - Confirm correct network (Mumbai testnet)

3. **API Errors**
   - Check environment variables
   - Verify RPC URL is accessible
   - Confirm contract is deployed

### Debug Commands
```bash
# Check contract deployment
npm run deployment-status

# Verify contract on blockchain
npm run verify-deployment

# Test API endpoints
curl http://localhost:5000/api/certificates/stats
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the test files for usage examples

## Roadmap

### Phase 1 (Current)
- ✅ Basic certificate minting and verification
- ✅ Non-transferable NFT implementation
- ✅ Web interface for verification

### Phase 2 (Planned)
- 🔄 Batch operations optimization
- 🔄 Advanced metadata support
- 🔄 Integration with IPFS for certificate storage

### Phase 3 (Future)
- 📋 Multi-chain support
- 📋 Advanced analytics dashboard
- 📋 Mobile application
- 📋 Integration with educational platforms