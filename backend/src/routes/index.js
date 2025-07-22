const express = require('express');
const router = express.Router();

// Import route modules
const certificatesRouter = require('./certificates');
// const issuersRouter = require('./issuers');
// const utilityRouter = require('./utility');

// API status endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'VerifyCert API v1',
    version: '1.0.0',
    endpoints: {
      certificates: '/api/v1/certificates',
      issuers: '/api/v1/issuers',
      utility: '/api/v1/utility'
    }
  });
});

// Route modules
router.use('/certificates', certificatesRouter);
// router.use('/issuers', issuersRouter);
// router.use('/utility', utilityRouter);

module.exports = router;