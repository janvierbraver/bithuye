// D:\E learning\server\controllers\adminController.js
import { User } from '../models/User.js';
import { Role } from '../models/Role.js'; // To include role name
import { Course } from '../models/courses.js'; // Assuming you have a Course model
import bcrypt from 'bcrypt';
import { cachedRoles } from '../middlewares/roleCache.js'; // For role lookup

// --- User Management ---
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            include: [{ model: Role, as: 'Role', attributes: ['name'] }], // Ensure alias matches associations.js
            attributes: { exclude: ['password', 'otp', 'otpExpiry'] } // Exclude sensitive info
        });
        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error('Error getting all users:', error);
        res.status(500).json({ message: 'Failed to retrieve users.' });
    }
};

export const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }
        const foundRole = cachedRoles[role.toLowerCase()];
        if (!foundRole) return res.status(400).json({ message: 'Invalid role.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name, email, password: hashedPassword, roleId: foundRole.id, isVerified: true // Admin-created users might be auto-verified
        });
        res.status(201).json({ success: true, message: 'User created successfully.', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Failed to create user.' });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    try {
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser && existingUser.id !== user.id) {
                return res.status(409).json({ message: 'Email already in use by another user.' });
            }
        }

        const updates = { name, email };
        if (password) updates.password = await bcrypt.hash(password, 10);
        if (role) {
            const foundRole = cachedRoles[role.toLowerCase()];
            if (!foundRole) return res.status(400).json({ message: 'Invalid role.' });
            updates.roleId = foundRole.id;
        }

        await user.update(updates);
        res.status(200).json({ success: true, message: 'User updated successfully.', user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user.' });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        await user.destroy();
        res.status(200).json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user.' });
    }
};

// --- Course Management ---
// You'll need to define your Course model (e.g., D:\E learning\server\models\Course.js)
// and import it: import { Course } from '../models/Course.js';

export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.findAll();
        res.status(200).json({ success: true, courses });
    } catch (error) {
        console.error('Error getting all courses:', error);
        res.status(500).json({ message: 'Failed to retrieve courses.' });
    }
};

export const createCourse = async (req, res) => {
    const { title, description, price, instructorId } = req.body; // You might need instructorId
    try {
        const newCourse = await Course.create({ title, description, price, instructorId });
        res.status(201).json({ success: true, message: 'Course created successfully.', course: newCourse });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ message: 'Failed to create course.' });
    }
};

export const updateCourse = async (req, res) => {
    const { id } = req.params;
    const { title, description, price } = req.body;
    try {
        const course = await Course.findByPk(id);
        if (!course) return res.status(404).json({ message: 'Course not found.' });
        await course.update({ title, description, price });
        res.status(200).json({ success: true, message: 'Course updated successfully.', course });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Failed to update course.' });
    }
};

export const deleteCourse = async (req, res) => {
    const { id } = req.params;
    try {
        const course = await Course.findByPk(id);
        if (!course) return res.status(404).json({ message: 'Course not found.' });
        await course.destroy();
        res.status(200).json({ success: true, message: 'Course deleted successfully.' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Failed to delete course.' });
    }
};