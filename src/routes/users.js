const express = require('express');
const userController = require('../controllers/userController');
const {
    validateCreateUser,
    validateUserId
} = require('../middleware/validation');
const { createLimiter } = require('../middleware/security');

const router = express.Router();

// Create a new user
router.post('/', createLimiter, validateCreateUser, userController.createUser);

// Get user by ID
router.get('/:userId', validateUserId, userController.getUserById);

// Get all users
router.get('/', userController.getAllUsers);

module.exports = router;
