// src/utils/DebugUtils.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility functions for debugging app state, navigation and subscription issues
 */

// Log current auth and subscription state
export const logAuthState = async (component = 'Unknown') => {
  try {
    // Get session data
    const sessionJson = await AsyncStorage.getItem('@auth_session');
    const session = sessionJson ? JSON.parse(sessionJson) : null;
    
    // Get subscription data
    const subscriptionType = await AsyncStorage.getItem('@user_subscription');
    const subscriptionExpiry = await AsyncStorage.getItem('@subscription_expiry');
    const paymentStatus = await AsyncStorage.getItem('@payment_status');
    
    console.log(`[${component}] Auth State:`, {
      hasSession: !!session,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email
      } : null,
      subscription: {
        type: subscriptionType || 'none',
        expiry: subscriptionExpiry || 'none',
        paid: paymentStatus === 'paid'
      }
    });
    
    return {
      hasSession: !!session,
      user: session?.user,
      subscription: {
        type: subscriptionType,
        expiry: subscriptionExpiry,
        paid: paymentStatus === 'paid'
      }
    };
  } catch (error) {
    console.error('Debug logging error:', error);
    return null;
  }
};

// Check if subscription is still valid
export const checkSubscriptionValidity = async () => {
  try {
    const expiry = await AsyncStorage.getItem('@subscription_expiry');
    
    if (!expiry) {
      console.log('[DebugUtils] No subscription expiry found');
      return false;
    }
    
    const expiryDate = new Date(expiry);
    const now = new Date();
    const isValid = expiryDate > now;
    
    console.log(`[DebugUtils] Subscription valid: ${isValid}, expires: ${expiryDate.toLocaleString()}`);
    
    return isValid;
  } catch (error) {
    console.error('Error checking subscription validity:', error);
    return false;
  }
};

// Fix potential incorrect AsyncStorage state
export const repairSubscriptionState = async () => {
  try {
    // First log current state
    await logAuthState('RepairTool');
    
    // Get all important keys
    const keys = [
      '@auth_session',
      '@user_subscription',
      '@subscription_expiry',
      '@payment_status',
      '@payment_product',
      '@payment_date'
    ];
    
    const values = await AsyncStorage.multiGet(keys);
    const state = {};
    
    values.forEach(([key, value]) => {
      state[key] = value;
    });
    
    console.log('[RepairTool] Current AsyncStorage state:', state);
    
    // Check for inconsistencies
    const hasSession = !!state['@auth_session'];
    const hasSubscription = !!state['@user_subscription'];
    const hasPaid = state['@payment_status'] === 'paid';
    const hasExpiry = !!state['@subscription_expiry'];
    
    let repaired = false;
    
    // Fix inconsistencies
    if (hasSubscription && !hasPaid) {
      console.log('[RepairTool] Found subscription without payment status, fixing...');
      await AsyncStorage.setItem('@payment_status', 'paid');
      repaired = true;
    }
    
    if (hasSubscription && !hasExpiry) {
      console.log('[RepairTool] Found subscription without expiry, fixing...');
      // Set expiry to 30 days from now as default
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      await AsyncStorage.setItem('@subscription_expiry', expiry.toISOString());
      repaired = true;
    }
    
    if (hasPaid && !hasSubscription) {
      console.log('[RepairTool] Found payment without subscription, fixing...');
      await AsyncStorage.setItem('@user_subscription', 'monthly');
      repaired = true;
    }
    
    // Log new state if repairs were made
    if (repaired) {
      console.log('[RepairTool] Repairs completed, new state:');
      await logAuthState('RepairTool');
      return true;
    }
    
    console.log('[RepairTool] No repairs needed');
    return false;
  } catch (error) {
    console.error('Error repairing subscription state:', error);
    return false;
  }
};

// Clear all subscription data (for testing)
export const clearSubscriptionData = async () => {
  try {
    const keys = [
      '@user_subscription',
      '@subscription_expiry',
      '@payment_status',
      '@payment_product',
      '@payment_date',
      '@selected_plan',
      '@selected_plan_type'
    ];
    
    await AsyncStorage.multiRemove(keys);
    console.log('[DebugUtils] Cleared all subscription data');
    return true;
  } catch (error) {
    console.error('Error clearing subscription data:', error);
    return false;
  }
};

// Print navigation state for debugging
export const logNavigationState = (navigation, component = 'Unknown') => {
  if (!navigation) return;
  
  const routes = navigation.getState()?.routes || [];
  const currentRoute = navigation.getCurrentRoute?.() || routes[routes.length - 1];
  
  console.log(`[${component}] Navigation State:`, {
    current: currentRoute?.name,
    params: currentRoute?.params,
    stack: routes.map(r => r.name)
  });
};

export default {
  logAuthState,
  checkSubscriptionValidity,
  repairSubscriptionState,
  clearSubscriptionData,
  logNavigationState
};