const User = require('../models/User');

const userController = {
    // Create a new user
    async createUser(req, res, next) {
        try {
            const { name, email } = req.body;

            const user = await User.create(name, email);

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: user
            });
        } catch (error) {
            next(error);
        }
    },

    // Get user by ID
    async getUserById(req, res, next) {
        try {
            const { userId } = req.params;

            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                message: 'User retrieved successfully',
                data: user
            });
        } catch (error) {
            next(error);
        }
    },

    // Get all users
    async getAllUsers(req, res, next) {
        try {
            const users = await User.findAll();

            res.json({
                success: true,
                message: 'Users retrieved successfully',
                data: {
                    count: users.length,
                    users
                }
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = userController;
