const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiting configuration
const createRateLimit = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            message,
            error: 'Rate limit exceeded'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(429).json({
                success: false,
                message,
                error: 'Rate limit exceeded'
            });
        }
    });
};

// General API rate limiting
const generalLimiter = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // limit each IP to 100 requests per windowMs
    'Too many requests from this IP, please try again later'
);

// Strict rate limiting for registration endpoints
const registrationLimiter = createRateLimit(
    1 * 60 * 1000, // 1 minute
    5, // limit each IP to 5 registration attempts per minute
    'Too many registration attempts, please try again later'
);

// Strict rate limiting for user/event creation
const createLimiter = createRateLimit(
    5 * 60 * 1000, // 5 minutes
    10, // limit each IP to 10 creation requests per 5 minutes
    'Too many creation requests, please try again later'
);

// Security headers configuration
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'same-origin' }
});

module.exports = {
    generalLimiter,
    registrationLimiter,
    createLimiter,
    securityHeaders
};
