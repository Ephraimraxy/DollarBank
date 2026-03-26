import { body, param, query, validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';

export const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const errorMessages = errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg,
            value: err.value,
        }));

        throw new ValidationError('Validation failed', errorMessages);
    };
};

// Password validation helper - relaxed for better UX
export const validatePassword = (field = 'password') => {
    return body(field)
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .notEmpty()
        .withMessage('Password is required');
};

// Common validation rules
export const registerValidation = [
    body('fullName')
        .trim()
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ min: 2, max: 255 })
        .withMessage('Full name must be between 2 and 255 characters'),
    
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email must not exceed 255 characters'),
    
    validatePassword('password'),
];

export const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

export const transferValidation = [
    body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be a positive number greater than 0.01'),
    
    body('recipientName')
        .trim()
        .notEmpty()
        .withMessage('Recipient name is required'),
    
    body('bankName')
        .trim()
        .notEmpty()
        .withMessage('Bank name is required'),

    body('recipientAccount')
        .trim()
        .notEmpty()
        .withMessage('Recipient account number is required'),
];

export const passwordResetValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
];

export const resetPasswordValidation = [
    body('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    
    validatePassword('newPassword'),
];

export const verifyEmailValidation = [
    body('token')
        .notEmpty()
        .withMessage('Verification token is required'),
];

