const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { setupDatabase } = require('./database/setup');
const { securityHeaders, generalLimiter } = require('./middleware/security');
const { validateRequest, sanitizeRequestData } = require('./middleware/inputSanitization');
const { requestLogger, errorLogger } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true,
    optionsSuccessStatus: 200
}));

// Rate limiting
app.use(generalLimiter);

// Request logging
app.use(requestLogger);

// Body parsing middleware with size limits
app.use(express.json({
    limit: '1mb',
    strict: true
}));
app.use(express.urlencoded({
    extended: true,
    limit: '1mb',
    parameterLimit: 20
}));

// Input validation and sanitization
app.use(validateRequest);
app.use(sanitizeRequestData);

// Request logging middleware (simple console logging for development)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// API routes
app.use(API_PREFIX, routes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Event Management API',
        version: '1.0.0',
        endpoints: {
            health: `${API_PREFIX}/health`,
            events: `${API_PREFIX}/events`,
            users: `${API_PREFIX}/users`
        }
    });
});

// Error handling middleware
app.use(errorLogger);
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        // Setup database
        await setupDatabase();

        app.listen(PORT, () => {
            console.log(`🚀 Event Management API is running on port ${PORT}`);
            console.log(`📍 API Base URL: http://localhost:${PORT}${API_PREFIX}`);
            console.log(`🏥 Health Check: http://localhost:${PORT}${API_PREFIX}/health`);
            console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Start the application
startServer();

module.exports = app;
