// D:\E learning\server\controllers\coursesController.js
import { Course } from '../models/courses.js'; // <--- CORRECTED: Changed to singular, capitalized 'Course.js'
import { User } from '../models/User.js'; // To associate courses with instructors
import path from 'path'; // Import the path module
import fs from 'fs'; // Ensure fs is imported for file operations (e.g., deleting old files)

// Helper to get base URL for file paths (adjust if needed)
const getBaseUrl = (req) => {
    return `${req.protocol}://${req.get('host')}`;
};

// GET /api/courses/my-courses (Get courses created by the logged-in instructor)
export const getInstructorCourses = async (req, res) => {
    try {
        const instructorId = req.user.id;
        const courses = await Course.findAll({
            where: { instructorId: instructorId },
            // You might want to include other associations here if needed
        });

        // Add full URL for document paths if they are stored as relative paths
        const coursesWithFullPaths = courses.map(course => ({
            ...course.toJSON(),
            // Ensure documentPath is correctly formed for frontend display
            documentPath: course.documentPath ? `uploads/${path.basename(course.documentPath)}` : null
        }));

        res.status(200).json({ success: true, courses: coursesWithFullPaths });
    } catch (error) {
        console.error('Error getting instructor courses:', error);
        res.status(500).json({ message: 'Failed to retrieve instructor courses.' });
    }
};

// POST /api/courses (Create a new course)
export const createCourse = async (req, res) => {
    const { title, description, price } = req.body;
    const instructorId = req.user.id; // Get instructor ID from authenticated user

    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Course document/file is required.' });
        }

        const newCourse = await Course.create({
            title,
            description,
            price: parseFloat(price),
            instructorId,
            documentPath: req.file.path // Store the full path where Multer saved the file
        });

        res.status(201).json({
            success: true,
            message: 'Course created successfully!',
            course: {
                ...newCourse.toJSON(),
                documentPath: `uploads/${path.basename(newCourse.documentPath)}` // Return relative path for frontend
            }
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ message: 'Failed to create course.' });
    }
};

// PUT /api/courses/:id (Update an existing course)
export const updateCourse = async (req, res) => {
    const { id } = req.params;
    const { title, description, price } = req.body;
    const instructorId = req.user.id; // Get instructor ID from authenticated user

    try {
        const course = await Course.findOne({ where: { id: parseInt(id, 10), instructorId } }); // <--- Parse ID
        if (!course) {
            return res.status(404).json({ message: 'Course not found or you do not have permission to update it.' });
        }

        const updates = { title, description, price: parseFloat(price) };

        // Handle file update
        if (req.file) {
            // Optional: Delete old file if it exists
            if (course.documentPath && fs.existsSync(course.documentPath)) {
                fs.unlinkSync(course.documentPath);
            }
            updates.documentPath = req.file.path;
        }

        await course.update(updates);

        res.status(200).json({
            success: true,
            message: 'Course updated successfully!',
            course: {
                ...course.toJSON(),
                documentPath: course.documentPath ? `uploads/${path.basename(course.documentPath)}` : null
            }
        });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Failed to update course.' });
    }
};

// DELETE /api/courses/:id (Delete a course)
export const deleteCourse = async (req, res) => {
    const { id } = req.params;
    const instructorId = req.user.id; // Get instructor ID from authenticated user

    try {
        const course = await Course.findOne({ where: { id: parseInt(id, 10), instructorId } }); // <--- Parse ID
        if (!course) {
            return res.status(404).json({ message: 'Course not found or you do not have permission to delete it.' });
        }

        // Optional: Delete the associated file from disk
        if (course.documentPath && fs.existsSync(course.documentPath)) {
            fs.unlinkSync(course.documentPath);
        }

        await course.destroy();
        res.status(200).json({ success: true, message: 'Course deleted successfully.' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Failed to delete course.' });
    }
};

// GET /api/courses (Get all courses - public or for any authenticated user)
export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.findAll({
            include: [{ model: User, as: 'Instructor', attributes: ['name'] }] // Include instructor name
        });
        // Add full URL for document paths if they are stored as relative paths
        const coursesWithFullPaths = courses.map(course => ({
            ...course.toJSON(),
            documentPath: course.documentPath ? `uploads/${path.basename(course.documentPath)}` : null
        }));
        res.status(200).json({ success: true, courses: coursesWithFullPaths });
    } catch (error) {
        console.error('Error getting all courses:', error);
        res.status(500).json({ message: 'Failed to retrieve courses.' });
    }
};

// GET /api/courses/:id (Get a single course by ID)
// This function is needed for LearnerCourseDetail to fetch specific course info.
export const getCourseById = async (req, res) => {
    const { id } = req.params;
    // --- DEBUGGING LOGS: START ---
    console.log(`coursesController: getCourseById received ID (string): ${id}`);
    const parsedId = parseInt(id, 10); // Parse to integer
    console.log(`coursesController: getCourseById parsed ID (integer): ${parsedId}`);
    // --- DEBUGGING LOGS: END ---

    // Validate if the ID is a valid number after parsing
    if (isNaN(parsedId)) {
        return res.status(400).json({ message: 'Invalid Course ID format.' });
    }

    try {
        const course = await Course.findByPk(parsedId, { // <--- Use the parsed integer ID
            include: [{ model: User, as: 'Instructor', attributes: ['name', 'email'] }] // Include instructor details
        });
        if (!course) {
            console.log(`coursesController: Course with ID ${parsedId} not found in database.`);
            return res.status(404).json({ message: 'Course not found.' });
        }
        // Normalize documentPath for frontend display if needed
        const courseWithFullPath = {
            ...course.toJSON(),
            documentPath: course.documentPath ? `uploads/${path.basename(course.documentPath)}` : null
        };
        res.status(200).json({ success: true, course: courseWithFullPath });
    } catch (error) {
        console.error('Error getting course by ID:', error);
        res.status(500).json({ message: 'Failed to retrieve course.' });
    }
};