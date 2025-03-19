// src/utils/Analytics.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Simple analytics tracking utility
 * In a production app, you would typically:
 * 1. Use a service like Google Analytics, Mixpanel, Amplitude, etc.
 * 2. Include proper user and session tracking
 * 3. Implement event batching and background sending
 * 
 * This implementation provides a simple storage-based system
 * that could be extended to send analytics to a backend service.
 */

// Storage keys
const EVENTS_KEY = '@analytics_events';
const SESSION_KEY = '@analytics_session';
const USER_PROPERTIES_KEY = '@analytics_user_properties';

// Event types
export const EVENTS = {
  APP_OPEN: 'app_open',
  APP_CLOSE: 'app_close',
  SCREEN_VIEW: 'screen_view',
  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  SUBSCRIPTION_VIEW: 'subscription_view',
  SUBSCRIPTION_PURCHASE: 'subscription_purchase',
  ASSESSMENT_START: 'assessment_start',
  ASSESSMENT_COMPLETE: 'assessment_complete',
  ASSESSMENT_ABANDON: 'assessment_abandon',
  RESULTS_VIEW: 'results_view',
  RESULTS_SHARE: 'results_share',
  ERROR: 'error',
};

/**
 * Track an event
 * @param {string} eventName - Name of the event (use EVENTS constant)
 * @param {Object} params - Event parameters
 * @returns {Promise<void>}
 */
export const trackEvent = async (eventName, params = {}) => {
  try {
    const event = {
      eventName,
      timestamp: new Date().toISOString(),
      params,
    };

    // In development, console log the event for debugging
    if (__DEV__) {
      console.log('[ANALYTICS]', event);
    }

    // Get existing events
    const existingEventsJson = await AsyncStorage.getItem(EVENTS_KEY);
    const existingEvents = existingEventsJson ? JSON.parse(existingEventsJson) : [];
    
    // Add new event
    const updatedEvents = [...existingEvents, event];
    
    // Save updated events
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(updatedEvents));
    
    // In a real app, you would call your analytics service here
    // Example: sendToAnalyticsService(event);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

/**
 * Track a screen view
 * @param {string} screenName - Name of the screen
 * @param {Object} screenParams - Screen parameters
 * @returns {Promise<void>}
 */
export const trackScreenView = async (screenName, screenParams = {}) => {
  await trackEvent(EVENTS.SCREEN_VIEW, {
    screen_name: screenName,
    ...screenParams,
  });
};

/**
 * Start an analytics session
 * @returns {Promise<void>}
 */
export const startSession = async () => {
  try {
    const sessionId = generateSessionId();
    const sessionData = {
      sessionId,
      startTime: new Date().toISOString(),
      isActive: true,
    };
    
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    await trackEvent(EVENTS.APP_OPEN, { session_id: sessionId });
  } catch (error) {
    console.error('Failed to start session:', error);
  }
};

/**
 * End the current analytics session
 * @returns {Promise<void>}
 */
export const endSession = async () => {
  try {
    const sessionJson = await AsyncStorage.getItem(SESSION_KEY);
    
    if (sessionJson) {
      const sessionData = JSON.parse(sessionJson);
      sessionData.endTime = new Date().toISOString();
      sessionData.isActive = false;
      
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      await trackEvent(EVENTS.APP_CLOSE, { 
        session_id: sessionData.sessionId,
        session_duration_ms: new Date(sessionData.endTime) - new Date(sessionData.startTime),
      });
    }
  } catch (error) {
    console.error('Failed to end session:', error);
  }
};

/**
 * Set a user property for analytics
 * @param {string} property - Property name
 * @param {any} value - Property value
 * @returns {Promise<void>}
 */
export const setUserProperty = async (property, value) => {
  try {
    const propertiesJson = await AsyncStorage.getItem(USER_PROPERTIES_KEY);
    const properties = propertiesJson ? JSON.parse(propertiesJson) : {};
    
    properties[property] = value;
    
    await AsyncStorage.setItem(USER_PROPERTIES_KEY, JSON.stringify(properties));
  } catch (error) {
    console.error('Failed to set user property:', error);
  }
};

/**
 * Set user ID for analytics
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const setUserId = async (userId) => {
  await setUserProperty('user_id', userId);
};

/**
 * Get all stored analytics events
 * @returns {Promise<Array>} Array of events
 */
export const getAnalyticsEvents = async () => {
  try {
    const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
    return eventsJson ? JSON.parse(eventsJson) : [];
  } catch (error) {
    console.error('Failed to retrieve analytics events:', error);
    return [];
  }
};

/**
 * Clear all stored analytics events
 * @returns {Promise<void>}
 */
export const clearAnalyticsEvents = async () => {
  try {
    await AsyncStorage.removeItem(EVENTS_KEY);
  } catch (error) {
    console.error('Failed to clear analytics events:', error);
  }
};

/**
 * Generate a unique session ID
 * @returns {string} Session ID
 */
const generateSessionId = () => {
  return 'session_' + Math.random().toString(36).substring(2, 15);
};

// Example function to send events to an analytics service
// In a real app, you would implement this with proper batching and retry logic
const sendToAnalyticsService = (event) => {
  // This would be an API call to your analytics backend
  // fetch('https://your-api.com/track', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(event),
  // });
};

export default {
  trackEvent,
  trackScreenView,
  startSession,
  endSession,
  setUserProperty,
  setUserId,
  getAnalyticsEvents,
  clearAnalyticsEvents,
  EVENTS,
};