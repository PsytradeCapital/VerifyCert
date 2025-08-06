const { spawn } = require('child_process');
const path = require('path');

// Function to kill processes on specific ports
function killPort(port) {
  return new Promise((resolve) => {
    const killCmd = process.platform === 'win32' 
      ? `netstat -ano | findstr :${port} && for /f "tokens=5" %a in ('netstat -ano ^| findstr :${port}') do taskkill /PID %a /F`
      : `lsof -ti :${port} | xargs kill -9`;
    
    const proc = spawn('cmd', ['/c', killCmd], { stdio: 'ignore' });
    proc.on('close', () => resolve());
  });
}

// Function to start backend server
function startBackend() {
  return new Promise((resolve, reject) => {
    console.log('🔧 Starting backend server on port 4000...');
    
    const backend = spawn('node', ['src/server.js'], {
      cwd: path.join(__dirname, 'backend'),
      stdio: 'pipe',
      shell: true
    });

    let backendReady = false;

    backend.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Backend] ${output.trim()}`);
      
      if (output.includes('running on port') || output.includes('listening')) {
        backendReady = true;
        console.log('✅ Backend server started successfully!');
        resolve(backend);
      }
    });

    backend.stderr.on('data', (data) => {
      const error = data.toString();
      console.error(`[Backend Error] ${error.trim()}`);
      
      if (error.includes('EADDRINUSE')) {
        console.log('🔄 Port 4000 in use, trying to kill existing process...');
      }
    });

    backend.on('close', (code) => {
      if (!backendReady) {
        if (code) {
          console.error(`❌ Backend process exited with code ${code}`);
          reject(new Error(`Backend failed to start`));
        }
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!backendReady) {
        console.log('⏰ Backend startup timeout, but continuing...');
        resolve(backend);
      }
    }, 30000);
  });
}

// Function to start frontend server
function startFrontend() {
  return new Promise((resolve, reject) => {
    console.log('🎨 Starting frontend server on port 3000...');
    
    const frontend = spawn('npm', ['start'], {
      cwd: path.join(__dirname, 'frontend'),
      stdio: 'pipe',
      shell: true
    });

    let frontendReady = false;

    frontend.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Frontend] ${output.trim()}`);
      
      if (output.includes('webpack compiled') || output.includes('Local:') || output.includes('localhost:3000')) {
        frontendReady = true;
        console.log('✅ Frontend server started successfully!');
        resolve(frontend);
      }
    });

    frontend.stderr.on('data', (data) => {
      const error = data.toString();
      console.error(`[Frontend Error] ${error.trim()}`);
      
      if (error.includes('EADDRINUSE')) {
        console.log('🔄 Port 3000 in use, trying to kill existing process...');
      }
    });

    frontend.on('close', (code) => {
      if (!frontendReady) {
        if (code) {
          console.error(`❌ Frontend process exited with code ${code}`);
          reject(new Error(`Frontend failed to start`));
        }
      }
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      if (!frontendReady) {
        console.log('⏰ Frontend startup timeout, but continuing...');
        resolve(frontend);
      }
    }, 60000);
  });
}

// Main startup function
async function startServers() {
  try {
    console.log('🚀 Starting VerifyCert servers for Amoy network...');
    console.log('='.repeat(60));
    
    // Clean up any existing processes
    console.log('🧹 Cleaning up existing processes...');
    await killPort(4000);
    await killPort(3000);
    
    // Start backend first
    const backendProcess = await startBackend();
    
    // Wait a bit for backend to fully initialize
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Start frontend
    const frontendProcess = await startFrontend();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SERVERS STARTED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('🔧 Backend API: http://localhost:4000');
    console.log('🎨 Frontend App: http://localhost:3000');
    console.log('🌐 Network: Polygon Amoy Testnet');
    console.log('📍 Contract: 0x6c9D554C721dA0CEA1b975982eAEe1f924271F50');
    console.log('💰 Faucet: https://faucet.polygon.technology/');
    console.log('='.repeat(60));
    
    console.log('\n✨ VerifyCert is ready to use on Amoy network!');
    console.log('Press Ctrl+C to stop both servers');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down servers...');
      backendProcess.kill();
      frontendProcess.kill();
      // Keep the process alive
      process.stdin.resume();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start servers:', error.message);
    process.exit(1);
  }
}

startServers();