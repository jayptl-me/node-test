const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'event-management-api' },
    transports: [
        // Write all logs with level 'error' and below to error.log
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write all logs with level 'info' and below to combined.log
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    ]
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Log request
    logger.info('Request started', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requestId: req.id || Math.random().toString(36).substr(2, 9)
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        const duration = Date.now() - start;

        logger.info('Request completed', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip
        });

        originalEnd.call(this, chunk, encoding);
    };

    next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
    logger.error('Request error', {
        error: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    next(err);
};

// Security event logger
const securityLogger = {
    rateLimitExceeded: (req) => {
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            url: req.url,
            method: req.method,
            userAgent: req.get('User-Agent')
        });
    },

    suspiciousRequest: (req, reason) => {
        logger.warn('Suspicious request detected', {
            reason,
            ip: req.ip,
            url: req.url,
            method: req.method,
            userAgent: req.get('User-Agent'),
            body: req.body
        });
    }
};

module.exports = {
    logger,
    requestLogger,
    errorLogger,
    securityLogger
};
