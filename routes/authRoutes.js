// D:\E learning\server\routes\authRoutes.js
import express from 'express';
// Ensure these paths are correct relative to authRoutes.js
import {
    register,
    loginUser,     // <--- CORRECTED: Changed 'login' to 'loginUser'
    verifyUser,    // This was 'verifyEmail' in authController, but keeping 'verifyUser' as per your usercontroller
    resendOtp,
    forgotPassword,
    resetPassword
} from '../controllers/usercontroller.js'; // Importing from usercontroller.js as per your setup

const router = express.Router();

// User Registration Route
router.post('/register', register);

// User Login Route
router.post('/login', loginUser); // <--- CORRECTED: Using loginUser here

// User Email Verification Route (after OTP)
router.post('/verify-email', verifyUser); // Keeping 'verify-email' route path for clarity

// Resend OTP Route
router.post('/resend-otp', resendOtp);

// Forgot Password (Initiate OTP send) Route
router.post('/forgot-password', forgotPassword);

// Reset Password (Verify OTP and set new password) Route
router.post('/reset-password', resetPassword);

export default router;