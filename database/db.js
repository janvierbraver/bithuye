// database/db.js
import { Sequelize } from 'sequelize';

// Named export of the sequelize instance
export const sequelize = new Sequelize('braverdb', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

// Optional: function to test connection
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to MySQL:', error);
  }
};
