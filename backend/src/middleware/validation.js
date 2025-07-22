const Joi = require('joi');

/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'params', 'query')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const validationError = new Error(error.details.map(detail => detail.message).join(', '));
      validationError.name = 'ValidationError';
      return next(validationError);
    }

    req[property] = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  ethereumAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  tokenId: Joi.string().pattern(/^\d+$/).required(),
  certificateData: Joi.object({
    recipientAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
    recipientName: Joi.string().min(1).max(255).required(),
    courseName: Joi.string().min(1).max(255).required(),
    institutionName: Joi.string().min(1).max(255).required(),
    issueDate: Joi.date().iso().optional().default(() => new Date())
  })
};

module.exports = {
  validate,
  schemas
};