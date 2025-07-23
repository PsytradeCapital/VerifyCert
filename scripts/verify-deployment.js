const fs = require('fs');
const https = require('https');
const http = require('http');

// Deployment verification script
async function main() {
  console.log("🔍 VerifyCert Deployment Verification");
  console.log("=".repeat(50));

  let allChecksPass = true;

  // Check 1: Contract deployment
  console.log("1. Checking smart contract deployment...");
  if (fs.existsSync('./contract-addresses.json')) {
    const contractInfo = JSON.parse(fs.readFileSync('./contract-addresses.json', 'utf8'));
    console.log(`   ✅ Contract deployed: ${contractInfo.contractAddress}`);
    console.log(`   📍 Network: ${contractInfo.network}`);
    console.log(`   🔗 PolygonScan: https://mumbai.polygonscan.com/address/${contractInfo.contractAddress}`);
  } else {
    console.log("   ❌ Contract not deployed");
    allChecksPass = false;
  }

  // Check 2: Configuration files
  console.log("\n2. Checking configuration files...");
  const configFiles = [
    './contract-addresses.json',
    './frontend/contract-addresses.json',
    './backend/contract-addresses.json',
    './backend/.env.production',
    './frontend/.env.production',
    './docker-compose.production.yml',
    './frontend/vercel.json'
  ];

  configFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} (missing)`);
      allChecksPass = false;
    }
  });

  // Check 3: Deployment scripts
  console.log("\n3. Checking deployment scripts...");
  const deploymentScripts = [
    './deploy-backend.sh',
    './deploy-frontend.sh'
  ];

  deploymentScripts.forEach(script => {
    if (fs.existsSync(script)) {
      console.log(`   ✅ ${script}`);
    } else {
      console.log(`   ❌ ${script} (missing)`);
      allChecksPass = false;
    }
  });

  // Check 4: Environment configuration
  console.log("\n4. Checking environment configuration...");
  
  // Check backend production env
  if (fs.existsSync('./backend/.env.production')) {
    const backendEnv = fs.readFileSync('./backend/.env.production', 'utf8');
    const hasContractAddress = backendEnv.includes('CONTRACT_ADDRESS=0x');
    const hasNodeEnv = backendEnv.includes('NODE_ENV=production');
    
    console.log(`   Backend NODE_ENV: ${hasNodeEnv ? '✅' : '❌'}`);
    console.log(`   Backend CONTRACT_ADDRESS: ${hasContractAddress ? '✅' : '❌'}`);
    
    if (!hasContractAddress || !hasNodeEnv) allChecksPass = false;
  }

  // Check frontend production env
  if (fs.existsSync('./frontend/.env.production')) {
    const frontendEnv = fs.readFileSync('./frontend/.env.production', 'utf8');
    const hasContractAddress = frontendEnv.includes('REACT_APP_CONTRACT_ADDRESS=0x');
    const hasApiUrl = frontendEnv.includes('REACT_APP_API_URL=');
    
    console.log(`   Frontend CONTRACT_ADDRESS: ${hasContractAddress ? '✅' : '❌'}`);
    console.log(`   Frontend API_URL: ${hasApiUrl ? '✅' : '❌'}`);
    
    if (!hasContractAddress || !hasApiUrl) allChecksPass = false;
  }

  // Check 5: Docker configuration
  console.log("\n5. Checking Docker configuration...");
  if (fs.existsSync('./docker-compose.production.yml')) {
    const dockerConfig = fs.readFileSync('./docker-compose.production.yml', 'utf8');
    const hasContractAddress = dockerConfig.includes('CONTRACT_ADDRESS=0x');
    const hasHealthCheck = dockerConfig.includes('healthcheck:');
    
    console.log(`   Docker contract address: ${hasContractAddress ? '✅' : '❌'}`);
    console.log(`   Docker health check: ${hasHealthCheck ? '✅' : '❌'}`);
    
    if (!hasContractAddress || !hasHealthCheck) allChecksPass = false;
  }

  // Check 6: Vercel configuration
  console.log("\n6. Checking Vercel configuration...");
  if (fs.existsSync('./frontend/vercel.json')) {
    const vercelConfig = JSON.parse(fs.readFileSync('./frontend/vercel.json', 'utf8'));
    const hasContractAddress = vercelConfig.env?.REACT_APP_CONTRACT_ADDRESS?.includes('0x');
    const hasApiUrl = vercelConfig.env?.REACT_APP_API_URL?.includes('api.verifycert.com');
    const hasSecurityHeaders = vercelConfig.headers?.[0]?.headers?.some(h => h.key === 'Content-Security-Policy');
    
    console.log(`   Vercel contract address: ${hasContractAddress ? '✅' : '❌'}`);
    console.log(`   Vercel API URL: ${hasApiUrl ? '✅' : '❌'}`);
    console.log(`   Vercel security headers: ${hasSecurityHeaders ? '✅' : '❌'}`);
    
    if (!hasContractAddress || !hasApiUrl || !hasSecurityHeaders) allChecksPass = false;
  }

  // Check 7: Documentation
  console.log("\n7. Checking documentation...");
  const docFiles = [
    './PRODUCTION_DEPLOYMENT.md',
    './DEPLOYMENT_SUMMARY.md',
    './SMART_CONTRACT_DEPLOYMENT.md'
  ];

  docFiles.forEach(doc => {
    if (fs.existsSync(doc)) {
      console.log(`   ✅ ${doc}`);
    } else {
      console.log(`   ❌ ${doc} (missing)`);
      allChecksPass = false;
    }
  });

  // Summary
  console.log("\n" + "=".repeat(50));
  if (allChecksPass) {
    console.log("🎉 ALL DEPLOYMENT CHECKS PASSED!");
    console.log("\n✅ Ready for production deployment");
    console.log("\n🚀 Next steps:");
    console.log("1. Configure environment variables");
    console.log("2. Set up domain names and SSL");
    console.log("3. Run deployment scripts:");
    console.log("   - Backend: ./deploy-backend.sh");
    console.log("   - Frontend: ./deploy-frontend.sh");
    console.log("4. Test deployed application");
  } else {
    console.log("❌ SOME DEPLOYMENT CHECKS FAILED");
    console.log("\n⚠️  Please fix the issues above before deploying");
    console.log("\n💡 Run the deployment preparation script:");
    console.log("   node scripts/deploy-production.js");
  }

  // Additional deployment tips
  console.log("\n📋 Deployment Checklist:");
  console.log("□ Smart contract deployed and verified");
  console.log("□ Environment variables configured");
  console.log("□ Domain names configured");
  console.log("□ SSL certificates installed");
  console.log("□ Backend deployed and responding");
  console.log("□ Frontend deployed and accessible");
  console.log("□ Email functionality tested");
  console.log("□ Certificate minting tested");
  console.log("□ Certificate verification tested");
  console.log("□ Monitoring set up");

  console.log("\n📚 Documentation:");
  console.log("- PRODUCTION_DEPLOYMENT.md - Detailed deployment guide");
  console.log("- DEPLOYMENT_SUMMARY.md - Quick reference");
  console.log("- SMART_CONTRACT_DEPLOYMENT.md - Contract deployment guide");

  return allChecksPass;
}

if (require.main === module) {
  main()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("❌ Verification failed:", error);
      process.exit(1);
    });
}

module.exports = main;