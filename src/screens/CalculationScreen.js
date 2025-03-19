// src/screens/CalculationScreen.js (Updated with React.memo, useMemo, and useCallback)
import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  BackHandler, 
  Platform, 
  Text as RNText,
  SafeAreaView,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { Text, Surface, Portal, Dialog, ActivityIndicator } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import CustomButton from '../components/CustomButton';
import ProgressIndicator from '../components/ProgressIndicator';
import { useApi } from '../hooks/useApi';
import { theme } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Get screen dimensions - outside component for better performance
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CalculationScreen = ({ route, navigation }) => {
  const { answers } = route.params || { answers: {} };
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { hasActiveSubscription, user } = useAuth();
  
  const {
    calculateScores,
    loading,
    error,
    progress,
    calculationStatus,
    retryCount,
    abortCalculation,
    cleanup
  } = useApi();

  // Check if the user has access to run the calculation
  useEffect(() => {
    const checkAccess = async () => {
      console.log('CalculationScreen - Checking subscription access');
      console.log('User logged in:', !!user);
      console.log('Has active subscription:', hasActiveSubscription());
      
      try {
        // Check if user is logged in and has active subscription
        if (!user) {
          console.log('User not logged in, redirecting to Subscription screen');
          // If not logged in, redirect to subscription screen
          navigation.replace('Subscription', {
            redirectTo: 'Calculation',
            params: { answers }
          });
          return;
        }
        
        // Check if user has active subscription
        if (!hasActiveSubscription()) {
          console.log('No active subscription, redirecting to Subscription screen');
          // If no subscription, redirect to subscription screen
          navigation.replace('Subscription', {
            redirectTo: 'Calculation',
            params: { answers }
          });
        } else {
          console.log('User has active subscription, proceeding with calculation');
        }
      } catch (error) {
        console.error('Error checking access:', error);
      }
    };
    
    checkAccess();
  }, [hasActiveSubscription, navigation, answers, user]);

  // Handle calculation - optimized with useCallback
  const performCalculation = useCallback(async () => {
    if (isCalculating) return; // Prevent multiple simultaneous calculations
    
    setIsCalculating(true);
    try {
      console.log('Starting calculation...');
      // Short delay to ensure UI is ready
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const results = await calculateScores(answers);
      console.log('Calculation results:', results);

      // Only navigate if we have valid results
      if (results) {
        navigation.replace('Results', {
          scores: {
            categoryScores: results.categoryScores,
            overallScore: results.overallScore
          },
          globalRanking: results.globalRanking,
          status: results.status,
          futurePrediction: results.futurePrediction
        });
      }
    } catch (error) {
      console.error('Calculation error:', error);
      // Show error dialog instead of alert
      setErrorMessage(error.message || 'An unexpected error occurred during calculation.');
      setShowErrorDialog(true);
    } finally {
      setIsCalculating(false);
    }
  }, [answers, calculateScores, navigation, isCalculating]);

  // Setup back handler and start calculation - optimized with cleanup
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (loading) {
        setShowCancelDialog(true);
        return true;
      }
      return false;
    });

    // Start calculation only once when the component mounts and user has access
    if (!isCalculating && user && hasActiveSubscription()) {
      console.log('Starting calculation process...');
      performCalculation();
    }

    return () => {
      backHandler.remove();
      cleanup();
    };
  }, [performCalculation, loading, cleanup, isCalculating, hasActiveSubscription, user]);

  // Dialog control handlers - optimized with useCallback
  const handleCancelDialogOpen = useCallback(() => {
    setShowCancelDialog(true);
  }, []);

  const handleCancelDialogClose = useCallback(() => {
    setShowCancelDialog(false);
  }, []);

  const handleErrorDialogClose = useCallback(() => {
    setShowErrorDialog(false);
  }, []);

  // Action handlers - optimized with useCallback
  const handleCancel = useCallback(() => {
    abortCalculation();
    navigation.goBack();
  }, [abortCalculation, navigation]);

  const handleRetry = useCallback(() => {
    setShowErrorDialog(false);
    // Short delay before retrying
    setTimeout(() => {
      performCalculation();
    }, 500);
  }, [performCalculation]);

  const handleErrorGoBack = useCallback(() => {
    setShowErrorDialog(false);
    navigation.goBack();
  }, [navigation]);

  // Memoize the loading UI
  const loadingUI = useMemo(() => (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Checking subscription status...</Text>
      </View>
    </SafeAreaView>
  ), []);

  // If user doesn't have access or is not logged in, don't render full content
  if (!user || !hasActiveSubscription()) {
    return loadingUI;
  }

  // Memoize the error UI
  const errorUI = useMemo(() => (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={80}
            color={theme.colors.lowScore}
          />
        </View>
        <Text style={styles.errorTitle}>Calculation Error</Text>
        <Text style={styles.errorMessage}>
          {error || 'There was an error processing your assessment. Please try again.'}
        </Text>
        <View style={styles.errorButtonContainer}>
          <CustomButton
            mode="contained"
            onPress={() => performCalculation()}
            style={styles.retryButton}
          >
            Retry Calculation
          </CustomButton>
          <CustomButton
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            Back to Questionnaire
          </CustomButton>
        </View>
      </View>
    </SafeAreaView>
  ), [error, navigation, performCalculation]);

  // If there's an error from the API hook, show error UI
  if (error && !showErrorDialog) {
    return errorUI;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.surface}>
        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Calculating Results</Text>
            <Text style={styles.subtitle}>
              We're analyzing your responses and determining your global ranking.
            </Text>
          </View>
          
          {/* Use ProgressIndicator for all platforms for consistency */}
          <ProgressIndicator
            progress={progress}
            status={calculationStatus || "Analyzing your profile..."}
            subtitle="Using advanced algorithms to compare your profile against 3.97 billion men worldwide..."
            retryAttempt={retryCount}
            maxRetries={5}
          />

          {/* Show cancel button when loading */}
          {loading && (
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancelDialogOpen}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Dialog for confirming cancellation */}
        <Portal>
          <Dialog
            visible={showCancelDialog}
            onDismiss={handleCancelDialogClose}
            style={[styles.dialog, Platform.OS === 'ios' && styles.iosDialog]}
          >
            <Dialog.Title style={styles.dialogTitle}>Cancel Calculation?</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogContent}>
                The calculation is still in progress. Are you sure you want to cancel?
              </Text>
            </Dialog.Content>
            <Dialog.Actions style={styles.dialogActions}>
              <CustomButton
                mode="text"
                onPress={handleCancelDialogClose}
              >
                Continue
              </CustomButton>
              <CustomButton
                mode="contained"
                onPress={handleCancel}
              >
                Cancel
              </CustomButton>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {/* Error Dialog */}
        <Portal>
          <Dialog
            visible={showErrorDialog}
            onDismiss={handleErrorDialogClose}
            style={[styles.dialog, Platform.OS === 'ios' && styles.iosDialog]}
          >
            <Dialog.Title style={styles.dialogTitle}>Calculation Error</Dialog.Title>
            <Dialog.Content>
              <View style={styles.errorDialogContent}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={40}
                  color={theme.colors.lowScore}
                  style={styles.errorDialogIcon}
                />
                <Text style={styles.dialogContent}>
                  {errorMessage || 'There was an error processing your assessment. Please try again.'}
                </Text>
              </View>
            </Dialog.Content>
            <Dialog.Actions style={styles.dialogActions}>
              <CustomButton
                mode="text"
                onPress={handleErrorGoBack}
              >
                Back
              </CustomButton>
              <CustomButton
                mode="contained"
                onPress={handleRetry}
              >
                Retry
              </CustomButton>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  surface: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl * 1.5
  },
  title: {
    fontSize: theme.typography.sizes.title1,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.m
  },
  subtitle: {
    fontSize: theme.typography.sizes.subhead,
    color: theme.colors.subtext,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 22
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl
  },
  loadingText: {
    marginTop: theme.spacing.l,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl
  },
  errorIconContainer: {
    marginBottom: theme.spacing.xl
  },
  errorTitle: {
    fontSize: theme.typography.sizes.title2,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
    textAlign: 'center'
  },
  errorMessage: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.subtext,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    maxWidth: '90%',
    lineHeight: 22
  },
  errorButtonContainer: {
    width: '100%',
    maxWidth: 320
  },
  retryButton: {
    marginBottom: theme.spacing.m
  },
  backButton: {
    marginBottom: theme.spacing.m
  },
  dialog: {
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surface,
    width: Platform.OS === 'web' ? '400px' : SCREEN_WIDTH * 0.85,
    alignSelf: 'center',
  },
  iosDialog: {
    overflow: 'hidden', // Fix for iOS
  },
  dialogTitle: {
    textAlign: 'center',
    fontSize: theme.typography.sizes.title3,
    color: theme.colors.text,
    fontWeight: '600'
  },
  dialogContent: {
    textAlign: 'center',
    fontSize: theme.typography.sizes.body,
    color: theme.colors.subtext,
    lineHeight: 22
  },
  errorDialogContent: {
    alignItems: 'center'
  },
  errorDialogIcon: {
    marginBottom: theme.spacing.m
  },
  dialogActions: {
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.m,
    flexDirection: 'row',
  },
  cancelButton: {
    alignSelf: 'center',
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xxl
  },
  cancelButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: theme.typography.sizes.body
  }
});

// Wrap component with React.memo to prevent unnecessary re-renders
export default React.memo(CalculationScreen);