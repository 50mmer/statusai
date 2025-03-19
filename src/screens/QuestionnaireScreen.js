// src/screens/QuestionnaireScreen.js (Updated with React.memo, useMemo, and useCallback)
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  BackHandler, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Text, Portal, Dialog } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import CustomPicker from '../components/CustomPicker';
import { useQuestionnaire, QUESTION_OPTIONS } from '../hooks/useQuestionnaire';
import { theme } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import DebugUtils from '../utils/DebugUtils';

// Question labels moved outside component for better performance
const QUESTION_LABELS = {
  annualIncome: 'Annual Income',
  netWorth: 'Net Worth',
  lifestyle: 'Lifestyle Quality',
  height: 'Height',
  bodyType: 'Body Type',
  strengthLevel: 'Strength Level',
  leadershipRole: 'Leadership Role',
  socialReach: 'Social Media/Public Reach',
  networkStrength: 'Network Strength',
  problemSolving: 'Problem-Solving Ability',
  skillLevel: 'Skill Level',
  achievements: 'Notable Achievements',
  discipline: 'Self-Rated Discipline',
  productiveHours: 'Daily Productive Hours',
  stressResilience: 'Stress Resilience',
  relationshipStatus: 'Relationship Status',
  attractiveness: 'Self-Rated Attractiveness',
  legacy: 'Children/Legacy'
};

// Function to get question label - memoized outside component
const getQuestionLabel = (field) => QUESTION_LABELS[field] || field;

// Category descriptions - moved outside component
const CATEGORY_DESCRIPTIONS = {
  1: "These questions help assess your financial standing and quality of life relative to global averages.",
  2: "Physical attributes impact status perception across cultures. Answer honestly for accurate results.",
  3: "Your social influence and leadership roles contribute significantly to your global ranking.",
  4: "These metrics evaluate your cognitive abilities and acquired expertise against global averages.",
  5: "Mental resilience and consistency are key factors in determining long-term potential.",
  6: "This section evaluates your attractiveness and the lasting impact you'll have on future generations."
};

// Category titles - moved outside component
const CATEGORY_TITLES = {
  1: "Wealth & Resources",
  2: "Physical Fitness",
  3: "Power & Influence",
  4: "Intelligence & Mastery",
  5: "Willpower & Mental Toughness",
  6: "Legacy & Success"
};

