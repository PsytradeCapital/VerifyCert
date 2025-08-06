#!/usr/bin/env node

/**
 * VerifyCert Quick Start Script
 * 
 * This script helps users quickly set up and start the VerifyCert system
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class QuickStart {
  constructor() {
    this.processes = [];
  }

  async prompt(question) {
    return new Promise((resolve) => {
      rl.question(question, resolve);
    });
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      progress: '🔄'
    }[type] || '📋';
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async checkPrerequisites() {
    this.log('Checking prerequisites...', 'progress');

    const requirements = [
      { command: 'node --version', name: 'Node.js', minVersion: '16.0.0' },
      { command: 'npm --version', name: 'npm', minVersion: '8.0.0' }
    ];

    for (const req of requirements) {
      try {
        const version = execSync(req.command, { encoding: 'utf8' }).trim();
        this.log(`${req.name}: ${version}`, 'success');
      } catch (error) {
        this.log(`${req.name} is not installed or not in PATH`, 'error');
        throw new Error(`Please install ${req.name} before continuing`);
      }
    }
  }

  async checkEnvironmentFiles() {
    this.log('Checking environment configuration...', 'progress');

    const envFiles = [
      { path: '.env', example: '.env.example' },
      { path: 'backend/.env', example: 'backend/.env.example' },
      { path: 'frontend/.env', example: 'frontend/.env.example' }
    ];

    let needsSetup = false;

    for (const env of envFiles) {
      if (!fs.existsSync(env.path)) {
        if (fs.existsSync(env.example)) {
          this.log(`Creating ${env.path} from ${env.example}`, 'progress');
          fs.copyFileSync(env.example, env.path);
          needsSetup = true;
        } else {
          this.log(`Missing ${env.example} template`, 'warning');
        }
      } else {
        this.log(`${env.path} exists`, 'success');
      }
    }

    if (needsSetup) {
      this.log('Environment files created. Please configure them with your settings.', 'warning');
      const shouldContinue = await this.prompt('Continue with default settings? (y/n): ');
      if (shouldContinue.toLowerCase() !== 'y') {
        this.log('Please configure your environment files and run this script again.', 'info');
        process.exit(0);
      }
    }
  }

  async installDependencies() {
    this.log('Installing dependencies...', 'progress');

    try {
      // Install root dependencies
      this.log('Installing root dependencies...', 'progress');
      execSync('npm install', { stdio: 'inherit' });

      // Install backend dependencies
      this.log('Installing backend dependencies...', 'progress');
      execSync('cd backend && npm install', { stdio: 'inherit' });

      // Install frontend dependencies
      this.log('Installing frontend dependencies...', 'progress');
      execSync('cd frontend && npm install', { stdio: 'inherit' });

      this.log('All dependencies installed successfully', 'success');
    } catch (error) {
      this.log('Failed to install dependencies', 'error');
      throw error;
    }
  }

  async checkContractDeployment() {
    this.log('Checking contract deployment...', 'progress');

    const contractAddressesPath = 'contract-addresses.json';
    
    if (!fs.existsSync(contractAddressesPath)) {
      this.log('Contract addresses file not found', 'warning');
      const shouldDeploy = await this.prompt('Deploy contracts now? (y/n): ');
      
      if (shouldDeploy.toLowerCase() === 'y') {
        await this.deployContracts();
      } else {
        this.log('Skipping contract deployment. You can deploy later with: npm run deploy:amoy', 'info');
      }
    } else {
      const addresses = JSON.parse(fs.readFileSync(contractAddressesPath, 'utf8'));
      if (addresses.polygonAmoy?.Certificate) {
        this.log(`Contract deployed at: ${addresses.polygonAmoy.Certificate}`, 'success');
      } else {
        this.log('Contract address not found for Polygon Amoy', 'warning');
      }
    }
  }

  async deployContracts() {
    this.log('Deploying contracts to Polygon Amoy...', 'progress');

    try {
      // Check if we have a private key
      const envContent = fs.readFileSync('.env', 'utf8');
      if (!envContent.includes('PRIVATE_KEY=') || envContent.includes('PRIVATE_KEY=your_private_key_here')) {
        this.log('Please set your PRIVATE_KEY in .env file before deploying contracts', 'error');
        return;
      }

      execSync('npm run deploy:amoy', { stdio: 'inherit' });
      this.log('Contracts deployed successfully', 'success');
    } catch (error) {
      this.log('Contract deployment failed', 'error');
      this.log('You can deploy manually later with: npm run deploy:amoy', 'info');
    }
  }

  async startServices() {
    this.log('Starting VerifyCert services...', 'progress');

    const services = [
      {
        name: 'Backend API',
        command: 'npm',
        args: ['run', 'backend:dev'],
        cwd: process.cwd(),
        port: 5000,
        url: 'http://localhost:5000'
      },
      {
        name: 'Frontend App',
        command: 'npm',
        args: ['run', 'frontend:dev'],
        cwd: process.cwd(),
        port: 3000,
        url: 'http://localhost:3000'
      }
    ];

    for (const service of services) {
      this.log(`Starting ${service.name}...`, 'progress');
      
      const process = spawn(service.command, service.args, {
        cwd: service.cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
      });

      process.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          console.log(`[${service.name}] ${output}`);
        }
      });

      process.stderr.on('data', (data) => {
        const output = data.toString().trim();
        if (output && !output.includes('webpack compiled')) {
          console.error(`[${service.name}] ${output}`);
        }
      });

      process.on('close', (code) => {
        this.log(`${service.name} exited with code ${code}`, code === 0 ? 'info' : 'error');
      });

      this.processes.push({ name: service.name, process, ...service });
    }

    // Wait a moment for services to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    this.log('Services started! Checking availability...', 'progress');
    await this.checkServiceAvailability();
  }

  async checkServiceAvailability() {
    const axios = require('axios').default;
    
    // Check backend
    try {
      const response = await axios.get('http://localhost:5000/api/verify-certificate/status', {
        timeout: 5000
      });
      this.log('Backend API is running and accessible', 'success');
    } catch (error) {
      this.log('Backend API is not yet accessible (this is normal, it may still be starting)', 'warning');
    }

    // Check frontend (just check if port is responding)
    try {
      await axios.get('http://localhost:3000', { timeout: 5000 });
      this.log('Frontend app is running and accessible', 'success');
    } catch (error) {
      this.log('Frontend app is not yet accessible (this is normal, it may still be starting)', 'warning');
    }
  }

  async showSuccessMessage() {
    console.log('\n' + '='.repeat(60));
    this.log('🎉 VerifyCert is now running!', 'success');
    console.log('');
    this.log('📱 Frontend App: http://localhost:3000', 'info');
    this.log('🔧 Backend API: http://localhost:5000', 'info');
    this.log('📋 API Status: http://localhost:5000/api/verify-certificate/status', 'info');
    console.log('');
    this.log('🔍 To verify a certificate, visit: http://localhost:3000/verify', 'info');
    this.log('📖 For more information, see: CERTIFICATE_SYSTEM_INTEGRATION.md', 'info');
    console.log('');
    this.log('Press Ctrl+C to stop all services', 'info');
    console.log('='.repeat(60));
  }

  setupGracefulShutdown() {
    const shutdown = () => {
      this.log('Shutting down services...', 'progress');
      
      this.processes.forEach(({ name, process }) => {
        this.log(`Stopping ${name}...`, 'progress');
        process.kill('SIGTERM');
      });

      setTimeout(() => {
        this.log('Goodbye!', 'success');
        process.exit(0);
      }, 2000);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  async run() {
    try {
      console.log('🚀 VerifyCert Quick Start\n');

      await this.checkPrerequisites();
      await this.checkEnvironmentFiles();
      await this.installDependencies();
      await this.checkContractDeployment();
      
      const shouldStart = await this.prompt('Start all services now? (y/n): ');
      
      if (shouldStart.toLowerCase() === 'y') {
        await this.startServices();
        await this.showSuccessMessage();
        
        this.setupGracefulShutdown();
        
        // Keep the process running
        await new Promise(() => {});
      } else {
        this.log('Setup complete! You can start services manually with:', 'success');
        this.log('  Backend: npm run backend:dev', 'info');
        this.log('  Frontend: npm run frontend:dev', 'info');
      }

    } catch (error) {
      this.log(`Setup failed: ${error.message}`, 'error');
      process.exit(1);
    } finally {
      rl.close();
    }
  }
}

// Run the quick start script
if (require.main === module) {
  const quickStart = new QuickStart();
  quickStart.run();
}

module.exports = QuickStart;