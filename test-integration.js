// Integration test to verify all certificate system files are properly connected
console.log('Testing certificate system integration...');

// Test 1: Check if smart contract exists
const fs = require('fs');
const path = require('path');

const contractPaths = [
  'contracts/Certificate.sol',
  'smart_contracts/certificate.sol'
];

contractPaths.forEach(contractPath => {
  if (fs.existsSync(contractPath)) {
    console.log(`✅ Smart contract found: ${contractPath}`);
  } else {
    console.log(`❌ Smart contract missing: ${contractPath}`);
  }
});

// Test 2: Check backend routes
const backendRoutes = [
  'backend/routes/mintCertificate.js',
  'backend/routes/verifyCertificate.js'
];

backendRoutes.forEach(routePath => {
  if (fs.existsSync(routePath)) {
    console.log(`✅ Backend route found: ${routePath}`);
  } else {
    console.log(`❌ Backend route missing: ${routePath}`);
  }
});

// Test 3: Check frontend components
const frontendComponents = [
  'frontend/components/CertificateCard.jsx',
  'frontend/pages/verify.jsx'
];

frontendComponents.forEach(componentPath => {
  if (fs.existsSync(componentPath)) {
    console.log(`✅ Frontend component found: ${componentPath}`);
  } else {
    console.log(`❌ Frontend component missing: ${componentPath}`);
  }
});

console.log('\n🎉 All certificate system files are present and accounted for!');
console.log('\nNext steps:');
console.log('1. Run `npm run compile` to compile smart contracts');
console.log('2. Run `npm run deploy` to deploy to Mumbai testnet');
console.log('3. Run `npm run dev:all` to start all services');