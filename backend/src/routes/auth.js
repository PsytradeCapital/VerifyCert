const express = require('express');
const router = express.Router();

const User = require('../models/User');
const OTP = require('../models/OTP');
const AuthUtils = require('../utils/auth');
const otpService = require('../services/otpService');
const { 
  authenticateToken, 
  requireVerified, 
  authRateLimit, 
  logAuthEvent, 
  validateBody 
} = require('../middleware/auth');
const {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  resendOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema
} = require('../validation/authSchemas');

// POST /api/auth/register - User registration
router.post('/register', 
  authRateLimit(15 * 60 * 1000, 10), // 10 attempts per 15 minutes
  validateBody(registerSchema),
  logAuthEvent('REGISTER_ATTEMPT'),
  async (req, res) => {
    try {
      const { name, email, phone, password, region } = req.validatedBody;

      // Check if user already exists
      const existingUser = await User.exists(email, phone);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'An account with this email or phone number already exists'
          }
        });
      }

      // Format phone number if provided
      let formattedPhone = phone;
      if (phone) {
        const phoneValidation = AuthUtils.validatePhone(phone, region);
        if (!phoneValidation.isValid) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_PHONE',
              message: phoneValidation.error
            }
          });
        }
        formattedPhone = phoneValidation.e164;
      }

      // Create user
      const user = await User.create({
        name,
        email,
        phone: formattedPhone,
        password,
        region: region || AuthUtils.detectRegionFromPhone(formattedPhone) || 'US'
      });

      // Send verification OTP
      const otpType = email ? 'email' : 'sms';
      await otpService.generateAndSendOTP(user, otpType);

      res.status(201).json({
        success: true,
        message: `Registration successful. Please check your ${email ? 'email' : 'phone'} for verification code.`,
        data: {
          userId: user.id,
          verificationType: otpType
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: 'Registration failed. Please try again.'
        }
      });
    }
  }
);

// POST /api/auth/verify-otp - Verify OTP and activate account
router.post('/verify-otp',
  authRateLimit(5 * 60 * 1000, 10), // 10 attempts per 5 minutes
  validateBody(verifyOTPSchema),
  logAuthEvent('OTP_VERIFICATION'),
  async (req, res) => {
    try {
      const { userId, code, type } = req.validatedBody;

      // Get user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      // Verify OTP
      const verification = await otpService.verifyOTP(userId, code, type);
      if (!verification.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_OTP',
            message: verification.error
          }
        });
      }

      // Mark user as verified
      await user.markAsVerified();

      // Generate JWT token
      const token = AuthUtils.generateToken(user);

      res.json({
        success: true,
        message: 'Account verified successfully',
        data: {
          token,
          user: user.toPublicJSON()
        }
      });

    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'VERIFICATION_FAILED',
          message: 'Verification failed. Please try again.'
        }
      });
    }
  }
);

// POST /api/auth/login - User login
router.post('/login',
  authRateLimit(15 * 60 * 1000, 5), // 5 attempts per 15 minutes
  validateBody(loginSchema),
  logAuthEvent('LOGIN_ATTEMPT'),
  async (req, res) => {
    try {
      const { identifier, password } = req.validatedBody;

      // Find user by email or phone
      const user = await User.findByIdentifier(identifier);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email/phone or password'
          }
        });
      }

      // Verify password
      const isValidPassword = await user.verifyPassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email/phone or password'
          }
        });
      }

      // Check if account is verified
      if (!user.is_verified) {
        // Send new verification OTP
        const otpType = user.email ? 'email' : 'sms';
        await otpService.generateAndSendOTP(user, otpType);

        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCOUNT_NOT_VERIFIED',
            message: `Account not verified. Verification code sent to your ${user.email ? 'email' : 'phone'}.`
          },
          data: {
            userId: user.id,
            verificationType: otpType
          }
        });
      }

      // Generate JWT token
      const token = AuthUtils.generateToken(user);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: user.toPublicJSON()
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: 'Login failed. Please try again.'
        }
      });
    }
  }
);

// POST /api/auth/resend-otp - Resend OTP
router.post('/resend-otp',
  authRateLimit(5 * 60 * 1000, 3), // 3 attempts per 5 minutes
  validateBody(resendOTPSchema),
  logAuthEvent('OTP_RESEND'),
  async (req, res) => {
    try {
      const { userId, type } = req.validatedBody;

      // Get user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      // Send OTP
      await otpService.generateAndSendOTP(user, type);

      res.json({
        success: true,
        message: `Verification code sent to your ${type === 'email' ? 'email' : 'phone'}`
      });

    } catch (error) {
      console.error('Resend OTP error:', error);
      
      if (error.message.includes('Too many OTP requests')) {
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: error.message
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'RESEND_FAILED',
          message: 'Failed to resend verification code. Please try again.'
        }
      });
    }
  }
);

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password',
  authRateLimit(60 * 60 * 1000, 3), // 3 attempts per hour
  validateBody(forgotPasswordSchema),
  logAuthEvent('PASSWORD_RESET_REQUEST'),
  async (req, res) => {
    try {
      const { identifier } = req.validatedBody;

      // Find user
      const user = await User.findByIdentifier(identifier);
      if (!user) {
        // Don't reveal if user exists or not for security
        return res.json({
          success: true,
          message: 'If an account with this email/phone exists, you will receive a password reset code.'
        });
      }

      // Send password reset OTP
      const otpType = user.email ? 'email' : 'sms';
      await otpService.generateAndSendOTP(user, 'password_reset');

      res.json({
        success: true,
        message: 'If an account with this email/phone exists, you will receive a password reset code.',
        data: {
          userId: user.id // Only return this for legitimate requests
        }
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'RESET_REQUEST_FAILED',
          message: 'Failed to process password reset request. Please try again.'
        }
      });
    }
  }
);

