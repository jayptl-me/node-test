const Event = require('../models/Event');
const User = require('../models/User');

const eventController = {
    // Create a new event
    async createEvent(req, res, next) {
        try {
            const { title, dateTime, location, capacity } = req.body;

            const event = await Event.create(title, dateTime, location, capacity);

            res.status(201).json({
                success: true,
                message: 'Event created successfully',
                data: {
                    eventId: event.id,
                    event
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // Get event details with registered users
    async getEventDetails(req, res, next) {
        try {
            const { eventId } = req.params;

            const event = await Event.findByIdWithRegistrations(eventId);

            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
            }

            res.json({
                success: true,
                message: 'Event details retrieved successfully',
                data: event
            });
        } catch (error) {
            next(error);
        }
    },

    // Register a user for an event
    async registerForEvent(req, res, next) {
        try {
            const { eventId } = req.params;
            const { userId } = req.body;

            // Check if user exists
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const result = await Event.registerUser(eventId, userId);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: result.error
                });
            }

            res.status(201).json({
                success: true,
                message: 'User registered for event successfully',
                data: result.registration
            });
        } catch (error) {
            next(error);
        }
    },

    // Cancel user registration for an event
    async cancelRegistration(req, res, next) {
        try {
            const { eventId } = req.params;
            const { userId } = req.body;

            // Check if user exists
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const result = await Event.cancelRegistration(eventId, userId);

            if (!result.success) {
                return res.status(404).json({
                    success: false,
                    message: result.error
                });
            }

            res.json({
                success: true,
                message: 'Registration cancelled successfully',
                data: result.cancelledRegistration
            });
        } catch (error) {
            next(error);
        }
    },

    // List upcoming events with custom sorting
    async listUpcomingEvents(req, res, next) {
        try {
            const events = await Event.getUpcomingEvents();

            res.json({
                success: true,
                message: 'Upcoming events retrieved successfully',
                data: {
                    count: events.length,
                    events
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // Get event statistics
    async getEventStats(req, res, next) {
        try {
            const { eventId } = req.params;

            // Check if event exists
            const event = await Event.findById(eventId);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
            }

            const stats = await Event.getEventStats(eventId);

            res.json({
                success: true,
                message: 'Event statistics retrieved successfully',
                data: {
                    eventId: parseInt(eventId),
                    totalRegistrations: parseInt(stats.total_registrations),
                    remainingCapacity: parseInt(stats.remaining_capacity),
                    percentageUsed: parseFloat(stats.percentage_used)
                }
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = eventController;
