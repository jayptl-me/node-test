const { body, param, validationResult } = require('express-validator');

// Validation middleware to check for validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Event validation rules
const validateCreateEvent = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 1, max: 255 })
        .withMessage('Title must be between 1 and 255 characters'),

    body('dateTime')
        .notEmpty()
        .withMessage('Date and time is required')
        .isISO8601()
        .withMessage('Date and time must be in ISO 8601 format')
        .custom((value) => {
            const date = new Date(value);
            if (date <= new Date()) {
                throw new Error('Event date must be in the future');
            }
            return true;
        }),

    body('location')
        .trim()
        .notEmpty()
        .withMessage('Location is required')
        .isLength({ min: 1, max: 255 })
        .withMessage('Location must be between 1 and 255 characters'),

    body('capacity')
        .isInt({ min: 1, max: 1000 })
        .withMessage('Capacity must be a positive integer between 1 and 1000'),

    handleValidationErrors
];

// User validation rules
const validateCreateUser = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 1, max: 255 })
        .withMessage('Name must be between 1 and 255 characters'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Email must be a valid email address')
        .normalizeEmail(),

    handleValidationErrors
];

// Registration validation rules
const validateRegistration = [
    param('eventId')
        .isInt({ min: 1 })
        .withMessage('Event ID must be a positive integer'),

    body('userId')
        .isInt({ min: 1 })
        .withMessage('User ID must be a positive integer'),

    handleValidationErrors
];

// Parameter validation rules
const validateEventId = [
    param('eventId')
        .isInt({ min: 1 })
        .withMessage('Event ID must be a positive integer'),

    handleValidationErrors
];

const validateUserId = [
    param('userId')
        .isInt({ min: 1 })
        .withMessage('User ID must be a positive integer'),

    handleValidationErrors
];

module.exports = {
    validateCreateEvent,
    validateCreateUser,
    validateRegistration,
    validateEventId,
    validateUserId,
    handleValidationErrors
};
