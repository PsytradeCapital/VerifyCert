const http = require('http');

console.log('🔍 Checking VerifyCert servers...');
console.log('='.repeat(40));

// Function to check if a server is running
function checkServer(host, port, name) {
  return new Promise((resolve) => {
    const req = http.get(`http://${host}:${port}/health`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`✅ ${name}: Running on port ${port}`);
          if (response.network) {
            console.log(`   Network: ${response.network}`);
          }
          if (response.contractAddress) {
            console.log(`   Contract: ${response.contractAddress}`);
          }
          resolve(true);
        } catch (error) {
          console.log(`✅ ${name}: Running on port ${port} (non-JSON response)`);
          resolve(true);
        }
      });
    });

    req.on('error', () => {
      console.log(`❌ ${name}: Not running on port ${port}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log(`⏰ ${name}: Timeout on port ${port}`);
      resolve(false);
    });
  });
}

async function checkAllServers() {
  const backendRunning = await checkServer('localhost', 3003, 'Backend API');
  const frontendRunning = await checkServer('localhost', 3000, 'Frontend App');

  console.log('\n' + '='.repeat(40));
  if (backendRunning && frontendRunning) {
    console.log('🎉 All servers are running!');
    console.log('🔗 Open: http://localhost:3000');
  } else {
    console.log('⚠️  Some servers are not running');
    if (!backendRunning) {
      console.log('   Start backend: cd backend && npm run dev');
    }
    if (!frontendRunning) {
      console.log('   Start frontend: cd frontend && npm start');
    }
  }
  console.log('='.repeat(40));
}

checkAllServers();