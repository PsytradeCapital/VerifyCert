require('dotenv').config();

const config = {
  // Server configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // CORS configuration
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Blockchain configuration
  blockchain: {
    rpcUrl: process.env.POLYGON_MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
    privateKey: process.env.PRIVATE_KEY,
    contractAddress: process.env.CONTRACT_ADDRESS,
    networkId: 80001, // Polygon Mumbai
    gasLimit: 500000,
    gasPrice: '20000000000' // 20 gwei
  },
  
  // Email configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    secure: false // true for 465, false for other ports
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  // Validation
  validation: {
    maxFileSize: '10mb',
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif']
  }
};

// Validate required environment variables
const requiredEnvVars = ['POLYGON_MUMBAI_RPC_URL', 'PRIVATE_KEY'];

if (config.nodeEnv === 'production') {
  requiredEnvVars.push('CONTRACT_ADDRESS', 'EMAIL_USER', 'EMAIL_PASS');
}

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`Warning: Missing environment variables: ${missingEnvVars.join(', ')}`);
  if (config.nodeEnv === 'production') {
    console.error('Required environment variables missing in production');
    process.exit(1);
  }
}

module.exports = config;