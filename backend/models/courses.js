// D:\E learning\server\models\Course.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../database/db.js';

const Course = sequelize.define('courses', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    documentPath: { // New field to store the path to the uploaded document
        type: DataTypes.STRING,
        allowNull: true, // Document is optional
    },
    instructorId: { // Assuming a course belongs to an instructor
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // This should be the actual table name for the User model
            key: 'id',
        },
        onDelete: 'CASCADE', // If an instructor is deleted, their courses are deleted
    }
}, {
    timestamps: true,
});

export { Course };