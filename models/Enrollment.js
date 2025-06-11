// D:\E learning\server\models\Enrollment.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../database/db.js';

const Enrollment = sequelize.define('Enrollment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    learnerId: { // Foreign key to the User (Learner)
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // This should be the actual table name for User model
            key: 'id',
        },
        onDelete: 'CASCADE', // If a user is deleted, their enrollments are deleted
    },
    courseId: { // Foreign key to the Course
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Courses', // This should be the actual table name for Course model
            key: 'id',
        },
        onDelete: 'CASCADE', // If a course is deleted, its enrollments are deleted
    },
    enrollmentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    // Ensure unique constraint so a learner can't enroll in the same course multiple times
    indexes: [
        {
            unique: true,
            fields: ['learnerId', 'courseId']
        }
    ]
});

export { Enrollment };