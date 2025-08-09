/**
 * Simple CSRF protection middleware without external dependencies
 */
const crypto = require('crypto');

// Store CSRF tokens in memory (in production, use Redis or database)
const csrfTokens = new Map();

// Clean up expired tokens every hour
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of csrfTokens.entries()) {
    if (now > data.expires) {
      csrfTokens.delete(token);
    }
  }
}, 60 * 60 * 1000);

/**
 * Generate CSRF token
 */
function generateCSRFToken(sessionId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  csrfTokens.set(token, {
    sessionId,
    expires
  });
  
  return token;
}

/**
 * Validate CSRF token
 */
function validateCSRFToken(token, sessionId) {
  const tokenData = csrfTokens.get(token);
  
  if (!tokenData) {
    return false;
  }
  
  if (Date.now() > tokenData.expires) {
    csrfTokens.delete(token);
    return false;
  }
  
  if (tokenData.sessionId !== sessionId) {
    return false;
  }
  
  return true;
}

/**
 * Middleware to generate CSRF token
 */
const generateCSRF = (req, res, next) => {
  // Use session ID or create a temporary one
  const sessionId = req.sessionID || req.ip + req.get('User-Agent');
  const csrfToken = generateCSRFToken(sessionId);
  
  req.csrfToken = csrfToken;
  res.locals.csrfToken = csrfToken;
  
  next();
};

/**
 * Middleware to validate CSRF token
 */
const validateCSRF = (req, res, next) => {
  // Skip CSRF validation for GET requests
  if (req.method === 'GET') {
    return next();
  }
  
  const token = req.body._csrf || req.headers['x-csrf-token'];
  const sessionId = req.sessionID || req.ip + req.get('User-Agent');
  
  if (!token) {
    return res.status(403).json({
      success: false,
      error: 'CSRF token missing'
    });
  }
  
  if (!validateCSRFToken(token, sessionId)) {
    return res.status(403).json({
      success: false,
      error: 'Invalid CSRF token'
    });
  }
  
  next();
};

/**
 * Route to get CSRF token
 */
const getCSRFToken = (req, res) => {
  const sessionId = req.sessionID || req.ip + req.get('User-Agent');
  const csrfToken = generateCSRFToken(sessionId);
  
  res.json({
    success: true,
    csrfToken
  });
};

module.exports = {
  generateCSRF,
  validateCSRF,
  getCSRFToken
};