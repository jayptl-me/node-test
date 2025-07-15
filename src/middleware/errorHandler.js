const { logger } = require('../utils/logger');

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    // Log error details
    logger.error('Application error', {
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    // Database errors
    if (err.code === '23505') { // Unique constraint violation
        return res.status(409).json({
            success: false,
            message: 'Resource already exists',
            error: 'Duplicate entry detected'
        });
    }

    if (err.code === '23503') { // Foreign key constraint violation
        return res.status(400).json({
            success: false,
            message: 'Invalid reference',
            error: 'Referenced resource does not exist'
        });
    }

    if (err.code === '23514') { // Check constraint violation
        return res.status(400).json({
            success: false,
            message: 'Invalid data',
            error: 'Data violates constraints'
        });
    }

    // Connection errors
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        return res.status(503).json({
            success: false,
            message: 'Service temporarily unavailable',
            error: 'Database connection failed'
        });
    }

    // Validation errors from express-validator
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            error: err.message
        });
    }

    // JSON parsing errors
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON format',
            error: 'Request body contains invalid JSON'
        });
    }

    // Default error response
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        success: false,
        message: statusCode >= 500 ? 'Internal server error' : message,
        error: process.env.NODE_ENV === 'development' ? err.stack : 'Something went wrong'
    });
};

// 404 handler
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        error: `Cannot ${req.method} ${req.path}`
    });
};

module.exports = {
    errorHandler,
    notFoundHandler
};
