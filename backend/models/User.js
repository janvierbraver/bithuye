// D:\E learning\server\models\User.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../database/db.js'; // Ensure this path is correct for your sequelize instance

const User = sequelize.define('User', { // Sequelize will pluralize this to 'Users' by default for the table name
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensures no two users can have the same email
        validate: {
            isEmail: true, // Basic email format validation
        },
    },
    password: {
        type: DataTypes.STRING, // Store hashed password
        allowNull: false,
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: true, // OTP is optional (null when not active)
    },
    otpExpiry: {
        type: DataTypes.DATE,
        allowNull: true, // OTP expiry is optional (null when not active)
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // New users are unverified by default
        allowNull: false, // This field should always have a boolean value
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // The foreign key constraint is typically defined in associations.js
        // to keep model definitions clean and manage relationships centrally.
        // If you were to define it here, it would look like this:
        // references: {
        //     model: 'Roles', // The actual table name for the Role model (often pluralized 'Roles')
        //     key: 'id',
        // },
        // onDelete: 'RESTRICT', // Prevent deleting a role if users are associated
        // onUpdate: 'CASCADE', // Update roleId if the role's ID changes
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt columns automatically
    // Optionally, you can set the table name explicitly if it differs from the model name
    // tableName: 'Users', // This is the default Sequelize behavior for 'User' model anyway
});

// This is the critical line: Export 'User' as a named export
export { User };