const QuestionnaireScreen = ({ navigation }) => {
  const {
    currentCategory,
    answers,
    updateAnswer,
    validateCategory,
    getCategoryTitle,
    moveToNextCategory,
    moveToPreviousCategory,
    getCategoryFields
  } = useQuestionnaire();

  const [showExitDialog, setShowExitDialog] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const { user, hasActiveSubscription } = useAuth();

  // Check if user has access to the questionnaire
  useEffect(() => {
    const checkAccess = async () => {
      setCheckingAccess(true);
      console.log('QuestionnaireScreen - Checking access');
      console.log('User logged in:', !!user);
      console.log('Has active subscription:', hasActiveSubscription());
      
      // Debug: Log current auth state
      await DebugUtils.logAuthState('QuestionnaireScreen');
      
      // Check if user is logged in and has active subscription
      if (!user) {
        console.log('User not logged in, redirecting to Subscription');
        // If not logged in, redirect to subscription screen
        navigation.replace('Subscription');
        return;
      }
      
      // Check if user has active subscription
      if (!hasActiveSubscription()) {
        console.log('No active subscription, redirecting to Subscription');
        // If no subscription, redirect to subscription
        navigation.replace('Subscription');
        return;
      }
      
      // User has access
      console.log('User has access to questionnaire');
      setCheckingAccess(false);
    };
    
    checkAccess();
  }, [user, hasActiveSubscription, navigation]);

  // Handle hardware back button - optimized with useCallback
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (currentCategory === 1) {
          setShowExitDialog(true);
          return true;
        }
        moveToPreviousCategory();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [currentCategory, moveToPreviousCategory])
  );

  // Handle next button press - optimized with useCallback
  const handleNext = useCallback(() => {
    // Validate current category
    if (!validateCategory(currentCategory)) {
      if (Platform.OS === 'ios') {
        // Use Alert for iOS
        Alert.alert(
          'Incomplete Answers',
          'Please complete all fields before proceeding.',
          [{ text: 'OK' }]
        );
      }
      return;
    }
    
    const isComplete = moveToNextCategory();
    if (isComplete) {
      navigation.navigate('Calculation', { answers });
    }
  }, [moveToNextCategory, navigation, answers, validateCategory, currentCategory]);

  // Handle back button press - optimized with useCallback
  const handleBack = useCallback(() => {
    const shouldExit = moveToPreviousCategory();
    if (shouldExit) {
      setShowExitDialog(true);
    }
  }, [moveToPreviousCategory]);

  // Handle exit dialog actions - optimized with useCallback
  const handleExitConfirm = useCallback(() => {
    setShowExitDialog(false);
    navigation.navigate('Welcome');
  }, [navigation]);

  const handleExitCancel = useCallback(() => {
    setShowExitDialog(false);
  }, []);

  // Get current fields to display - memoized for optimization
  const currentFields = useMemo(() => 
    getCategoryFields(currentCategory), 
    [getCategoryFields, currentCategory]
  );

  // Get category description - memoized for optimization
  const categoryDescription = useMemo(() => 
    CATEGORY_DESCRIPTIONS[currentCategory] || "",
    [currentCategory]
  );

  // Get category title - memoized for optimization
  const categoryTitle = useMemo(() =>
    CATEGORY_TITLES[currentCategory] || "",
    [currentCategory]
  );

  // Calculate progress percentage - memoized for optimization
  const progressPercentage = useMemo(() => 
    ((currentCategory - 1) * 100) / 5,
    [currentCategory]
  );

  // Memoize the field update handler to prevent recreating it on each render
  const handleFieldUpdate = useCallback((field, value) => {
    updateAnswer(field, value);
  }, [updateAnswer]);

  // If still checking access or user doesn't have access, show loading
  if (checkingAccess) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Checking subscription status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.surface}>
        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${progressPercentage}%`, backgroundColor: theme.colors.midScore }
            ]}
          />
        </View>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.categoryCount}>
            CATEGORY {currentCategory} OF 6
          </Text>
          <Text style={styles.categoryTitle}>
            {categoryTitle}
          </Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>
              {categoryDescription}
            </Text>
          </View>
          
          <View style={styles.questionsContainer}>
            {currentFields.map((field) => (
              <View key={field} style={styles.questionItem}>
                <CustomPicker
                  label={getQuestionLabel(field)}
                  value={answers[field]}
                  onValueChange={(value) => handleFieldUpdate(field, value)}
                  items={QUESTION_OPTIONS[field]}
                  placeholder={`Select ${getQuestionLabel(field)}`}
                />
              </View>
            ))}
          </View>
          
          <View style={styles.buttonRow}>
            <CustomButton
              mode="outlined"
              onPress={handleBack}
              style={styles.backButton}
              labelStyle={styles.buttonLabel}
              icon="arrow-left"
            >
              Back
            </CustomButton>
            <CustomButton
              mode="contained"
              onPress={handleNext}
              style={styles.nextButton}
              labelStyle={styles.buttonLabel}
              icon={currentCategory === 6 ? "check" : "arrow-right"}
            >
              {currentCategory === 6 ? 'Calculate' : 'Next'}
            </CustomButton>
          </View>
          
          {/* Extra padding at the bottom */}
          <View style={{height: 40}} />
        </ScrollView>

        {/* Exit confirmation dialog */}
        <Portal>
          <Dialog
            visible={showExitDialog}
            onDismiss={handleExitCancel}
            style={styles.dialog}
          >
            <Dialog.Title style={styles.dialogTitle}>Exit Questionnaire?</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogContent}>
                Your progress will not be saved. Are you sure you want to exit?
              </Text>
            </Dialog.Content>
            <Dialog.Actions style={styles.dialogActions}>
              <CustomButton
                mode="text"
                onPress={handleExitCancel}
              >
                Cancel
              </CustomButton>
              <CustomButton
                mode="contained"
                onPress={handleExitConfirm}
              >
                Exit
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
  progressBarContainer: {
    height: 4,
    width: '100%',
    backgroundColor: theme.colors.disabled
  },
  progressBar: {
    height: '100%'
  },
  header: {
    padding: theme.spacing.xl,
    alignItems: 'center'
  },
  categoryCount: {
    fontSize: theme.typography.sizes.footnote,
    color: theme.colors.subtext,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: theme.spacing.s,
    textAlign: 'center'
  },
  categoryTitle: {
    fontSize: theme.typography.sizes.title1,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl
  },
  descriptionCard: {
    padding: theme.spacing.l,
    marginBottom: theme.spacing.xl,
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surface,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    } : {
      elevation: 2
    })
  },
  descriptionText: {
    fontSize: theme.typography.sizes.subhead,
    lineHeight: 22,
    color: theme.colors.subtext,
    textAlign: 'center'
  },
  questionsContainer: {
    marginBottom: theme.spacing.xl
  },
  questionItem: {
    marginBottom: theme.spacing.m
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.l
  },
  backButton: {
    flex: 1,
    marginRight: theme.spacing.m
  },
  nextButton: {
    flex: 1,
    marginLeft: theme.spacing.m
  },
  buttonLabel: {
    fontWeight: '600'
  },
  dialog: {
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surface
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
  dialogActions: {
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.m
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
  }
});

// Wrap component with React.memo to prevent unnecessary re-renders
export default React.memo(QuestionnaireScreen);