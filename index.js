import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB, sequelize } from './database/db.js'; // Ensure correct path to your db connection
import path from 'path';
import { fileURLToPath } from 'url';

// Import the associations definition function
import { defineAssociations } from './models/associations.js';

// Import the role caching utility
import { loadStaticRoles } from './middlewares/roleCache.js';

// Import the seeding script
import seedDatabase from './seed.js';

// Import all necessary routes - ENSURE THESE FILENAMES MATCH YOUR 'routes' DIRECTORY
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/user.js';       // Using user.js as per your provided file
import courseRoutes from './routes/courses.js';   // Using courses.js as per your provided file
import adminRoutes from './routes/admin.js';      // Using admin.js as per your provided file
import examRoutes from './routes/exam.js';        // Using exam.js as per your provided file
import enrollmentRoutes from './routes/enrollmentRoutes.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Derive __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses incoming URL-encoded requests

// Configure CORS middleware with your specified origins
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001', // ADDED: Your frontend's current origin based on the error
        'http://localhost:3002', // Assuming this is another potential frontend dev port
        'http://172.16.7.66:3000' // Your specific IP for local network access
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies to be sent with requests
    optionsSuccessStatus: 204 // For preflight requests
}));

// Serve static files from the 'uploads' directory (e.g., course documents)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Server Startup Sequence ---
const startServer = async () => {
    try {
        // Connect to the database
        await connectDB();
        console.log('Database connection established.');

        // Define Sequelize associations *before* syncing the database
        defineAssociations();
        console.log('Sequelize associations defined.');

        // Synchronize Sequelize models with the database (creates/alters tables)
        await sequelize.sync({ alter: true }); // `alter: true` will update tables without dropping
        console.log('Database synchronized with models.');

        // Seed the database with initial data (e.g., default roles, admin user)
        await seedDatabase();
        console.log('Database seeding process completed.');

        // Load static roles into application cache (e.g., for auth middleware)
        await loadStaticRoles();
        console.log('Static roles loaded into application cache.');

        // --- Mount API Routes ---
        app.use('/api/auth', authRoutes);
        app.use('/api/user', userRoutes);
        app.use('/api/courses', courseRoutes);
        app.use('/api/admin', adminRoutes);
        app.use('/api/exams', examRoutes);
        app.use('/api/enrollments', enrollmentRoutes);

        // Basic root route for API status check
        app.get('/', (req, res) => {
            res.status(200).json({
                status: 'success',
                message: 'E-Learning Platform Backend is running!',
                timestamp: new Date().toISOString()
            });
        });

        // --- Global Error Handling Middleware ---
        // This should be the last middleware mounted
        app.use((err, req, res, next) => {
            console.error('Unhandled Server Error:', err.stack);
            res.status(err.statusCode || 500).json({ // Use custom status code if available, else 500
                status: 'error',
                message: err.message || 'Internal Server Error',
                error: process.env.NODE_ENV === 'development' ? err.stack : undefined // Provide stack in dev env
            });
        });

        // Start the Express server
        app.listen(port, () => {
            console.log(`✅ Server is running at http://localhost:${port}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });

    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1); // Exit process if server fails to start
    }
};

// Initiate server startup
startServer();
