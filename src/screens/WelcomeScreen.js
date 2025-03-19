import React from 'react';
import { 
  View, 
  StyleSheet, 
  BackHandler, 
  Platform, 
  ScrollView,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CustomButton from '../components/CustomButton';
import ScoreCircle from '../components/ScoreCircle';
import { theme } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { getTimeRemaining } from '../config/subscriptionPlans';

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const { 
    user, 
    hasActiveSubscription, 
    subscriptionExpiryDate
  } = useAuth();

  // Handle hardware back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  // Example scores for display - using numeric values
  const exampleScores = [
    { score: 82, label: 'Wealth' },
    { score: 45, label: 'Fitness' },
    { score: 76, label: 'Power' },
    { score: 28, label: 'Legacy' }
  ];

  // Handler for starting assessment
  const handleStartAssessment = () => {
    if (user && hasActiveSubscription()) {
      // User is logged in and has active subscription
      navigation.navigate('Questionnaire');
    } else {
      // User is not logged in or doesn't have subscription
      navigation.navigate('Subscription');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header with logo and account button */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.logoText}>STATUS AI</Text>
          
          {user && hasActiveSubscription() && (
            <TouchableOpacity 
              style={styles.subscriptionBadge}
              onPress={() => navigation.navigate('Subscription')}
            >
              <Text style={styles.subscriptionText}>
                {getTimeRemaining(subscriptionExpiryDate)}
              </Text>
            </TouchableOpacity>
          )}

          {user ? (
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <MaterialCommunityIcons 
                name="account-circle" 
                size={28} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('Login')}
            >
              <MaterialCommunityIcons 
                name="login" 
                size={28} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={Platform.OS !== 'web'}
        bounces={true}
      >
        <View style={styles.content}>
          <View style={styles.topSection}>            
            <Text style={styles.subtitle}>
              Where do you rank amongst men globally?
            </Text>
            
            <View style={styles.circlesContainer}>
              {exampleScores.map((item, index) => (
                <View key={index} style={styles.miniCircleContainer}>
                  <ScoreCircle
                    score={item.score}
                    size={Math.min(60, SCREEN_WIDTH / 8)} // Scale for different screen sizes
                    showProgress={false}
                  />
                  <Text style={styles.miniCircleLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <View style={styles.infoBullet} />
              <Text style={styles.infoText}>Compare against 3.97 billion men</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoBullet} />
              <Text style={styles.infoText}>Get your exact percentile ranking</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoBullet} />
              <Text style={styles.infoText}>Receive a 10-year status prediction</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              onPress={handleStartAssessment}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              mode="contained"
            >
              {user && hasActiveSubscription() ? 'Start Assessment' : 'Get Access'}
            </CustomButton>

            {!user && (
              <CustomButton
                onPress={() => navigation.navigate('Login')}
                style={styles.secondaryButton}
                labelStyle={styles.secondaryButtonLabel}
                mode="outlined"
              >
                Sign In
              </CustomButton>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.m,
    paddingBottom: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    letterSpacing: 1,
    flex: 1,
    textAlign: 'center',
  },
  profileButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscriptionBadge: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  subscriptionText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: theme.spacing.xl,
    paddingBottom: Math.max(50, SCREEN_HEIGHT * 0.05),
  },
  topSection: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 20 : theme.spacing.xl,
  },
  subtitle: {
    fontSize: theme.typography.sizes.title3,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 28,
    maxWidth: '90%',
  },
  circlesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    marginTop: theme.spacing.l,
  },
  miniCircleContainer: {
    alignItems: 'center',
    margin: theme.spacing.m,
    // Add responsive margin based on screen size
    marginHorizontal: Math.max(theme.spacing.m, SCREEN_WIDTH * 0.02),
  },
  miniCircleLabel: {
    fontSize: theme.typography.sizes.footnote,
    color: theme.colors.subtext,
    marginTop: theme.spacing.xs,
    fontWeight: '500',
  },
  infoContainer: {
    marginVertical: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  infoBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.m,
  },
  infoText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text,
    fontWeight: '400',
    flex: 1,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: theme.spacing.m,
  },
  button: {
    width: '100%',
    maxWidth: 320,
  },
  buttonLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    maxWidth: 320,
    marginTop: theme.spacing.m,
  },
  secondaryButtonLabel: {
    fontSize: theme.typography.sizes.body,
  },
});

export default WelcomeScreen;