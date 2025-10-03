/**
 * Server startup validation and initialization
 * This module runs environment validation when the server starts
 */

import { validateEnvironmentOnStartup } from '@/config/environment';

/**
 * Initialize application with environment validation
 * This should be called during server startup
 */
export function initializeApplication(): void {
    console.log('🚀 Initializing Mood-Based Music Discovery Application...');

    try {
        // Validate environment configuration
        validateEnvironmentOnStartup();

        console.log('✅ Application initialization completed successfully');
    } catch (error) {
        console.error('❌ Application initialization failed:', error);

        // In production, log the error but don't crash the server
        if (process.env.NODE_ENV === 'production') {
            console.warn('⚠️  Continuing with fallback configuration in production mode');
            return;
        }

        // In development, we can be more strict
        throw error;
    }
}

// Auto-initialize when this module is imported (server-side only)
if (typeof window === 'undefined') {
    initializeApplication();
}