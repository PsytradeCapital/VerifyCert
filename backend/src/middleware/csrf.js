const crypto = require('crypto');

// Simple CSRF protection middleware
class CSRFProtection {
  constructor() {
    this.tokens = new Map();
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000); // Cleanup every hour
  }

  // Generate CSRF token
  generateToken(sessionId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + (60 * 60 * 1000); // 1 hour expiry
    
    this.tokens.set(token, {
      sessionId,
      expiry
    });

    return token;
  }

  // Validate CSRF token
  validateToken(token, sessionId) {
    const tokenData = this.tokens.get(token);
    
    if (!tokenData) {
      return false;
    }

    if (tokenData.expiry < Date.now()) {
      this.tokens.delete(token);
      return false;
    }

    if (tokenData.sessionId !== sessionId) {
      return false;
    }

    return true;
  }

  // Cleanup expired tokens
  cleanup() {
    const now = Date.now();
    for (const [token, data] of this.tokens.entries()) {
      if (data.expiry < now) {
        this.tokens.delete(token);
      }
    }
  }

  // Middleware to generate CSRF token
  generateMiddleware() {
    return (req, res, next) => {
      // Use session ID or IP as identifier
      const sessionId = req.sessionID || req.ip;
      const csrfToken = this.generateToken(sessionId);
      
      res.locals.csrfToken = csrfToken;
      res.setHeader('X-CSRF-Token', csrfToken);
      
      next();
    };
  }

  // Middleware to validate CSRF token
  validateMiddleware() {
    return (req, res, next) => {
      // Skip validation for GET, HEAD, OPTIONS
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }

      const token = req.headers['x-csrf-token'] || req.body._csrf;
      const sessionId = req.sessionID || req.ip;

      if (!token) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'CSRF_TOKEN_MISSING',
            message: 'CSRF token is required'
          }
        });
      }

      if (!this.validateToken(token, sessionId)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'CSRF_TOKEN_INVALID',
            message: 'Invalid or expired CSRF token'
          }
        });
      }

      next();
    };
  }
}

// Create singleton instance
const csrfProtection = new CSRFProtection();

module.exports = {
  generateCSRFToken: csrfProtection.generateMiddleware(),
  validateCSRFToken: csrfProtection.validateMiddleware(),
  csrfProtection
};