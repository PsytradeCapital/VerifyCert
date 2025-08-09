require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.'
    }
  }
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'VerifyCert Backend API - Amoy Network',
    network: 'amoy',
    chainId: 80002,
    contractAddress: process.env.CONTRACT_ADDRESS || '0x6c9D554C721dA0CEA1b975982eAEe1f924271F50',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import routes
const mintCertificateAmoy = require('../routes/mintCertificateAmoy');
const verifyCertificateAmoy = require('../routes/verifyCertificateAmoy');
const authRoutes = require('./routes/auth');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/certificates', mintCertificateAmoy);
app.use('/api/certificates', verifyCertificateAmoy);

// Network info endpoint
app.get('/api/network', (req, res) => {
  res.json({
    success: true,
    data: {
      network: 'amoy',
      chainId: 80002,
      rpcUrl: process.env.RPC_URL || 'https://rpc-amoy.polygon.technology/',
      blockExplorer: 'https://amoy.polygonscan.com',
      faucet: 'https://faucet.polygon.technology/',
      contractAddress: process.env.CONTRACT_ADDRESS || '0x6c9D554C721dA0CEA1b975982eAEe1f924271F50'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle different error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: err.message
      }
    });
  }
  
  if (err.code === 'BLOCKCHAIN_ERROR') {
    return res.status(503).json({
      success: false,
      error: {
        code: 'BLOCKCHAIN_ERROR',
        message: 'Blockchain operation failed',
        details: err.message
      }
    });
  }
  
  if (err.code === 'NETWORK_ERROR') {
    return res.status(503).json({
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Network connectivity issue',
        details: err.message
      }
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? err.message : 'Please try again later'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`VerifyCert Backend API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});