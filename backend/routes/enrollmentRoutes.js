// D:\E learning\server\routes\enrollmentRoutes.js
import express from 'express';
import {
    enrollInCourse,
    getMyEnrolledCourses
} from '../controllers/enrollmentController.js';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All enrollment routes should be protected
router.use(authenticateToken);

// Enroll in a course (only learners can enroll)
router.post('/', authorizeRole(['learner']), enrollInCourse);

// Get courses enrolled by the logged-in learner
router.get('/my-courses', authorizeRole(['learner']), getMyEnrolledCourses);

export default router;