// POST /api/auth/reset-password - Reset password with OTP
router.post('/reset-password',
  authRateLimit(15 * 60 * 1000, 5), // 5 attempts per 15 minutes
  validateBody(resetPasswordSchema),
  logAuthEvent('PASSWORD_RESET'),
  async (req, res) => {
    try {
      const { userId, code, newPassword } = req.validatedBody;

      // Get user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      // Verify OTP
      const verification = await otpService.verifyOTP(userId, code, 'password_reset');
      if (!verification.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_OTP',
            message: verification.error
          }
        });
      }

      // Update password
      await user.updatePassword(newPassword);

      res.json({
        success: true,
        message: 'Password reset successfully'
      });

    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PASSWORD_RESET_FAILED',
          message: 'Password reset failed. Please try again.'
        }
      });
    }
  }
);

// POST /api/auth/logout - Logout (token invalidation would be handled client-side)
router.post('/logout',
  authenticateToken,
  logAuthEvent('LOGOUT'),
  async (req, res) => {
    try {
      // In a more complex system, you might maintain a token blacklist
      // For now, we'll just return success and let the client handle token removal
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_FAILED',
          message: 'Logout failed. Please try again.'
        }
      });
    }
  }
);

// GET /api/auth/profile - Get user profile
router.get('/profile',
  authenticateToken,
  requireVerified,
  async (req, res) => {
    try {
      res.json({
        success: true,
        data: {
          user: req.user.toPublicJSON()
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PROFILE_FETCH_FAILED',
          message: 'Failed to fetch profile. Please try again.'
        }
      });
    }
  }
);

// PUT /api/auth/profile - Update user profile
router.put('/profile',
  authenticateToken,
  requireVerified,
  validateBody(updateProfileSchema),
  logAuthEvent('PROFILE_UPDATE'),
  async (req, res) => {
    try {
      const updateData = req.validatedBody;

      // If updating phone, validate and format it
      if (updateData.phone) {
        const phoneValidation = AuthUtils.validatePhone(updateData.phone, updateData.region || req.user.region);
        if (!phoneValidation.isValid) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_PHONE',
              message: phoneValidation.error
            }
          });
        }
        updateData.phone = phoneValidation.e164;
      }

      // Check if email/phone already exists for another user
      if (updateData.email || updateData.phone) {
        const existingUser = await User.findByIdentifier(updateData.email || updateData.phone);
        if (existingUser && existingUser.id !== req.user.id) {
          return res.status(409).json({
            success: false,
            error: {
              code: 'IDENTIFIER_EXISTS',
              message: 'This email or phone number is already associated with another account'
            }
          });
        }
      }

      // Update user
      const updatedUser = await req.user.update(updateData);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: updatedUser.toPublicJSON()
        }
      });

    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PROFILE_UPDATE_FAILED',
          message: 'Profile update failed. Please try again.'
        }
      });
    }
  }
);

// POST /api/auth/change-password - Change password
router.post('/change-password',
  authenticateToken,
  requireVerified,
  validateBody(changePasswordSchema),
  logAuthEvent('PASSWORD_CHANGE'),
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.validatedBody;

      // Verify current password
      const isValidPassword = await req.user.verifyPassword(currentPassword);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CURRENT_PASSWORD',
            message: 'Current password is incorrect'
          }
        });
      }

      // Update password
      await req.user.updatePassword(newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PASSWORD_CHANGE_FAILED',
          message: 'Password change failed. Please try again.'
        }
      });
    }
  }
);

// GET /api/auth/test-config - Test authentication service configuration (development only)
if (process.env.NODE_ENV === 'development') {
  router.get('/test-config', async (req, res) => {
    try {
      const emailTest = await otpService.testEmailConfig();
      const smsTest = await otpService.testSMSConfig();

      res.json({
        success: true,
        data: {
          email: emailTest,
          sms: smsTest,
          jwt: {
            configured: !!process.env.JWT_SECRET,
            message: process.env.JWT_SECRET ? 'JWT secret is configured' : 'JWT secret is missing'
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'CONFIG_TEST_FAILED',
          message: error.message
        }
      });
    }
  });
}

module.exports = router;