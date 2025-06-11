// D:\E learning\server\models\ExamAttempt.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../database/db.js';

const ExamAttempt = sequelize.define('ExamAttempt', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    learnerId: { // Foreign key to the User (Learner) who took the exam
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Actual table name for User model
            key: 'id',
        },
        onDelete: 'CASCADE', // If learner is deleted, their attempts are deleted
    },
    examId: { // Foreign key to the Exam that was attempted
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Exams', // Actual table name for Exam model
            key: 'id',
        },
        onDelete: 'CASCADE', // If exam is deleted, its attempts are deleted
    },
    score: { // The score the learner achieved on the exam (e.g., 85)
        type: DataTypes.INTEGER,
        allowNull: true, // Can be null if not yet marked (though we'll mark immediately)
    },
    totalPoints: { // Total possible points for the exam
        type: DataTypes.INTEGER,
        allowNull: true, // Can be null if not yet marked
    },
    passed: { // Boolean indicating if the learner passed the exam
        type: DataTypes.BOOLEAN,
        allowNull: true, // Can be null if not yet marked
    },
    submittedAnswers: { // Store the learner's answers as JSON (e.g., { questionId: "answer", ... })
        type: DataTypes.JSON,
        allowNull: false,
    },
    attemptDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    // You might add a field for 'status' (e.g., 'pending', 'completed', 'graded')
    // or 'certificatePath' later
}, {
    timestamps: true,
    // Optional: Prevent multiple attempts for the same exam by the same learner
    // If you want to allow multiple attempts, remove this `indexes` block.
    // For now, I'll keep it commented out to allow multiple attempts for testing.
    // indexes: [
    //     {
    //         unique: true,
    //         fields: ['learnerId', 'examId']
    //     }
    // ]
});

export { ExamAttempt };