import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Share, 
  BackHandler, 
  Platform, 
  Text as RNText,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Text, Portal, Dialog, Snackbar } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '../components/CustomButton';
import ScoreCircle from '../components/ScoreCircle';
import RatingBar from '../components/RatingBar';
import { theme, getScoreColor } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import Analytics from '../utils/Analytics';
import ErrorLogger from '../utils/ErrorLogger';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ResultsScreen = ({ route, navigation }) => {
  const scrollViewRef = useRef(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showRetakeDialog, setShowRetakeDialog] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const { hasActiveSubscription } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Safely get params with defaults, ensuring they are always the correct data type
  const params = route.params || {};
  
  // Ensure scores are numeric values - using useMemo to prevent recalculations
  const scores = useMemo(() => {
    const defaultScores = { 
      categoryScores: {
        wealth: 50,
        fitness: 50,
        power: 50,
        intelligence: 50,
        willpower: 50,
        legacy: 50
      }, 
      overallScore: 50 
    };
    
    if (!params.scores) return defaultScores;
    
    // Parse all scores to ensure they are numbers
    return {
      categoryScores: {
        wealth: parseInt(params.scores.categoryScores?.wealth || 50, 10),
        fitness: parseInt(params.scores.categoryScores?.fitness || 50, 10),
        power: parseInt(params.scores.categoryScores?.power || 50, 10),
        intelligence: parseInt(params.scores.categoryScores?.intelligence || 50, 10),
        willpower: parseInt(params.scores.categoryScores?.willpower || 50, 10),
        legacy: parseInt(params.scores.categoryScores?.legacy || 50, 10)
      },
      overallScore: parseInt(params.scores.overallScore || 50, 10)
    };
  }, [params.scores]);
  
  const status = params.status || 'Average Male';
  
  // Ensure global ranking values are numeric - using useMemo for optimization
  const globalRanking = useMemo(() => {
    const defaultRanking = { position: 1985000000, percentile: 50.0 };
    if (!params.globalRanking) return defaultRanking;
    
    return {
      position: parseInt(params.globalRanking.position || 1985000000, 10),
      percentile: parseFloat(params.globalRanking.percentile || 50.0)
    };
  }, [params.globalRanking]);
  
  const futurePrediction = params.futurePrediction || 'No prediction available';

  // Track screen view when component mounts
  useEffect(() => {
    Analytics.trackScreenView('Results', { 
      overall_score: scores.overallScore,
      percentile: globalRanking.percentile
    });
  }, [scores.overallScore, globalRanking.percentile]);

  // Handle hardware back button - optimized with useCallback
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Welcome');
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  // Save results to AsyncStorage with visual feedback
  useEffect(() => {
    const saveResults = async () => {
      if (!params.scores) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setIsSaving(true);
      setSaveSuccess(false);
      setSaveError(false);
      
      try {
        // Small delay to make saving feedback visible
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const resultsData = {
          scores,
          status,
          globalRanking,
          futurePrediction,
          timestamp: Date.now()
        };
        
        await AsyncStorage.setItem('@last_results', JSON.stringify(resultsData));
        
        // Also save to history
        try {
          const historyJson = await AsyncStorage.getItem('@results_history');
          const history = historyJson ? JSON.parse(historyJson) : [];
          
          // Add to beginning of history
          history.unshift(resultsData);
          
          // Limit history to last 10 entries
          const limitedHistory = history.slice(0, 10);
          
          await AsyncStorage.setItem('@results_history', JSON.stringify(limitedHistory));
        } catch (historyError) {
          console.error('Failed to save to history:', historyError);
          ErrorLogger.logError(historyError, 'ResultsScreen.saveHistory');
        }
        
        setSaveSuccess(true);
        setSnackbarMessage('Results saved successfully!');
        setShowSnackbar(true);
      } catch (storageError) {
        console.error('Failed to save results:', storageError);
        ErrorLogger.logError(storageError, 'ResultsScreen.saveResults');
        setSaveError(true);
        setSnackbarMessage('Failed to save results. Please try again.');
        setShowSnackbar(true);
      } finally {
        setIsSaving(false);
        setIsLoading(false);
      }
    };

    saveResults();
  }, [params.scores, scores, status, globalRanking, futurePrediction]);

  // Validate data on mount - only run once
  useEffect(() => {
    const validateData = () => {
      if (!route.params || !params.scores || !params.scores.categoryScores) {
        console.error('Missing required data in Results screen');
        // Log error
        ErrorLogger.logError(
          new Error('Missing required data in Results screen'),
          'ResultsScreen.validateData'
        );
        navigation.replace('Welcome');
      }
    };

    validateData();
  }, [route.params, params.scores, navigation]);

  // Handler for sharing results - memoized with useCallback
  const handleShare = useCallback(async () => {
    try {
      // Track share attempt
      Analytics.trackEvent('share_results_attempt');
      
      const message = 
        `Just got rated as a "${status}" 🧠\n\n` +
        `My Global Male Ranking Score: ${Math.round(scores.overallScore)}/100\n` +
        `I'm in the top ${globalRanking.percentile}% of men globally!\n\n` +
        `Category Scores:\n` +
        `Wealth & Resources: ${Math.round(scores.categoryScores.wealth)}/100\n` +
        `Physical Fitness: ${Math.round(scores.categoryScores.fitness)}/100\n` +
        `Power & Influence: ${Math.round(scores.categoryScores.power)}/100\n` +
        `Intelligence: ${Math.round(scores.categoryScores.intelligence)}/100\n` +
        `Willpower: ${Math.round(scores.categoryScores.willpower)}/100\n` +
        `Legacy: ${Math.round(scores.categoryScores.legacy)}/100\n\n` +
        `Future Prediction: "${futurePrediction}"\n\n` +
        `Find out your ranking: [APP_LINK]`;

      const result = await Share.share({
        message,
        title: 'My Global Male Ranking'
      });
      
      // Track share result
      if (result.action === Share.sharedAction) {
        Analytics.trackEvent('share_results_success');
        setSnackbarMessage('Results shared successfully!');
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error('Share error:', error);
      // Log error
      ErrorLogger.logError(error, 'ResultsScreen.handleShare');
      
      // Track share error
      Analytics.trackEvent('share_results_error', {
        error_message: error.message
      });
      
      setSnackbarMessage('Failed to share results. Please try again.');
      setShowSnackbar(true);
    }
  }, [status, scores, globalRanking, futurePrediction]);

  // Handle retake assessment button press - memoized with useCallback
  const handleRetakeAssessment = useCallback(() => {
    // Track retake click
    Analytics.trackEvent('retake_assessment_click');
    
    if (hasActiveSubscription()) {
      // Show confirmation dialog
      setShowRetakeDialog(true);
    } else {
      // If no active subscription, navigate to subscription screen
      navigation.navigate('Subscription');
    }
  }, [hasActiveSubscription, navigation]);

  // Handle confirmation of retake assessment - memoized with useCallback
  const confirmRetakeAssessment = useCallback(() => {
    // Track retake confirmed
    Analytics.trackEvent('retake_assessment_confirmed');
    
    // Reset and navigate to questionnaire
    setShowRetakeDialog(false);
    
    // Use reset to clear the navigation stack and start fresh
    navigation.reset({
      index: 0,
      routes: [{ name: 'Questionnaire' }],
    });
  }, [navigation]);

  // Handle return to home button press - memoized with useCallback
  const handleReturnHome = useCallback(() => {
    navigation.navigate('Welcome');
  }, [navigation]);

  // Category scores for display, ensuring they're numeric - memoized with useMemo
  const categoryScores = useMemo(() => [
    { key: 'wealth', label: 'Wealth & Resources', score: parseInt(scores.categoryScores.wealth, 10) },
    { key: 'fitness', label: 'Physical Fitness', score: parseInt(scores.categoryScores.fitness, 10) },
    { key: 'power', label: 'Power & Influence', score: parseInt(scores.categoryScores.power, 10) },
    { key: 'intelligence', label: 'Intelligence', score: parseInt(scores.categoryScores.intelligence, 10) },
    { key: 'willpower', label: 'Willpower', score: parseInt(scores.categoryScores.willpower, 10) },
    { key: 'legacy', label: 'Legacy', score: parseInt(scores.categoryScores.legacy, 10) }
  ], [scores.categoryScores]);

  // Potential score (showing improvement potential) - memoized with useMemo
  const potentialScore = useMemo(() => 
    Math.min(parseInt(scores.overallScore, 10) + 15, 100), 
    [scores.overallScore]
  );

  // Handler for content size change - memoized with useCallback
  const handleContentSizeChange = useCallback((width, height) => {
    setContentHeight(height);
    
    // Enable scrolling if content height is greater than screen height
    setScrollEnabled(height > SCREEN_HEIGHT - 100);
    
    // Add a short delay to make sure the content is rendered
    // This helps with iOS scrolling issues
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.flashScrollIndicators();
      }
    }, 500);
  }, []);

  // Scroll to bottom indicator button handler - memoized with useCallback
  const scrollToBottom = useCallback(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, []);

  // If still loading, show a loading screen
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading and saving your results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Main content with proper scrolling */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        onContentSizeChange={handleContentSizeChange}
        scrollEnabled={scrollEnabled}
        scrollEventThrottle={16}
        bounces={true}
        alwaysBounceVertical={true}
        persistentScrollbar={true}
        indicatorStyle="black"
      >
        {/* Save indicator */}
        {isSaving && (
          <View style={styles.saveIndicator}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.saveIndicatorText}>Saving results...</Text>
          </View>
        )}
        
        {/* Main score display */}
        <View style={styles.mainScoreContainer}>
          <Text style={styles.resultsTitle}>Your Results</Text>
          
          <View style={styles.scoreCircleWrapper}>
            <ScoreCircle 
              score={parseInt(scores.overallScore, 10)}
              size={Platform.OS === 'ios' ? 130 : 180} // Smaller on iOS
              showProgress={false}
              strokeWidth={12}
            />
          </View>
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>STATUS</Text>
            <Text style={[
              styles.statusText,
              { color: getScoreColor(scores.overallScore) }
            ]}>
              {status}
            </Text>
          </View>
          
          {/* Saved badge - shows when results are saved */}
          {saveSuccess && (
            <View style={styles.savedBadge}>
              <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.highScore} />
              <Text style={styles.savedBadgeText}>Saved</Text>
            </View>
          )}
        </View>
        
        {/* Card components */}
        <View style={styles.cardContainer}>
          {/* Potential score */}
          <View style={styles.card}>
            <View style={styles.potentialHeader}>
              <Text style={styles.sectionTitle}>Potential</Text>
              <Text style={[
                styles.potentialValue,
                { color: getScoreColor(potentialScore) }
              ]}>
                {potentialScore}
              </Text>
            </View>
            <RatingBar 
              score={potentialScore}
              label="Your potential in 5 years"
              showValue={false}
              height={6}
            />
          </View>

          {/* Global ranking */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Global Ranking</Text>
            <View style={styles.rankingRow}>
              <View style={styles.rankingItem}>
                <Text style={styles.rankingValue}>
                  #{globalRanking.position.toLocaleString()}
                </Text>
                <Text style={styles.rankingLabel}>Position</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.rankingItem}>
                <Text style={[
                  styles.rankingValue, 
                  styles.percentileValue,
                  { color: getScoreColor(100 - globalRanking.percentile) }
                ]}>
                  Top {globalRanking.percentile}%
                </Text>
                <Text style={styles.rankingLabel}>Percentile</Text>
              </View>
            </View>
          </View>

          {/* Category scores */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            {categoryScores.map((category) => (
              <RatingBar
                key={category.key}
                label={category.label}
                score={category.score}
              />
            ))}
          </View>

          {/* Future prediction */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>10-Year Prediction</Text>
            <Text style={styles.predictionText}>{futurePrediction}</Text>
          </View>
          
          {/* Button container - moved inside ScrollView for iOS */}
          <View style={styles.buttonContainer}>
            <CustomButton
              mode="contained"
              onPress={handleRetakeAssessment}
              style={styles.button}
              icon="refresh"
            >
              Retake Assessment
            </CustomButton>
            <CustomButton
              mode="outlined"
              onPress={handleShare}
              style={styles.button}
              icon="share-variant"
            >
              Share Results
            </CustomButton>
            
            <CustomButton
              mode="text"
              onPress={handleReturnHome}
              style={styles.textButton}
            >
              Return Home
            </CustomButton>
          </View>
          
          {/* Extra padding at the bottom */}
          <View style={{ height: Platform.OS === 'ios' ? 80 : 40 }} />
        </View>
      </ScrollView>

      {/* Scroll indicator button - only shown on iOS if needed */}
      {Platform.OS === 'ios' && contentHeight > SCREEN_HEIGHT - 100 && (
        <TouchableOpacity style={styles.scrollIndicator} onPress={scrollToBottom}>
          <View style={styles.scrollIndicatorDot} />
          <View style={styles.scrollIndicatorDot} />
          <View style={styles.scrollIndicatorDot} />
        </TouchableOpacity>
      )}

      {/* Retake Assessment Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={showRetakeDialog}
          onDismiss={() => setShowRetakeDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Retake Assessment?</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Starting a new assessment will reset your progress. Your current results will still be saved in your history.
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <CustomButton
              mode="text"
              onPress={() => setShowRetakeDialog(false)}
            >
              Cancel
            </CustomButton>
            <CustomButton
              mode="contained"
              onPress={confirmRetakeAssessment}
            >
              Start New Assessment
            </CustomButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Snackbar for feedback messages */}
      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
        style={styles.snackbar}
        action={{
          label: 'OK',
          onPress: () => setShowSnackbar(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 16,
  },
  // Loading container
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text
  },
  // Save indicator
  saveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginBottom: 8,
  },
  saveIndicatorText: {
    marginLeft: 8,
    color: theme.colors.text,
    fontSize: 14
  },
  // Saved badge
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.highlight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
  savedBadgeText: {
    color: theme.colors.highScore,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4
  },
  // Main score section
  mainScoreContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 12 : 20
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: Platform.OS === 'ios' ? 8 : 16
  },
  scoreCircleWrapper: {
    marginVertical: Platform.OS === 'ios' ? 8 : 16
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 8
  },
  statusLabel: {
    fontSize: 12,
    color: theme.colors.subtext,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  // Card styles
  cardContainer: {
    width: '100%',
  },
  card: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2
      }
    })
  },
  potentialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  potentialValue: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16
  },
  rankingRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  rankingItem: {
    flex: 1,
    alignItems: 'center'
  },
  rankingValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4
  },
  percentileValue: {
    fontSize: 18
  },
  rankingLabel: {
    fontSize: 14,
    color: theme.colors.subtext
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
    marginHorizontal: 16
  },
  predictionText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic'
  },
  // Buttons
  buttonContainer: {
    width: '100%', 
    marginTop: 8,
    marginBottom: 16,
    gap: 8
  },
  button: {
    width: '100%',
    marginVertical: 4
  },
  textButton: {
    marginTop: 4
  },
  // Scroll indicator button (for iOS)
  scrollIndicator: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  scrollIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
    margin: 2
  },
  // Dialog
  dialog: {
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surface,
  },
  dialogTitle: {
    textAlign: 'center',
    fontSize: theme.typography.sizes.title3,
    color: theme.colors.text,
    fontWeight: '600'
  },
  dialogText: {
    textAlign: 'center',
    fontSize: theme.typography.sizes.body,
    color: theme.colors.subtext,
    lineHeight: 22
  },
  dialogActions: {
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.m
  },
  // Snackbar
  snackbar: {
    bottom: Platform.OS === 'ios' ? 20 : 0,
  }
});

export default React.memo(ResultsScreen);