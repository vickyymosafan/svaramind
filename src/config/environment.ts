/**
 * Environment Configuration and Validation
 * 
 * This module handles environment variable validation with fallback mechanisms
 * and provides clear error messages for missing configuration.
 */

export interface EnvironmentConfig {
  youtubeApiKey: string;
  appUrl: string;
  nodeEnv: string;
  isProduction: boolean;
  isDevelopment: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: EnvironmentConfig;
}

// Hardcoded fallback API key as specified in requirements
const FALLBACK_YOUTUBE_API_KEY = 'AIzaSyB-6C-9pKRZja0W4wZhRInwtEZ71sLIQSw';

/**
 * Validates and returns environment configuration with fallbacks
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate YouTube API Key
  const youtubeApiKey = process.env.YOUTUBE_API_KEY;
  let finalYoutubeApiKey: string;
  
  if (!youtubeApiKey) {
    warnings.push('YOUTUBE_API_KEY not found in environment variables, using fallback key');
    finalYoutubeApiKey = FALLBACK_YOUTUBE_API_KEY;
  } else if (youtubeApiKey.length < 30) {
    warnings.push('YOUTUBE_API_KEY appears to be invalid (too short), using fallback key');
    finalYoutubeApiKey = FALLBACK_YOUTUBE_API_KEY;
  } else {
    finalYoutubeApiKey = youtubeApiKey;
  }
  
  // Validate App URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    warnings.push('NEXT_PUBLIC_APP_URL not set, using default: http://localhost:3000');
  }
  
  // Environment detection
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  const isDevelopment = nodeEnv === 'development';
  
  // Production-specific validations
  if (isProduction) {
    if (!youtubeApiKey) {
      warnings.push('Production deployment detected but YOUTUBE_API_KEY not set in environment. Using fallback key.');
    }
    
    if (appUrl === 'http://localhost:3000') {
      warnings.push('Production deployment detected but NEXT_PUBLIC_APP_URL still set to localhost');
    }
  }
  
  const config: EnvironmentConfig = {
    youtubeApiKey: finalYoutubeApiKey,
    appUrl,
    nodeEnv,
    isProduction,
    isDevelopment
  };
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config
  };
}

/**
 * Gets validated environment configuration
 * Throws error if critical validation fails
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const validation = validateEnvironment();
  
  // Log warnings to console
  if (validation.warnings.length > 0) {
    console.warn('Environment Configuration Warnings:');
    validation.warnings.forEach(warning => {
      console.warn(`  ⚠️  ${warning}`);
    });
  }
  
  // Throw error if validation fails
  if (!validation.isValid) {
    console.error('Environment Configuration Errors:');
    validation.errors.forEach(error => {
      console.error(`  ❌ ${error}`);
    });
    throw new Error('Environment validation failed. Please check your configuration.');
  }
  
  // Log successful validation in development
  if (validation.config.isDevelopment) {
    console.log('✅ Environment configuration validated successfully');
    if (validation.config.youtubeApiKey === FALLBACK_YOUTUBE_API_KEY) {
      console.log('🔑 Using fallback YouTube API key');
    }
  }
  
  return validation.config;
}

/**
 * Validates environment on startup
 * Should be called during application initialization
 */
export function validateEnvironmentOnStartup(): void {
  try {
    const config = getEnvironmentConfig();
    
    // Additional startup validations
    if (config.isProduction && config.youtubeApiKey === FALLBACK_YOUTUBE_API_KEY) {
      console.warn('🚨 Production Warning: Using fallback YouTube API key. Consider setting YOUTUBE_API_KEY environment variable.');
    }
    
    console.log(`🚀 Application starting in ${config.nodeEnv} mode`);
    console.log(`🌐 App URL: ${config.appUrl}`);
    
  } catch (error) {
    console.error('❌ Environment validation failed during startup:', error);
    
    // In production, we still want to start with fallback values
    if (process.env.NODE_ENV === 'production') {
      console.warn('🔄 Continuing with fallback configuration in production mode');
      return;
    }
    
    // In development, we can be more strict
    throw error;
  }
}

/**
 * Runtime environment check for API routes
 * Returns configuration or throws descriptive error
 */
export function getAPIEnvironmentConfig(): EnvironmentConfig {
  try {
    return getEnvironmentConfig();
  } catch (error) {
    // Provide more specific error for API routes
    throw new Error(
      'API configuration error: Unable to validate environment variables. ' +
      'Please ensure YOUTUBE_API_KEY is properly configured or check server logs for details.'
    );
  }
}

// Export the fallback key for reference (but don't use directly)
export { FALLBACK_YOUTUBE_API_KEY };