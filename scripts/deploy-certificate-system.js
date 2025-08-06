#!/usr/bin/env node

/**
 * Complete Certificate System Deployment Script
 * 
 * This script handles the complete deployment of the certificate system:
 * 1. Deploys the smart contract to Polygon Amoy
 * 2. Updates contract addresses across all services
 * 3. Verifies the contract on PolygonScan
 * 4. Tests the deployment
 * 5. Generates deployment report
 */

const hre = require('hardhat');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

class CertificateSystemDeployer {
  constructor() {
    this.deploymentData = {
      network: 'polygonAmoy',
      timestamp: new Date().toISOString(),
      contracts: {},
      verification: {},
      tests: {}
    };
  }

  async deploy() {
    console.log('🚀 Starting Certificate System Deployment\n');

    try {
      // Step 1: Deploy the contract
      await this.deployContract();
      
      // Step 2: Update contract addresses
      await this.updateContractAddresses();
      
      // Step 3: Verify contract on PolygonScan
      await this.verifyContract();
      
      // Step 4: Run basic tests
      await this.runDeploymentTests();
      
      // Step 5: Generate deployment report
      await this.generateDeploymentReport();
      
      console.log('🎉 Certificate System Deployment Completed Successfully!\n');
      
    } catch (error) {
      console.error('💥 Deployment failed:', error);
      process.exit(1);
    }
  }

  async deployContract() {
    console.log('📋 Deploying Certificate Contract...\n');

    try {
      // Get the contract factory
      const Certificate = await hre.ethers.getContractFactory('Certificate');
      
      // Deploy the contract
      console.log('🔄 Deploying contract...');
      const certificate = await Certificate.deploy();
      
      // Wait for deployment
      await certificate.waitForDeployment();
      const contractAddress = await certificate.getAddress();
      
      console.log('✅ Contract deployed to:', contractAddress);
      
      // Get deployment transaction
      const deploymentTx = certificate.deploymentTransaction();
      console.log('📝 Deployment transaction:', deploymentTx.hash);
      
      // Wait for confirmation
      const receipt = await deploymentTx.wait(2); // Wait for 2 confirmations
      console.log('✅ Contract confirmed in block:', receipt.blockNumber);
      
      // Store deployment data
      this.deploymentData.contracts.Certificate = {
        address: contractAddress,
        transactionHash: deploymentTx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        deployer: receipt.from
      };
      
      // Test basic contract functionality
      console.log('🔄 Testing basic contract functionality...');
      
      const name = await certificate.name();
      const symbol = await certificate.symbol();
      const owner = await certificate.owner();
      const totalSupply = await certificate.totalSupply();
      
      console.log('✅ Contract name:', name);
      console.log('✅ Contract symbol:', symbol);
      console.log('✅ Contract owner:', owner);
      console.log('✅ Total supply:', totalSupply.toString());
      
      this.deploymentData.contracts.Certificate.metadata = {
        name,
        symbol,
        owner,
        totalSupply: totalSupply.toString()
      };
      
    } catch (error) {
      console.error('❌ Contract deployment failed:', error);
      throw error;
    }
  }

  async updateContractAddresses() {
    console.log('\n📋 Updating Contract Addresses...\n');

    try {
      const contractAddress = this.deploymentData.contracts.Certificate.address;
      
      // Contract addresses structure
      const contractAddresses = {
        polygonAmoy: {
          Certificate: contractAddress,
          network: 'Polygon Amoy Testnet',
          chainId: 80002,
          rpcUrl: 'https://rpc-amoy.polygon.technology/',
          explorerUrl: 'https://amoy.polygonscan.com/',
          lastUpdated: new Date().toISOString()
        }
      };

      // Update root contract addresses
      const rootPath = './contract-addresses.json';
      fs.writeFileSync(rootPath, JSON.stringify(contractAddresses, null, 2));
      console.log('✅ Updated root contract addresses');

      // Update backend contract addresses
      const backendPath = './backend/contract-addresses.json';
      if (fs.existsSync('./backend')) {
        fs.writeFileSync(backendPath, JSON.stringify(contractAddresses, null, 2));
        console.log('✅ Updated backend contract addresses');
      }

      // Update frontend contract addresses
      const frontendPath = './frontend/contract-addresses.json';
      if (fs.existsSync('./frontend')) {
        fs.writeFileSync(frontendPath, JSON.stringify(contractAddresses, null, 2));
        console.log('✅ Updated frontend contract addresses');
      }

      // Update environment files with contract address
      await this.updateEnvironmentFiles(contractAddress);
      
    } catch (error) {
      console.error('❌ Failed to update contract addresses:', error);
      throw error;
    }
  }

