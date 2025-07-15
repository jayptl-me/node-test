const validator = require('validator');

/**
 * Advanced input sanitization and validation utilities
 */

const sanitizeInput = {
    // Sanitize string input
    string: (input, options = {}) => {
        if (typeof input !== 'string') return '';

        let sanitized = input.trim();

        // Remove null bytes
        sanitized = sanitized.replace(/\0/g, '');

        // Escape HTML if needed
        if (options.escapeHtml !== false) {
            sanitized = validator.escape(sanitized);
        }

        // Limit length
        if (options.maxLength) {
            sanitized = sanitized.substring(0, options.maxLength);
        }

        return sanitized;
    },

    // Sanitize email
    email: (email) => {
        if (typeof email !== 'string') return '';
        return validator.normalizeEmail(email.trim().toLowerCase()) || '';
    },

    // Sanitize numeric input
    number: (input, options = {}) => {
        const num = parseInt(input, 10);
        if (isNaN(num)) return null;

        if (options.min !== undefined && num < options.min) return null;
        if (options.max !== undefined && num > options.max) return null;

        return num;
    },

    // Sanitize date input
    date: (dateString) => {
        if (!dateString) return null;

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;

        return date;
    }
};

/**
 * Request validation middleware
 */
const validateRequest = (req, res, next) => {
    // Check for suspicious patterns in request
    const suspiciousPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /data:text\/html/gi,
        /<iframe/gi,
        /<object/gi,
        /<embed/gi
    ];

    const requestBody = JSON.stringify(req.body);
    const requestQuery = JSON.stringify(req.query);
    const requestParams = JSON.stringify(req.params);

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(requestBody) || pattern.test(requestQuery) || pattern.test(requestParams)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input detected',
                error: 'Request contains potentially malicious content'
            });
        }
    }

    next();
};

/**
 * Advanced input sanitization middleware
 */
const sanitizeRequestData = (req, res, next) => {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
    }

    next();
};

/**
 * Recursively sanitize object properties
 */
const sanitizeObject = (obj) => {
    const sanitized = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeInput.string(value);
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            sanitized[key] = sanitizeObject(value);
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map(item =>
                typeof item === 'string' ? sanitizeInput.string(item) : item
            );
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
};

module.exports = {
    sanitizeInput,
    validateRequest,
    sanitizeRequestData
};
