const express = require('express');
const eventRoutes = require('./events');
const userRoutes = require('./users');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Event Management API is running',
        timestamp: new Date().toISOString()
    });
});

// API routes
router.use('/events', eventRoutes);
router.use('/users', userRoutes);

module.exports = router;
