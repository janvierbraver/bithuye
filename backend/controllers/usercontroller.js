import { User } from '../models/User.js'; // Use named import
import { Role } from '../models/Role.js'; // Keep for association, needed for 'include'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import sendMail from '../middlewares/sendMail.js'; // Import your centralized sendMail function
import { cachedRoles } from '../middlewares/roleCache.js'; // Import cachedRoles
import { Op } from 'sequelize'; // <--- NEW: Import Op for Sequelize operators (e.g., Op.gt)
import nodemailer from 'nodemailer'; // <--- NEW: Import nodemailer for email sending (if sendMail isn't using it internally)

// Environment variables for JWT secret and email setup
// Assuming these are already in your .env file
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Used for JWT token signing
const activationSecret = process.env.ACTIVATION_SECRET || 'your_activation_secret_key'; // Used for activation token
const emailUser = process.env.EMAIL_USER; // Your email address (e.g., your_email@gmail.com)
const emailPass = process.env.EMAIL_PASS; // Your email password or app-specific password

// --- Nodemailer Transporter Setup (if sendMail doesn't handle this) ---
// If your `sendMail` function already sets up and uses a transporter, you might not need this here.
// However, if `sendMail` expects a configured transporter or if you want to ensure it's available,
// it's good to have it defined or ensure `sendMail` handles it.
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or your email service (e.g., 'outlook', 'sendgrid')
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});

// Helper function to send OTP email (if sendMail doesn't do this with a generic template)
// This is a fallback/direct send if sendMail is more for templated emails.
const sendOtpEmail = async (email, otp, subject, messageBody) => {
    const mailOptions = {
        from: emailUser,
        to: email,
        subject: subject,
        html: messageBody,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email} for subject: ${subject}`);
    } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
        throw new Error('Failed to send email. Please check server logs and email configuration.');
    }
};


// User Registration Function
export const register = async (req, res) => {
    const { name, email, password, role } = req.body; // Destructure 'role'

    try {
        // 1. Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        // 2. Find the Role ID based on the provided role name using the CACHE
        const requestedRole = role ? role.toLowerCase() : 'learner'; // Default to 'learner' if no role provided
        const foundRole = cachedRoles[requestedRole]; // Get from cache

        if (!foundRole) {
            console.error(`Attempted to register with role '${requestedRole}' which was not found in cache.`);
            return res.status(400).json({ message: `Invalid or unconfigured role: '${role}'.` });
        }
        const roleId = foundRole.id; // Get the ID from the cached role

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Generate OTP
        const otp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

        // 5. Create user in database (initially unverified)
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            roleId: roleId, // Assign the found roleId
            otp,
            otpExpiry,
            isVerified: false // User is not verified until OTP is confirmed
        });

        // 6. Generate activation token (for email verification link if needed)
        const activationToken = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            activationSecret, // Use activationSecret for this token
            { expiresIn: '10m' } // Token expires in 10 minutes
        );

        // 7. Send OTP via email using the centralized sendMail utility
        const mailData = {
            name: newUser.name,
            otp: otp,
            expiryMinutes: 10,
            // If you want a direct verification link, uncomment and adjust:
            // verificationUrl: `${process.env.FRONTEND_URL}/verify?token=${activationToken}`
        };
        // Assuming sendMail can handle generic OTP emails or has a template for it
        await sendMail(email, 'E-Learning Platform - Account Verification OTP', mailData);

        res.status(201).json({
            message: 'Registration successful! OTP sent to your email for verification.',
            activationToken: activationToken, // Send activation token to frontend for verification step
            userId: newUser.id, // Optionally send user ID
            role: foundRole.name // Confirm the assigned role back to the frontend
        });

    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// User Verification Function
export const verifyUser = async (req, res) => {
    const { otp, activationToken } = req.body;

    try {
        // Verify activation token to get user ID
        const decoded = jwt.verify(activationToken, activationSecret); // Use activationSecret
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Account already verified.' });
        }

        // Check OTP and expiry
        if (user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        // Mark user as verified
        user.isVerified = true;
        user.otp = null; // Clear OTP
        user.otpExpiry = null; // Clear OTP expiry
        await user.save();

        res.status(201).json({ message: 'Account verified successfully!' });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Invalid or expired activation token.' });
        }
        console.error('Error during verification:', error);
        res.status(500).json({ message: 'Server error during verification.' });
    }
};


// User Login Function
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Find user by email, including their associated Role using the 'as' alias
        const user = await User.findOne({
            where: { email },
            include: [{ model: Role, as: 'Role', attributes: ['name'] }]
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials. User not found.' });
        }

        // 2. Check if the user's email is verified (if you want this check)
        // if (!user.isVerified) {
        //     return res.status(403).json({ message: 'Email not verified. Please verify your email using the OTP.' });
        // }

        // 3. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials. Wrong password.' });
        }

        // 4. Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.Role.name }, // Access the role name via the alias: user.Role.name
            jwtSecret, // Use jwtSecret for the main authentication token
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.Role.name
            }
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

// New function to resend OTP
export const resendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the user is already verified
        if (user.isVerified) {
            return res.status(400).json({ message: 'Account already verified. Please log in.' });
        }

        // Generate a new OTP
        const newOtp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        const newOtpExpiry = Date.now() + 10 * 60 * 1000; // New OTP valid for 10 minutes

        // Update user's OTP and expiry in the database
        user.otp = newOtp;
        user.otpExpiry = newOtpExpiry;
        await user.save();

        // Send the new OTP via email using the centralized sendMail utility
        const mailData = {
            name: user.name, // Pass user's name to the email template
            otp: newOtp,
            expiryMinutes: 10
        };
        await sendMail(email, 'E-Learning Platform - Resend Account Verification OTP', mailData);

        res.status(200).json({ message: 'New OTP sent to your email.' });

    } catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).json({ message: 'Server error during OTP resend.' });
    }
};


// --- NEW: Forgot Password and Reset Password Functions ---

// POST /api/auth/forgot-password
// Initiates the password reset process by sending an OTP to the user's email.
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            // For security, always return a generic success message
            // to avoid revealing if an email exists in the database.
            return res.status(200).json({ message: 'If an account with that email exists, a password reset OTP has been sent.' });
        }

        // Generate OTP for password reset and set its expiry (15 minutes)
        const otp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send the OTP email using the direct sendOtpEmail helper
        // or integrate with your `sendMail` if it supports a generic OTP template
        await sendOtpEmail(
            email,
            otp,
            'E-Learning Platform - Password Reset OTP',
            `<p>Your One-Time Password (OTP) for password reset is: <strong>${otp}</strong></p>
             <p>This OTP is valid for 15 minutes.</p>
             <p>If you did not request a password reset, please ignore this email.</p>`
        );

        res.status(200).json({ success: true, message: 'If an account with that email exists, a password reset OTP has been sent.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error during forgot password request.' });
    }
};

// POST /api/auth/reset-password
// Resets the user's password after verifying the OTP.
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        // Find user where email and OTP match, and OTP is not expired
        const user = await User.findOne({
            where: {
                email,
                otp,
                otpExpiry: { [Op.gt]: new Date() } // Op.gt means "greater than" (i.e., not expired)
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10); // Use 10 rounds for salt
        user.password = await bcrypt.hash(newPassword, salt);
        user.otp = null; // Clear OTP after successful reset
        user.otpExpiry = null; // Clear OTP expiry
        await user.save();

        res.status(200).json({ success: true, message: 'Password has been reset successfully!' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error during password reset.' });
    }
};