  async updateEnvironmentFiles(contractAddress) {
    console.log('🔄 Updating environment files...');

    try {
      // Update backend .env
      const backendEnvPath = './backend/.env';
      if (fs.existsSync(backendEnvPath)) {
        let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
        
        // Update or add contract address
        if (backendEnv.includes('CERTIFICATE_CONTRACT_ADDRESS=')) {
          backendEnv = backendEnv.replace(
            /CERTIFICATE_CONTRACT_ADDRESS=.*/,
            `CERTIFICATE_CONTRACT_ADDRESS=${contractAddress}`
          );
        } else {
          backendEnv += `\nCERTIFICATE_CONTRACT_ADDRESS=${contractAddress}\n`;
        }
        
        fs.writeFileSync(backendEnvPath, backendEnv);
        console.log('✅ Updated backend .env');
      }

      // Update frontend .env
      const frontendEnvPath = './frontend/.env';
      if (fs.existsSync(frontendEnvPath)) {
        let frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
        
        // Update or add contract address
        if (frontendEnv.includes('REACT_APP_CERTIFICATE_CONTRACT_ADDRESS=')) {
          frontendEnv = frontendEnv.replace(
            /REACT_APP_CERTIFICATE_CONTRACT_ADDRESS=.*/,
            `REACT_APP_CERTIFICATE_CONTRACT_ADDRESS=${contractAddress}`
          );
        } else {
          frontendEnv += `\nREACT_APP_CERTIFICATE_CONTRACT_ADDRESS=${contractAddress}\n`;
        }
        
        fs.writeFileSync(frontendEnvPath, frontendEnv);
        console.log('✅ Updated frontend .env');
      }
      
    } catch (error) {
      console.error('❌ Failed to update environment files:', error);
      // Don't throw here as this is not critical
    }
  }

