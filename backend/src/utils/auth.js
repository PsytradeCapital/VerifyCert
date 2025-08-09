const jwt = require('jsonwebtoken');
const { parsePhoneNumber, isValidPhoneNumber } = require('libphonenumber-js');

class AuthUtils {
  // Generate JWT token
  static generateToken(user, expiresIn = '24h') {
    const payload = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_verified: user.is_verified
    };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  }

  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Validate password strength
  static validatePassword(password) {
    const errors = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate email format
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate and format phone number
  static validatePhone(phone, region = 'US') {
    try {
      if (!isValidPhoneNumber(phone, region)) {
        return { isValid: false, error: 'Invalid phone number format' };
      }

      const phoneNumber = parsePhoneNumber(phone, region);
      return {
        isValid: true,
        formatted: phoneNumber.formatInternational(),
        e164: phoneNumber.format('E.164')
      };
    } catch (error) {
      return { isValid: false, error: 'Invalid phone number' };
    }
  }

  // Detect region from phone number
  static detectRegionFromPhone(phone) {
    try {
      const phoneNumber = parsePhoneNumber(phone);
      return phoneNumber.country || 'US';
    } catch (error) {
      return 'US';
    }
  }

  // Get regional preferences
  static getRegionalPreferences(region) {
    const preferences = {
      'US': { preferredMethod: 'email', smsProvider: 'twilio' },
      'CA': { preferredMethod: 'email', smsProvider: 'twilio' },
      'GB': { preferredMethod: 'email', smsProvider: 'twilio' },
      'DE': { preferredMethod: 'email', smsProvider: 'twilio' },
      'FR': { preferredMethod: 'email', smsProvider: 'twilio' },
      'KE': { preferredMethod: 'phone', smsProvider: 'africas_talking' },
      'NG': { preferredMethod: 'phone', smsProvider: 'africas_talking' },
      'GH': { preferredMethod: 'phone', smsProvider: 'africas_talking' },
      'ZA': { preferredMethod: 'phone', smsProvider: 'africas_talking' },
      'IN': { preferredMethod: 'phone', smsProvider: 'twilio' },
      'CN': { preferredMethod: 'phone', smsProvider: 'twilio' },
      'JP': { preferredMethod: 'email', smsProvider: 'twilio' }
    };

    return preferences[region] || { preferredMethod: 'email', smsProvider: 'twilio' };
  }

  // Generate secure random string
  static generateSecureRandom(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Hash sensitive data (for logging purposes)
  static hashForLogging(data) {
    if (!data) return null;
    
    if (typeof data === 'string') {
      if (data.includes('@')) {
        // Email - show first 2 chars and domain
        const [local, domain] = data.split('@');
        return `${local.substring(0, 2)}***@${domain}`;
      } else if (data.startsWith('+')) {
        // Phone - show country code and last 4 digits
        return `${data.substring(0, 3)}***${data.slice(-4)}`;
      }
    }
    
    return '***';
  }

  // Extract token from Authorization header
  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  // Check if user has required role
  static hasRole(user, requiredRole) {
    const roleHierarchy = {
      'user': 1,
      'issuer': 2,
      'admin': 3
    };

    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  }

  // Generate password reset token
  static generateResetToken() {
    return this.generateSecureRandom(64);
  }

  // Validate registration data
  static validateRegistrationData(data) {
    const errors = [];

    // Name validation
    if (!data.name || data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    // Email or phone validation
    if (!data.email && !data.phone) {
      errors.push('Either email or phone number is required');
    }

    if (data.email && !this.validateEmail(data.email)) {
      errors.push('Invalid email format');
    }

    if (data.phone) {
      const phoneValidation = this.validatePhone(data.phone, data.region);
      if (!phoneValidation.isValid) {
        errors.push(phoneValidation.error);
      }
    }

    // Password validation
    if (!data.password) {
      errors.push('Password is required');
    } else {
      const passwordValidation = this.validatePassword(data.password);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = AuthUtils;