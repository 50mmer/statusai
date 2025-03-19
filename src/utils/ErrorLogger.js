// src/utils/ErrorLogger.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Simple error logging utility
 * In a production app, you would typically:
 * 1. Send errors to a monitoring service like Sentry, Bugsnag, etc.
 * 2. Include user context, device information, and app version
 * 3. Implement proper batching and retry mechanisms
 * 
 * This implementation provides a simple local storage-based logging system
 * that could be extended to send logs to a backend service.
 */

// Maximum number of logs to keep in storage
const MAX_LOGS = 100;

// Storage key for error logs
const ERROR_LOGS_KEY = '@error_logs';

/**
 * Log an error with context information
 * @param {Error|string} error - The error object or message
 * @param {string} source - Where the error occurred (e.g., "LoginScreen", "API", etc.)
 * @param {Object} context - Any additional context information
 * @returns {Promise<void>}
 */
export const logError = async (error, source, context = {}) => {
  try {
    const errorLog = {
      timestamp: new Date().toISOString(),
      source,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
    };

    // In development, console log the error for debugging
    if (__DEV__) {
      console.error('[ERROR]', errorLog);
    }

    // Get existing logs
    const existingLogsJson = await AsyncStorage.getItem(ERROR_LOGS_KEY);
    const existingLogs = existingLogsJson ? JSON.parse(existingLogsJson) : [];
    
    // Add new log to the beginning of the array
    const updatedLogs = [errorLog, ...existingLogs];
    
    // Limit the number of logs stored
    const trimmedLogs = updatedLogs.slice(0, MAX_LOGS);
    
    // Save updated logs
    await AsyncStorage.setItem(ERROR_LOGS_KEY, JSON.stringify(trimmedLogs));
    
    // In a real app, you would call your error reporting service here
    // Example: sendToErrorReportingService(errorLog);
  } catch (loggingError) {
    // Fall back to console error if AsyncStorage fails
    console.error('Failed to log error:', loggingError);
    console.error('Original error:', error);
  }
};

/**
 * Get all stored error logs
 * @returns {Promise<Array>} Array of error logs
 */
export const getErrorLogs = async () => {
  try {
    const logsJson = await AsyncStorage.getItem(ERROR_LOGS_KEY);
    return logsJson ? JSON.parse(logsJson) : [];
  } catch (error) {
    console.error('Failed to retrieve error logs:', error);
    return [];
  }
};

/**
 * Clear all stored error logs
 * @returns {Promise<void>}
 */
export const clearErrorLogs = async () => {
  try {
    await AsyncStorage.removeItem(ERROR_LOGS_KEY);
  } catch (error) {
    console.error('Failed to clear error logs:', error);
  }
};

// Example function to send logs to a backend service
// In a real app, you would implement this with proper retry logic
const sendToErrorReportingService = (errorLog) => {
  // This would be an API call to your backend
  // fetch('https://your-api.com/log-error', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(errorLog),
  // });
};

export default {
  logError,
  getErrorLogs,
  clearErrorLogs,
};