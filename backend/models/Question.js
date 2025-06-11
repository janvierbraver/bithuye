// D:\E learning\server\models\Question.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../database/db.js';

const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    examId: { // Foreign key to link to the Exam this question belongs to
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Exams', // This should be the actual table name for the Exam model
            key: 'id',
        },
        onDelete: 'CASCADE', // If an exam is deleted, its questions are deleted
    },
    questionText: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    questionType: {
        type: DataTypes.ENUM('multiple-choice', 'true-false', 'short-answer'), // Define allowed types
        allowNull: false,
        defaultValue: 'multiple-choice',
    },
    options: { // For multiple-choice questions: store as JSON array (e.g., ["Option A", "Option B"])
        type: DataTypes.JSON,
        allowNull: true, // Null for true-false or short-answer
    },
    correctAnswer: { // Stores the correct answer (e.g., "Option A", "true", or a string for short-answer)
        type: DataTypes.STRING, // Can be text for short-answer, or a selected option for MCQs
        allowNull: false,
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1, // Default points for the question
        validate: {
            min: 1,
        }
    },
}, {
    timestamps: true,
});

export { Question };