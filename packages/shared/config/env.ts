/**
 * Environment configuration
 * Centralized configuration for all environment-specific settings
 */

export interface EnvironmentConfig {
  apiUrl: string;
  geminiApiKey?: string; // Only used in dev mode for direct API calls
  environment: 'development' | 'staging' | 'production';
  enableAnalytics: boolean;
  enableErrorTracking: boolean;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  // Check Vite environment variables
  const value = (import.meta as any).env?.[key] || (typeof process !== 'undefined' ? process.env?.[key] : undefined);

  if (!value && !defaultValue) {
    console.warn(`Missing environment variable: ${key}`);
    return '';
  }

  return value || defaultValue || '';
};

export const env: EnvironmentConfig = {
  // API URL defaults to localhost in dev, should be set for production
  apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:3001/api'),

  // Gemini API key - only for development/testing
  // In production, all API calls go through backend
  geminiApiKey: getEnvVar('VITE_GEMINI_API_KEY', ''),

  // Environment detection
  environment: (getEnvVar('VITE_ENVIRONMENT', 'development') as EnvironmentConfig['environment']),

  // Analytics enabled in staging and production
  enableAnalytics: getEnvVar('VITE_ENABLE_ANALYTICS', 'false') === 'true',

  // Error tracking enabled in production
  enableErrorTracking: getEnvVar('VITE_ENABLE_ERROR_TRACKING', 'false') === 'true',
};

// Validate required env vars in production
if (env.environment === 'production') {
  if (!env.apiUrl) {
    throw new Error('VITE_API_URL is required in production');
  }
}

export default env;
