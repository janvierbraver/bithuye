// D:\E learning\server\models\Exam.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../database/db.js';

const Exam = sequelize.define('Exam', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Exam titles should ideally be unique for an instructor
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    durationMinutes: { // How long the exam can be taken
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 60, // Default to 60 minutes
    },
    passingScore: { // Minimum score to pass (e.g., 70 for 70%)
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 70,
        validate: {
            min: 0,
            max: 100,
        }
    },
    instructorId: { // Foreign key to link to the User (Instructor) who created the exam
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // This should be the actual table name for the User model
            key: 'id',
        },
        onDelete: 'CASCADE', // If an instructor is deleted, their exams are deleted
    },
    courseId: { // <--- NEW: Foreign key to link to the Course this exam belongs to
        type: DataTypes.INTEGER,
        allowNull: true, // Allow exams to exist without being tied to a specific course initially
        references: {
            model: 'Courses', // This should be the actual table name for Course model
            key: 'id',
        },
        onDelete: 'SET NULL', // If a course is deleted, set courseId to NULL for exams
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
});

export { Exam };