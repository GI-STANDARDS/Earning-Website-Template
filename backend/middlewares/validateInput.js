const { body, validationResult } = require('express-validator');

/**
 * Validation middleware to check for validation errors
 */
const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Registration validation rules
 */
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty()
];

/**
 * Login validation rules
 */
const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

/**
 * Email validation rule
 */
const emailValidation = body('email').isEmail().normalizeEmail();

/**
 * Password validation rule
 */
const passwordValidation = body('password').isLength({ min: 6 });

module.exports = {
  validateInput,
  registerValidation,
  loginValidation,
  emailValidation,
  passwordValidation
};
