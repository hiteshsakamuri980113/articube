/**
 * Application configuration from environment variables
 * This centralizes all environment variable access
 */

/**
 * Base API URL for backend services
 */
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Application name
 */
export const APP_NAME = import.meta.env.VITE_APP_NAME || "ArtiCube";

/**
 * Development mode flag
 */
export const DEV_MODE = import.meta.env.VITE_DEV_MODE === "true";

/**
 * Config object with all environment variables
 */
export const config = {
  API_URL,
  APP_NAME,
  DEV_MODE,
};

export default config;
