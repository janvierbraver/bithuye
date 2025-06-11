// Importing necessary modules
import express from 'express';
import {
    loginUser,
    register,
    verifyUser,
} from '../controllers/usercontroller.js'; // Ensure this path is correct based on your structure

// Create a router instance
const router = express.Router();

// Define user-related routes
router.post('/register', register);
router.post('/verify', verifyUser);
router.post('/login', loginUser);

// Export the router for use in other modules
export default router;
