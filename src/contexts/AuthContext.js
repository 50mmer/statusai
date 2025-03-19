import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from '../config/supabase';
import * as StoreConfig from '../utils/MockStoreConfig';
import { isSubscriptionActive } from '../config/subscriptionPlans';
import { CommonActions } from '@react-navigation/native';

// Create the authentication context
const AuthContext = createContext();

// Define subscription tiers
export const SUBSCRIPTION_TIERS = {
  NONE: 'none',
  ONE_DAY: 'one_day',
  MONTHLY: 'monthly',
};

// Authentication provider component
export const AuthProvider = ({ children, navigation }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(SUBSCRIPTION_TIERS.NONE);
  const [hasPaid, setHasPaid] = useState(false);
  const [subscriptionExpiryDate, setSubscriptionExpiryDate] = useState(null);

  // Initialize auth state
  useEffect(() => {
    // Check for existing session
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // Check subscription status
        const subscriptionData = await StoreConfig.getCurrentSubscription();
        
        if (subscriptionData && subscriptionData.isActive) {
          setHasPaid(true);
          setSubscription(subscriptionData.type);
          setSubscriptionExpiryDate(subscriptionData.expiryDate);
          console.log('Active subscription found during initialization:', subscriptionData);
        } else {
          setHasPaid(false);
          setSubscription(SUBSCRIPTION_TIERS.NONE);
          setSubscriptionExpiryDate(null);
          console.log('No active subscription found during initialization');
        }
        
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else if (session) {
          setSession(session);
          setUser(session.user);
          console.log('User session found during initialization');
          
          // Get user's subscription from profile if exists
          if (session.user) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('subscription_tier, subscription_expiry')
              .eq('id', session.user.id)
              .single();
              
            if (!profileError && profile) {
              // Only set subscription from profile if it's still active
              if (profile.subscription_expiry && 
                  isSubscriptionActive(profile.subscription_expiry)) {
                setSubscription(profile.subscription_tier || SUBSCRIPTION_TIERS.NONE);
                setSubscriptionExpiryDate(profile.subscription_expiry);
                setHasPaid(true);
                console.log('Subscription from profile loaded:', profile.subscription_tier);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);
        setUser(newSession?.user || null);
        
        // If user has logged out, clear subscription data
        if (event === 'SIGNED_OUT') {
          setHasPaid(false);
          setSubscription(SUBSCRIPTION_TIERS.NONE);
          setSubscriptionExpiryDate(null);
          await AsyncStorage.removeItem('@auth_session');
          console.log('User signed out, cleared subscription data');
        }
        
        // Store the session
        if (newSession) {
          await AsyncStorage.setItem('@auth_session', JSON.stringify(newSession));
        } else {
          await AsyncStorage.removeItem('@auth_session');
        }
      }
    );

    // Clean up subscription when unmounting
    return () => {
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Sign up function - now also handles subscription
  const signUp = async (email, password) => {
    try {
      console.log('Signing up user:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      // Store the subscription status in Supabase if user has paid
      if (hasPaid && data.user) {
        console.log('User signed up and has active subscription - updating profile');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            has_paid: true,
            subscription_tier: subscription,
            subscription_expiry: subscriptionExpiryDate
          })
          .eq('id', data.user.id);
          
        if (updateError) {
          console.error('Error updating profile:', updateError);
        }
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { data: null, error };
    }
  };

  // Sign in function
  const signIn = async (email, password) => {
    try {
      console.log('Signing in user:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Check if the user has subscription status
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('has_paid, subscription_tier, subscription_expiry')
          .eq('id', data.user.id)
          .single();
          
        if (!profileError && profile) {
          // Check if the subscription is still active
          const isActive = profile.subscription_expiry && 
            isSubscriptionActive(profile.subscription_expiry);
            
          setHasPaid(isActive);
          
          if (isActive) {
            console.log('Found active subscription in profile after login');
            setSubscription(profile.subscription_tier || SUBSCRIPTION_TIERS.NONE);
            setSubscriptionExpiryDate(profile.subscription_expiry);
          } else {
            console.log('No active subscription found in profile after login');
            setSubscription(SUBSCRIPTION_TIERS.NONE);
            setSubscriptionExpiryDate(null);
          }
        }
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { data: null, error };
    }
  };

  // Sign out function (improved to handle navigation correctly)
  const signOut = async () => {
    try {
      console.log('Signing out user');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear the stored session and subscription data
      await AsyncStorage.removeItem('@auth_session');
      
      // Clear all subscription data from AsyncStorage
      const subscriptionKeys = [
        '@user_subscription',
        '@subscription_expiry',
        '@payment_status',
        '@payment_product',
        '@payment_date',
        '@selected_plan',
        '@selected_plan_type'
      ];
      
      await AsyncStorage.multiRemove(subscriptionKeys);
      
      // Update context state
      setUser(null);
      setSession(null);
      setHasPaid(false);
      setSubscription(SUBSCRIPTION_TIERS.NONE);
      setSubscriptionExpiryDate(null);
      
      console.log('User successfully signed out');
      
      return { error: null };
    } catch (error) {
      console.error('Signout error:', error);
      return { error };
    }
  };

  // Update subscription
  const updateSubscription = async (tier, expiryDate) => {
    try {
      console.log('Updating subscription:', tier, expiryDate);
      // Update subscription tier
      setSubscription(tier);
      setHasPaid(tier !== SUBSCRIPTION_TIERS.NONE);
      setSubscriptionExpiryDate(expiryDate);
      
      // Save to local storage
      if (tier !== SUBSCRIPTION_TIERS.NONE) {
        await AsyncStorage.setItem('@user_subscription', tier);
        await AsyncStorage.setItem('@payment_status', 'paid');
        await AsyncStorage.setItem('@subscription_expiry', expiryDate);
        console.log('Saved subscription to AsyncStorage');
      } else {
        await AsyncStorage.removeItem('@user_subscription');
        await AsyncStorage.removeItem('@payment_status');
        await AsyncStorage.removeItem('@subscription_expiry');
        console.log('Removed subscription from AsyncStorage');
      }
      
      // Update in Supabase if user is logged in
      if (user) {
        console.log('Updating subscription in Supabase profile');
        const { error } = await supabase
          .from('profiles')
          .update({ 
            has_paid: tier !== SUBSCRIPTION_TIERS.NONE,
            subscription_tier: tier,
            subscription_expiry: expiryDate
          })
          .eq('id', user.id);
          
        if (error) {
          console.error('Error updating profile in Supabase:', error);
        }
      }
      
      return { data: true, error: null };
    } catch (error) {
      console.error('Error updating subscription:', error);
      return { data: null, error };
    }
  };

  // Check if user has active subscription
  const hasActiveSubscription = () => {
    if (!hasPaid) {
      console.log('hasActiveSubscription: false (not paid)');
      return false;
    }
    
    if (!subscriptionExpiryDate) {
      console.log('hasActiveSubscription: false (no expiry date)');
      return false;
    }
    
    const isActive = isSubscriptionActive(subscriptionExpiryDate);
    console.log('hasActiveSubscription:', isActive, 'expiry:', subscriptionExpiryDate);
    return isActive;
  };

  // Auth context value
  const value = {
    user,
    session,
    loading,
    subscription,
    hasPaid,
    subscriptionExpiryDate,
    hasActiveSubscription,
    isOneDay: subscription === SUBSCRIPTION_TIERS.ONE_DAY,
    isMonthly: subscription === SUBSCRIPTION_TIERS.MONTHLY,
    signUp,
    signIn,
    signOut,
    updateSubscription
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};