// D:\E learning\server\seed.js

// Adjust paths based on the actual location of seed.js:
// Assuming seed.js is now in the 'server' directory (D:\E learning\server\seed.js)
import { sequelize } from './database/db.js';
import { Role } from './models/Role.js';
import { User } from './models/User.js';
import bcrypt from 'bcrypt';

const seedDatabase = async () => {
    try {
        console.log('Starting database seeding process...');
        await sequelize.sync({ alter: true }); // Or { force: true } if you are still wiping for tests
        console.log('Database synchronized for seeding. Attempting to seed roles...');

        const [learnerRole] = await Role.findOrCreate({
            where: { name: 'learner' },
            defaults: { name: 'learner' }
        });
        const [instructorRole] = await Role.findOrCreate({
            where: { name: 'instructor' },
            defaults: { name: 'instructor' }
        });
        const [adminRole] = await Role.findOrCreate({
            where: { name: 'admin' },
            defaults: { name: 'admin' }
        });

        console.log('Roles seeded successfully!');
        console.log('Learner Role ID:', learnerRole.id);
        console.log('Instructor Role ID:', instructorRole.id);
        console.log('Admin Role ID:', adminRole.id);

        const adminEmail = 'admin@example.com';
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('adminpassword', 10);
            await User.create({
                name: 'Admin User',
                email: adminEmail,
                password: hashedPassword,
                roleId: adminRole.id,
                isVerified: true
            });
            console.log(`Initial admin user created: ${adminEmail}`);
        } else {
            console.log(`Admin user ${adminEmail} already exists.`);
        }

        console.log('Seeding process finished successfully.');
    } catch (error) {
        console.error('❌ Critical Error during seeding:', error);
        // Re-throw the error so index.js can catch it and prevent server start if seeding fails
        throw error;
    }
    // No finally block with sequelize.close() here if imported into index.js
};

// Export the function as the default export
export default seedDatabase; // <--- NEW: Export as default

// Remove the direct call here: seedDatabase();
// It will now be called explicitly from index.js