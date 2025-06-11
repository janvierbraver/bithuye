// server/routes/courseRoutes.js
import express from 'express';
import {
    createCourse,
    getInstructorCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    getAllCourses
} from '../controllers/courseController.js';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(process.cwd(), 'uploads', 'courses');
        // Ensure the directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Create a unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
    fileFilter: (req, file, cb) => {
        // Allowed file types (e.g., PDF, common image types, text)
        const allowedTypes = /pdf|doc|docx|txt|jpg|jpeg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, GIF files are allowed!'));
        }
    }
});


// --- General Authenticated Routes (Accessible by any authenticated user) ---
// These routes only require a valid token, not a specific role.

// GET /api/courses - Get all courses (for general browsing by any authenticated user, including learners)
router.route('/').get(authenticateToken, getAllCourses);

// GET /api/courses/my-courses - Instructor-specific route to get *their* courses.
// IMPORTANT: This specific route MUST be defined *before* the general /:id route below.
router.route('/my-courses').get(authenticateToken, authorizeRole(['instructor']), getInstructorCourses);

// GET /api/courses/:id - Get a single course by ID (accessible by any authenticated user, including learners)
// This MUST come AFTER /my-courses to avoid "my-courses" being treated as an ID.
router.route('/:id').get(authenticateToken, getCourseById);


// --- Instructor-Specific Actions (Require instructor role AND authentication) ---
// These routes explicitly include `authorizeRole(['instructor'])` middleware.

// POST /api/courses - Instructor can create a new course with file upload
router.route('/').post(authenticateToken, authorizeRole(['instructor']), upload.single('courseFile'), createCourse);

// PUT /api/courses/:id - Instructor can update their own course with optional file upload
router.route('/:id').put(authenticateToken, authorizeRole(['instructor']), upload.single('courseFile'), updateCourse);

// DELETE /api/courses/:id - Instructor can delete their own course
router.route('/:id').delete(authenticateToken, authorizeRole(['instructor']), deleteCourse);


export default router;
