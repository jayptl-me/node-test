const express = require('express');
const eventController = require('../controllers/eventController');
const {
    validateCreateEvent,
    validateRegistration,
    validateEventId
} = require('../middleware/validation');
const { createLimiter, registrationLimiter } = require('../middleware/security');

const router = express.Router();

// List upcoming events (must be before parameterized routes)
router.get('/', eventController.listUpcomingEvents);

// Create a new event
router.post('/', createLimiter, validateCreateEvent, eventController.createEvent);

// Get event details with registered users
router.get('/:eventId', validateEventId, eventController.getEventDetails);

// Register a user for an event
router.post('/:eventId/register', registrationLimiter, validateRegistration, eventController.registerForEvent);

// Cancel user registration for an event
router.delete('/:eventId/register', registrationLimiter, validateRegistration, eventController.cancelRegistration);

// Get event statistics
router.get('/:eventId/stats', validateEventId, eventController.getEventStats);

module.exports = router;
