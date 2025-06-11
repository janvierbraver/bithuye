import jwt from 'jsonwebtoken';
import { User } from '../models/User.js'; // Import User model to check user existence/status
import { Role } from '../models/Role.js'; // Import Role model for association

// Middleware to authenticate JWT token
export const authenticateToken = (req, res, next) => {
    // Get token from header (e.g., "Bearer YOUR_TOKEN")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token part

    console.log('AUTH_MIDDLEWARE: Attempting to authenticate token...');
    console.log('AUTH_MIDDLEWARE: Received Authorization Header:', authHeader);
    console.log('AUTH_MIDDLEWARE: Extracted Token:', token ? 'YES (token present)' : 'NO (token missing)');

    if (!token) {
        console.log('AUTH_MIDDLEWARE: No token provided. Sending 401: Authentication token required.');
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            console.error('AUTH_MIDDLEWARE: JWT verification error:', err.message);
            // Distinguish between expired and invalid token if needed
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired. Please log in again.' });
            }
            return res.status(403).json({ message: 'Invalid token.' }); // More generic invalid token
        }

        console.log('AUTH_MIDDLEWARE: JWT decoded successfully. Decoded payload:', decoded);

        try {
            // NOTE: Ensure 'decoded.userId' matches the actual key in your JWT payload.
            // If your JWT stores the user ID as 'id', change 'decoded.userId' to 'decoded.id'.
            const user = await User.findByPk(decoded.userId, {
                include: [{ model: Role, as: 'Role', attributes: ['name'] }] // Ensure alias matches associations.js
            });

            if (!user) {
                console.log('AUTH_MIDDLEWARE: User not found in DB for ID:', decoded.userId, '. Sending 404.');
                return res.status(404).json({ message: 'User not found.' });
            }

            // Optional: Uncomment if you have an 'isVerified' field and require it
            // if (!user.isVerified) {
            //     console.warn(`AUTH_MIDDLEWARE: User ${user.id} is not verified. Denying access.`);
            //     return res.status(401).json({ message: 'Not authorized, account not verified.' });
            // }

            // Attach user object to request for subsequent middleware/routes
            req.user = {
                id: user.id,
                email: user.email,
                role: user.Role ? user.Role.name : null // Attach the user's role name, handle if Role is null
            };
            console.log('AUTH_MIDDLEWARE: User authenticated. req.user set to:', req.user);
            next(); // Proceed to the next middleware/route handler
        } catch (dbError) {
            console.error('AUTH_MIDDLEWARE: Database error during token authentication:', dbError);
            return res.status(500).json({ message: 'Server error during authentication.' });
        }
    });
};

// Middleware to authorize user role
export const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        console.log('AUTHORIZE_ROLE_MIDDLEWARE: Running authorization check.');
        console.log('AUTHORIZE_ROLE_MIDDLEWARE: Allowed roles for this route:', allowedRoles);
        console.log('AUTHORIZE_ROLE_MIDDLEWARE: User (req.user) in this context (from previous middleware):', req.user);


        if (!req.user || !req.user.role) {
            console.log('AUTHORIZE_ROLE_MIDDLEWARE: req.user or req.user.role is missing. Sending 403: User role not identified.');
            return res.status(403).json({ message: 'Access denied. User role not found.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            console.log(`AUTHORIZE_ROLE_MIDDLEWARE: User role '${req.user.role}' not in allowed roles: [${allowedRoles.join(', ')}]. Sending 403.`);
            return res.status(403).json({ message: `Access denied. You do not have the required role (${allowedRoles.join(', ')}).` });
        }

        console.log(`AUTHORIZE_ROLE_MIDDLEWARE: User role '${req.user.role}' is authorized. Proceeding.`);
        next();
    };
};
