// D:\E learning\server\utils\roleCache.js
import { Role } from '../models/Role.js'; // Corrected import path for Role model

export const cachedRoles = {}; // This object will store your cached role data

/**
 * Loads all static roles from the database into an in-memory cache.
 * This function should be called once at application startup.
 */
export const loadStaticRoles = async () => {
    try {
        console.log('Attempting to load static roles into cache...');
        const roles = await Role.findAll(); // Fetch all roles from the database
        roles.forEach(role => {
            // Store each role in the cache using its lowercase name as the key
            // This allows for easy and consistent lookup later (e.g., cachedRoles.learner)
            cachedRoles[role.name.toLowerCase()] = role.toJSON();
        });
        console.log('Static roles loaded successfully:', Object.keys(cachedRoles));
    } catch (error) {
        console.error('❌ Error loading static roles into cache:', error);
        // It's critical to handle this error, as role information is vital for the application.
        // You might consider stopping the application or logging a more severe error.
        throw new Error('Failed to load static roles, application cannot proceed.');
    }
};