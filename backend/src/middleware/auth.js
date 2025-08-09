const AuthUtils = require('../utils/auth');
const User = require('../models/User');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Access token is required'
        }
      });
    }

    // Verify token
    const decoded = AuthUtils.verifyToken(token);
    
    // Get user from database to ensure they still exist and are verified
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User account not found'
        }
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    });
  }
};

// Middleware to require verified account
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'NOT_AUTHENTICATED',
        message: 'Authentication required'
      }
    });
  }

  if (!req.user.is_verified) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'ACCOUNT_NOT_VERIFIED',
        message: 'Account verification required'
      }
    });
  }

  next();
};

// Middleware to require specific role
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'Authentication required'
        }
      });
    }

    if (!AuthUtils.hasRole(req.user, requiredRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `${requiredRole} role required`
        }
      });
    }

    next();
  };
};

// Middleware for optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthUtils.extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = AuthUtils.verifyToken(token);
      const user = await User.findById(decoded.id);
      
      if (user) {
        req.user = user;
        req.token = token;
      }
    }
  } catch (error) {
    // Silently ignore authentication errors for optional auth
    console.log('Optional auth failed:', error.message);
  }

  next();
};

// Rate limiting middleware for authentication endpoints
const authRateLimit = (windowMs = 15 * 60 * 1000, max = 5) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip + (req.body.email || req.body.phone || req.body.identifier || '');
    const now = Date.now();
    
    // Clean old attempts
    for (const [attemptKey, data] of attempts.entries()) {
      if (now - data.firstAttempt > windowMs) {
        attempts.delete(attemptKey);
      }
    }

    // Check current attempts
    const userAttempts = attempts.get(key);
    
    if (!userAttempts) {
      attempts.set(key, { count: 1, firstAttempt: now });
    } else {
      userAttempts.count++;
      
      if (userAttempts.count > max) {
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many attempts. Please try again in ${Math.ceil(windowMs / 60000)} minutes.`
          }
        });
      }
    }

    next();
  };
};

// Middleware to log authentication events
const logAuthEvent = (eventType) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the event
      const logData = {
        timestamp: new Date().toISOString(),
        event: eventType,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: JSON.parse(data).success,
        user: req.user ? AuthUtils.hashForLogging(req.user.email || req.user.phone) : null
      };
      
      console.log('Auth Event:', JSON.stringify(logData));
      
      // Call original send
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Middleware to validate request body
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors
        }
      });
    }
    
    req.validatedBody = value;
    next();
  };
};

module.exports = {
  authenticateToken,
  requireVerified,
  requireRole,
  optionalAuth,
  authRateLimit,
  logAuthEvent,
  validateBody
};