  async verifyContract() {
    console.log('\n📋 Verifying Contract on PolygonScan...\n');

    try {
      const contractAddress = this.deploymentData.contracts.Certificate.address;
      
      console.log('🔄 Submitting contract for verification...');
      
      // Run Hardhat verification
      await hre.run('verify:verify', {
        address: contractAddress,
        constructorArguments: []
      });
      
      console.log('✅ Contract verified on PolygonScan');
      
      this.deploymentData.verification.Certificate = {
        verified: true,
        explorerUrl: `https://amoy.polygonscan.com/address/${contractAddress}#code`,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Contract verification failed:', error);
      
      this.deploymentData.verification.Certificate = {
        verified: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      // Don't throw here as verification failure shouldn't stop deployment
      console.log('⚠️ Continuing without verification...');
    }
  }

  async runDeploymentTests() {
    console.log('\n📋 Running Deployment Tests...\n');

    try {
      const contractAddress = this.deploymentData.contracts.Certificate.address;
      
      // Initialize contract for testing
      const provider = new ethers.JsonRpcProvider(
        process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology/'
      );
      
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      
      // Load contract ABI
      const contractArtifact = JSON.parse(
        fs.readFileSync('./artifacts/contracts/Certificate.sol/Certificate.json', 'utf8')
      );
      
      const contract = new ethers.Contract(contractAddress, contractArtifact.abi, wallet);
      
      // Test 1: Check contract is accessible
      console.log('🔄 Testing contract accessibility...');
      const name = await contract.name();
      console.log('✅ Contract accessible, name:', name);
      
      // Test 2: Check owner authorization
      console.log('🔄 Testing owner authorization...');
      const isAuthorized = await contract.isAuthorizedIssuer(wallet.address);
      console.log('✅ Owner authorization:', isAuthorized);
      
      // Test 3: Test certificate issuance (optional)
      if (process.env.RUN_FULL_TESTS === 'true') {
        console.log('🔄 Testing certificate issuance...');
        
        const testRecipient = '0x742d35Cc6634C0532925a3b8D0C9C0E3C5d5c8eF';
        const metadataHash = ethers.keccak256(ethers.toUtf8Bytes('test-certificate'));
        
        const tx = await contract.issueCertificate(
          testRecipient,
          'Test User',
          'Test Course',
          'Test Institution',
          'https://example.com/metadata.json',
          metadataHash
        );
        
        const receipt = await tx.wait();
        const tokenId = receipt.logs[0].args.tokenId.toString();
        
        console.log('✅ Test certificate issued, token ID:', tokenId);
        
        // Verify the certificate
        const isValid = await contract.isValidCertificate(tokenId);
        console.log('✅ Test certificate is valid:', isValid);
        
        this.deploymentData.tests.testCertificate = {
          tokenId,
          transactionHash: tx.hash,
          isValid
        };
      }
      
      this.deploymentData.tests.basic = {
        contractAccessible: true,
        ownerAuthorized: isAuthorized,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Deployment tests failed:', error);
      
      this.deploymentData.tests.basic = {
        contractAccessible: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      // Don't throw here as test failure shouldn't stop deployment
      console.log('⚠️ Continuing despite test failures...');
    }
  }

  async generateDeploymentReport() {
    console.log('\n📋 Generating Deployment Report...\n');

    try {
      // Create deployment report
      const report = {
        title: 'VerifyCert Certificate System Deployment Report',
        ...this.deploymentData,
        summary: {
          contractDeployed: !!this.deploymentData.contracts.Certificate?.address,
          contractVerified: this.deploymentData.verification.Certificate?.verified || false,
          testsRun: !!this.deploymentData.tests.basic,
          deploymentSuccessful: true
        },
        nextSteps: [
          'Start the backend server: npm run backend:dev',
          'Start the frontend server: npm run frontend:dev',
          'Run comprehensive tests: npm run test:certificate-system',
          'Configure authorized issuers if needed',
          'Set up monitoring and alerts'
        ],
        importantNotes: [
          'Contract is deployed on Polygon Amoy testnet',
          'Make sure to backup your private key securely',
          'Contract addresses have been updated across all services',
          'Verification on PolygonScan may take a few minutes'
        ]
      };

      // Save deployment report
      const reportPath = './deployment-report.json';
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log('✅ Deployment report saved to deployment-report.json');

      // Generate markdown report
      const markdownReport = this.generateMarkdownReport(report);
      fs.writeFileSync('./DEPLOYMENT_REPORT.md', markdownReport);
      console.log('✅ Markdown report saved to DEPLOYMENT_REPORT.md');

      // Display summary
      console.log('\n📊 Deployment Summary:');
      console.log('✅ Contract Address:', this.deploymentData.contracts.Certificate.address);
      console.log('✅ Transaction Hash:', this.deploymentData.contracts.Certificate.transactionHash);
      console.log('✅ Block Number:', this.deploymentData.contracts.Certificate.blockNumber);
      console.log('✅ Gas Used:', this.deploymentData.contracts.Certificate.gasUsed);
      
      if (this.deploymentData.verification.Certificate?.verified) {
        console.log('✅ Verification:', this.deploymentData.verification.Certificate.explorerUrl);
      } else {
        console.log('⚠️ Verification: Failed or pending');
      }
      
    } catch (error) {
      console.error('❌ Failed to generate deployment report:', error);
      throw error;
    }
  }

  generateMarkdownReport(report) {
    return `# VerifyCert Certificate System Deployment Report

**Deployment Date:** ${report.timestamp}  
**Network:** ${report.network}  
**Status:** ${report.summary.deploymentSuccessful ? '✅ Successful' : '❌ Failed'}

## Contract Deployment

### Certificate Contract
- **Address:** \`${report.contracts.Certificate.address}\`
- **Transaction Hash:** \`${report.contracts.Certificate.transactionHash}\`
- **Block Number:** ${report.contracts.Certificate.blockNumber}
- **Gas Used:** ${report.contracts.Certificate.gasUsed}
- **Deployer:** \`${report.contracts.Certificate.deployer}\`

### Contract Metadata
- **Name:** ${report.contracts.Certificate.metadata.name}
- **Symbol:** ${report.contracts.Certificate.metadata.symbol}
- **Owner:** \`${report.contracts.Certificate.metadata.owner}\`
- **Total Supply:** ${report.contracts.Certificate.metadata.totalSupply}

## Verification

${report.verification.Certificate.verified 
  ? `✅ **Contract Verified**  
[View on PolygonScan](${report.verification.Certificate.explorerUrl})`
  : `❌ **Verification Failed**  
Error: ${report.verification.Certificate.error}`
}

## Testing Results

${report.tests.basic.contractAccessible 
  ? '✅ Contract is accessible and functional'
  : `❌ Contract accessibility test failed: ${report.tests.basic.error}`
}

${report.tests.testCertificate 
  ? `✅ Test certificate issued successfully (Token ID: ${report.tests.testCertificate.tokenId})`
  : '⚠️ Full certificate issuance test not run'
}

## Next Steps

${report.nextSteps.map(step => `- ${step}`).join('\n')}

## Important Notes

${report.importantNotes.map(note => `- ${note}`).join('\n')}

## Contract Addresses Updated

The following files have been updated with the new contract address:
- \`./contract-addresses.json\`
- \`./backend/contract-addresses.json\`
- \`./frontend/contract-addresses.json\`
- \`./backend/.env\`
- \`./frontend/.env\`

## Support

If you encounter any issues:
1. Check the deployment logs above
2. Verify your environment configuration
3. Run the test suite: \`npm run test:certificate-system\`
4. Check the troubleshooting guide in the documentation

---
*Generated by VerifyCert Deployment System*
`;
  }
}

// Run deployment if called directly
if (require.main === module) {
  const deployer = new CertificateSystemDeployer();
  deployer.deploy();
}

module.exports = CertificateSystemDeployer;