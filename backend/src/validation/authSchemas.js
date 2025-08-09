const Joi = require('joi');

// Password validation schema
const passwordSchema = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    'any.required': 'Password is required'
  });

// Email validation schema
const emailSchema = Joi.string()
  .email()
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  });

// Phone validation schema
const phoneSchema = Joi.string()
  .pattern(/^\+[1-9]\d{1,14}$/)
  .required()
  .messages({
    'string.pattern.base': 'Please provide a valid phone number in international format (e.g., +1234567890)',
    'any.required': 'Phone number is required'
  });

// Name validation schema
const nameSchema = Joi.string()
  .min(2)
  .max(100)
  .pattern(/^[a-zA-Z\s'-]+$/)
  .required()
  .messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
    'string.pattern.base': 'Name can only contain letters, spaces, hyphens, and apostrophes',
    'any.required': 'Name is required'
  });

// Region validation schema
const regionSchema = Joi.string()
  .length(2)
  .uppercase()
  .default('US')
  .messages({
    'string.length': 'Region must be a 2-letter country code',
    'string.uppercase': 'Region must be uppercase'
  });

// OTP code validation schema
const otpCodeSchema = Joi.string()
  .length(6)
  .pattern(/^\d{6}$/)
  .required()
  .messages({
    'string.length': 'OTP code must be exactly 6 digits',
    'string.pattern.base': 'OTP code must contain only numbers',
    'any.required': 'OTP code is required'
  });

// Registration schema
const registerSchema = Joi.object({
  name: nameSchema,
  email: Joi.when('phone', {
    is: Joi.exist(),
    then: emailSchema.optional(),
    otherwise: emailSchema.required()
  }),
  phone: Joi.when('email', {
    is: Joi.exist(),
    then: phoneSchema.optional(),
    otherwise: phoneSchema.required()
  }),
  password: passwordSchema,
  region: regionSchema
}).xor('email', 'phone').messages({
  'object.xor': 'Either email or phone number must be provided, but not both'
});

// Login schema
const loginSchema = Joi.object({
  identifier: Joi.string()
    .required()
    .messages({
      'any.required': 'Email or phone number is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// OTP verification schema
const verifyOTPSchema = Joi.object({
  userId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be positive',
      'any.required': 'User ID is required'
    }),
  code: otpCodeSchema,
  type: Joi.string()
    .valid('email', 'sms', 'password_reset')
    .required()
    .messages({
      'any.only': 'OTP type must be email, sms, or password_reset',
      'any.required': 'OTP type is required'
    })
});

// Resend OTP schema
const resendOTPSchema = Joi.object({
  userId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be positive',
      'any.required': 'User ID is required'
    }),
  type: Joi.string()
    .valid('email', 'sms')
    .required()
    .messages({
      'any.only': 'OTP type must be email or sms',
      'any.required': 'OTP type is required'
    })
});

// Forgot password schema
const forgotPasswordSchema = Joi.object({
  identifier: Joi.string()
    .required()
    .messages({
      'any.required': 'Email or phone number is required'
    })
});

// Reset password schema
const resetPasswordSchema = Joi.object({
  userId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be positive',
      'any.required': 'User ID is required'
    }),
  code: otpCodeSchema,
  newPassword: passwordSchema
});

// Update profile schema
const updateProfileSchema = Joi.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  region: regionSchema.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Change password schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  newPassword: passwordSchema
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  resendOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  
  // Individual schemas for reuse
  passwordSchema,
  emailSchema,
  phoneSchema,
  nameSchema,
  regionSchema,
  otpCodeSchema
};