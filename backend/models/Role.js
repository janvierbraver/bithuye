// D:\E learning\server\models\Role.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../database/db.js'; // Ensure this path is correct for your sequelize instance

const Role = sequelize.define('Role', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    timestamps: false, // Roles table typically doesn't need timestamps
});

// THIS IS THE CRITICAL LINE: Export 'Role' as a named export
export { Role };