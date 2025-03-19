import React, { useEffect } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { theme } from '../theme';
import { useAuth } from '../contexts/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import RegistrationSuccessScreen from '../screens/auth/RegistrationSuccessScreen';

// Main Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import QuestionnaireScreen from '../screens/QuestionnaireScreen';
import CalculationScreen from '../screens/CalculationScreen';
import ResultsScreen from '../screens/ResultsScreen';

// Subscription Screen
import SubscriptionScreen from '../screens/subscription/SubscriptionScreen';

// Profile Screens
import ProfileScreen from '../screens/profile/ProfileScreen';

// Create stack navigators
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

// Auth navigator (for unauthenticated users)
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: Platform.OS === 'ios' ? 'default' : 'fade',
        animationDuration: 200,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="RegistrationSuccess" component={RegistrationSuccessScreen} />
    </AuthStack.Navigator>
  );
};

// Main navigator (for authenticated users)
const MainNavigator = () => {
  const { isPremium } = useAuth();

  return (
    <MainStack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: Platform.OS === 'ios' ? 'default' : 'fade',
        animationDuration: 200,
        gestureEnabled: false,
      }}
    >
      <MainStack.Screen name="Welcome" component={WelcomeScreen} />
      <MainStack.Screen name="Questionnaire" component={QuestionnaireScreen} />
      <MainStack.Screen 
        name="Calculation" 
        component={CalculationScreen}
        options={{
          // If user is not premium, show paywall before calculation
          headerShown: false,
          // We'll handle this check in the Calculation component
        }}
      />
      <MainStack.Screen name="Results" component={ResultsScreen} />
      <MainStack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerShown: true,
          headerTitle: 'Profile',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: theme.typography.sizes.title3,
            fontWeight: '600',
            color: theme.colors.text,
          },
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
        }}
      />
      <MainStack.Screen 
        name="Subscription" 
        component={SubscriptionScreen}
        options={{
          headerShown: true,
          headerTitle: 'Premium Subscription',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: theme.typography.sizes.title3,
            fontWeight: '600',
            color: theme.colors.text,
          },
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
        }}
      />
    </MainStack.Navigator>
  );
};

// Main app navigation container
const AppNavigation = () => {
  const { user, loading } = useAuth();

  // Navigation theming
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

  if (loading) {
    // You could return a loading screen here
    return null;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigation;