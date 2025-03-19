import React, { useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { LogBox, StyleSheet, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as TrackingTransparency from 'expo-tracking-transparency';

// Import screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import QuestionnaireScreen from './src/screens/QuestionnaireScreen';
import CalculationScreen from './src/screens/CalculationScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import SubscriptionScreen from './src/screens/subscription/SubscriptionScreen';

// Import auth screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import RegistrationSuccessScreen from './src/screens/auth/RegistrationSuccessScreen';

// Import profile screens
import ProfileScreen from './src/screens/profile/ProfileScreen';
import DataDeletionScreen from './src/screens/profile/DataDeletionScreen';

// Import legal screens
import PrivacyPolicyScreen from './src/screens/legal/PrivacyPolicyScreen';
import TermsOfServiceScreen from './src/screens/legal/TermsOfServiceScreen';
import SubscriptionTermsScreen from './src/screens/legal/SubscriptionTermsScreen';

// Import auth context provider
import { AuthProvider } from './src/contexts/AuthContext';

// Import theme
import { theme } from './src/theme';

// Import utilities
import Analytics from './src/utils/Analytics';
import ErrorLogger from './src/utils/ErrorLogger';

// Ignore some warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested inside plain ScrollViews',
  'Animated: `useNativeDriver` is not supported',
  'activateKeepAwake is deprecated'
]);

const Stack = createNativeStackNavigator();

const navigationTheme = {
  dark: false,
  colors: {
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.border,
    notification: theme.colors.primary,
  },
};

export default function App() {
  // Create a navigation reference that we can pass to the AuthProvider
  const navigationRef = useRef();
  const routeNameRef = useRef();
  const appState = useRef(AppState.currentState);

  // Set up analytics tracking and error handling
  useEffect(() => {
    // App Tracking Transparency
    const requestTrackingPermission = async () => {
      try {
        const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();
        console.log('Tracking permission status:', status);
      } catch (error) {
        console.log('Error requesting tracking permission:', error);
      }
    };

    // Request permission after a short delay (Apple recommends this)
    setTimeout(() => {
      requestTrackingPermission();
    }, 1000);

    // Start analytics session
    Analytics.startSession();

    // Set up global error handler
    const originalErrorHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      // Log the error
      ErrorLogger.logError(error, 'GlobalErrorHandler', { isFatal });

      // Track error in analytics
      Analytics.trackEvent(Analytics.EVENTS.ERROR, {
        message: error.message,
        isFatal,
      });

      // Call original handler
      originalErrorHandler(error, isFatal);
    });

    // Track app state changes for session management
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        Analytics.startSession();
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App has gone to the background
        Analytics.endSession();
      }
      appState.current = nextAppState;
    });

    return () => {
      // Clean up
      subscription.remove();
      Analytics.endSession();
      // Restore original error handler
      ErrorUtils.setGlobalHandler(originalErrorHandler);
    };
  }, []);

  const handleNavigationStateChange = (state) => {
    const previousRouteName = routeNameRef.current;
    const currentRouteName = navigationRef.current.getCurrentRoute().name;

    if (previousRouteName !== currentRouteName) {
      // Track screen view
      Analytics.trackScreenView(currentRouteName);
    }

    // Save the current route name for later comparison
    routeNameRef.current = currentRouteName;
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="dark" />
        <AuthProvider>
          <NavigationContainer
            theme={navigationTheme}
            ref={navigationRef}
            onReady={() => {
              routeNameRef.current = navigationRef.current.getCurrentRoute().name;
              Analytics.trackScreenView(routeNameRef.current);
            }}
            onStateChange={handleNavigationStateChange}
          >
            <Stack.Navigator
              initialRouteName="Welcome"
              screenOptions={{
                headerShown: false,
                contentStyle: styles.screenContent,
                animation: 'fade',
                animationDuration: 200,
              }}
            >
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{
                  headerShown: true,
                  headerTitle: 'Sign In',
                  headerTitleAlign: 'center',
                  headerBackTitle: 'Back',
                  headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                  },
                }}
              />
              <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{
                  headerShown: true,
                  headerTitle: 'Create Account',
                  headerTitleAlign: 'center',
                  headerBackTitle: 'Back',
                  headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                  },
                }}
              />
              <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
                options={{
                  headerShown: true,
                  headerTitle: 'Reset Password',
                  headerTitleAlign: 'center',
                  headerBackTitle: 'Back',
                  headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                  },
                }}
              />
              <Stack.Screen name="RegistrationSuccess" component={RegistrationSuccessScreen} />
              <Stack.Screen
                name="Subscription"
                component={SubscriptionScreen}
                options={{
                  headerShown: true,
                  headerTitle: 'Subscription',
                  headerTitleAlign: 'center',
                  headerBackTitle: 'Back',
                  headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                  },
                }}
              />
              <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                  headerShown: true,
                  headerTitle: 'Profile',
                  headerTitleAlign: 'center',
                  headerBackTitle: 'Back',
                  headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                  },
                }}
              />
              <Stack.Screen
                name="Questionnaire"
                component={QuestionnaireScreen}
                options={{
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen
                name="Calculation"
                component={CalculationScreen}
                options={{
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen
                name="Results"
                component={ResultsScreen}
                options={{
                  gestureEnabled: false,
                }}
              />
              {/* Legal Screens */}
              <Stack.Screen
                name="PrivacyPolicy"
                component={PrivacyPolicyScreen}
                options={{
                  headerShown: true,
                  headerTitle: 'Privacy Policy',
                  headerTitleAlign: 'center',
                  headerBackTitle: 'Back',
                  headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                  },
                }}
              />
              <Stack.Screen
                name="TermsOfService"
                component={TermsOfServiceScreen}
                options={{
                  headerShown: true,
                  headerTitle: 'Terms of Service',
                  headerTitleAlign: 'center',
                  headerBackTitle: 'Back',
                  headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                  },
                }}
              />
              <Stack.Screen
                name="SubscriptionTerms"
                component={SubscriptionTermsScreen}
                options={{
                  headerShown: true,
                  headerTitle: 'Subscription Terms',
                  headerTitleAlign: 'center',
                  headerBackTitle: 'Back',
                  headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                  },
                }}
              />
              <Stack.Screen
                name="DataDeletion"
                component={DataDeletionScreen}
                options={{
                  headerShown: true,
                  headerTitle: 'Delete My Data',
                  headerTitleAlign: 'center',
                  headerBackTitle: 'Back',
                  headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                  },
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    backgroundColor: theme.colors.background,
    flex: 1,
  }
});