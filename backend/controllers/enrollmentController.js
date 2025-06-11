// D:\E learning\server\controllers\enrollmentController.js
import { Enrollment } from '../models/Enrollment.js';
import { Course } from '../models/courses.js'; // To include course details
import { User } from '../models/User.js';   // To include instructor details for enrolled courses
import path from 'path'; // Needed for path.basename for documentPath normalization

// POST /api/enrollments
// Allows a learner to enroll in a course.
export const enrollInCourse = async (req, res) => {
    const { courseId } = req.body;
    const learnerId = req.user.id; // Get learner ID from authenticated user

    try {
        // Check if the course exists
        const course = await Course.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        // Check if the learner is already enrolled
        const existingEnrollment = await Enrollment.findOne({
            where: { learnerId, courseId }
        });
        if (existingEnrollment) {
            return res.status(409).json({ message: 'You are already enrolled in this course.' });
        }

        // Create the enrollment
        const newEnrollment = await Enrollment.create({
            learnerId,
            courseId,
            enrollmentDate: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Successfully enrolled in the course!',
            enrollment: newEnrollment
        });

    } catch (error) {
        console.error('Error enrolling in course:', error);
        // Handle unique constraint error if it somehow bypasses the check above
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'You are already enrolled in this course.' });
        }
        res.status(500).json({ message: 'Failed to enroll in course.' });
    }
};

// GET /api/enrollments/my-courses
// Retrieves all courses a specific learner is enrolled in.
export const getMyEnrolledCourses = async (req, res) => {
    const learnerId = req.user.id; // Get learner ID from authenticated user

    try {
        const enrolledCourses = await Enrollment.findAll({
            where: { learnerId },
            include: [
                {
                    model: Course,
                    as: 'Course', // Use the alias defined in associations.js
                    attributes: ['id', 'title', 'description', 'price', 'documentPath'],
                    include: [{ model: User, as: 'Instructor', attributes: ['name'] }] // Include instructor name
                }
            ],
            order: [['enrollmentDate', 'DESC']]
        });

        // Normalize documentPath for frontend display if needed
        const normalizedEnrolledCourses = enrolledCourses.map(enrollment => ({
            ...enrollment.toJSON(),
            Course: {
                ...enrollment.Course.toJSON(),
                documentPath: enrollment.Course.documentPath ? `uploads/${path.basename(enrollment.Course.documentPath)}` : null
            }
        }));


        res.status(200).json({ success: true, enrolledCourses: normalizedEnrolledCourses });
    } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        res.status(500).json({ message: 'Failed to retrieve enrolled courses.' });
    }
};