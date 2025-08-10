#!/usr/bin/env node

/**
 * Authentication Server Startup Script
 * Starts the backend server with authentication system
 */

const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('📁 Created data directory');
}

// Check environment configuration
const requiredEnvVars = [
  'AMOY_RPC_URL',
  'PRIVATE_KEY',
  'JWT_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Set default port if not specified
if (!process.env.PORT) {
  process.env.PORT = '4000';
}

console.log('🔐 Starting VerifyCert Authentication Server...');
console.log('=' .repeat(50));

// Start the server
require('./src/server');

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Display startup information
setTimeout(() => {
  console.log('\n' + '=' .repeat(50));
  console.log('✅ Authentication Server Started Successfully!');
  console.log('=' .repeat(50));
  console.log(`🌐 Server URL: http://localhost:${process.env.PORT}`);
  console.log(`🔗 Health Check: http://localhost:${process.env.PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${process.env.PORT}/api/auth`);
  console.log(`📜 Certificate API: http://localhost:${process.env.PORT}/api/verify-certificate`);
  console.log(`📊 Mint API: http://localhost:${process.env.PORT}/api/mint-certificate`);
  console.log('\n📋 Available Endpoints:');
  console.log('   POST /api/auth/register - User registration');
  console.log('   POST /api/auth/login - User login');
  console.log('   POST /api/auth/verify-otp - OTP verification');
  console.log('   POST /api/auth/forgot-password - Password reset request');
  console.log('   POST /api/auth/reset-password - Password reset');
  console.log('   GET  /api/auth/profile - Get user profile');
  console.log('   PUT  /api/auth/profile - Update user profile');
  console.log('   POST /api/mint-certificate - Issue new certificate');
  console.log('   GET  /api/verify-certificate/:id - Verify certificate');
  console.log('\n🧪 Test the system:');
  console.log('   node test-auth-system.js');
  console.log('   node test-certificate-system.js');
  console.log('\n🚀 Ready to accept requests!');
}, 1000);