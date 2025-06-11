// D:\E learning\server\routes\admin.js
import express from 'express';
import {
    getAllUsers, createUser, updateUser, deleteUser,
    getAllCourses, createCourse, updateCourse, deleteCourse
} from '../controllers/adminController.js'; // You'll create these functions
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js'; // Assuming you have these

const router = express.Router();

// All admin routes should be protected and only accessible by 'admin' role
router.use(authenticateToken); // Authenticate user first
router.use(authorizeRole(['admin'])); // Then check if they are an admin

// User Management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Course Management
router.get('/courses', getAllCourses);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

export default router;