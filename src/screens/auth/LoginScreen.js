import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '../../components/CustomButton';
import { theme } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import * as StoreConfig from '../../utils/MockStoreConfig';
import Analytics from '../../utils/Analytics';
import ErrorLogger from '../../utils/ErrorLogger';

const LoginScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Check if there's a pending subscription to process after login
  const { productId, redirectTo, params } = route.params || {};

  const { signIn, updateSubscription, hasActiveSubscription } = useAuth();

  // Track screen view when component mounts
  useEffect(() => {
    Analytics.trackScreenView('Login', { 
      has_product_id: !!productId,
      source: route.params?.source || 'direct'
    });
  }, [productId, route.params]);

  const navigateToQuestionnaire = () => {
    console.log('Navigating to Questionnaire from LoginScreen');
    
    // Reset navigation and go directly to Questionnaire
    navigation.reset({
      index: 0,
      routes: [{ name: 'Questionnaire' }]
    });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Track login attempt
      Analytics.trackEvent(Analytics.EVENTS.USER_LOGIN, {
        method: 'email',
        has_product_id: !!productId
      });
      
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        // Track login error
        Analytics.trackEvent(Analytics.EVENTS.ERROR, {
          action: 'login',
          error_type: 'auth_error',
          error_message: signInError.message
        });
        
        // Log error
        ErrorLogger.logError(signInError, 'LoginScreen', { email });
        
        setError(signInError.message || 'Failed to sign in');
        console.error('Login error:', signInError);
        setLoading(false);
        return;
      }
      
      // Track successful login
      Analytics.trackEvent(Analytics.EVENTS.USER_LOGIN, {
        method: 'email',
        success: true,
        has_product_id: !!productId
      });
      
      // Check if there's a pending subscription to process
      if (productId) {
        setProcessingPayment(true);
        
        try {
          // Track subscription purchase attempt
          Analytics.trackEvent(Analytics.EVENTS.SUBSCRIPTION_PURCHASE, {
            product_id: productId,
            status: 'processing',
            from_login: true
          });
          
          // Process the mock purchase
          const result = await StoreConfig.purchaseProduct(productId);
          
          if (result.success) {
            // Determine subscription type
            let subscriptionType = 'none';
            if (productId === StoreConfig.PRODUCT_IDS.ONE_DAY_ACCESS) {
              subscriptionType = 'one_day';
            } else if (productId === StoreConfig.PRODUCT_IDS.MONTHLY_ACCESS) {
              subscriptionType = 'monthly';
            }
            
            // Update subscription
            await updateSubscription(subscriptionType, result.purchase.expiryDate);
            
            // Track successful purchase
            Analytics.trackEvent(Analytics.EVENTS.SUBSCRIPTION_PURCHASE, {
              product_id: productId,
              subscription_type: subscriptionType,
              status: 'success',
              from_login: true
            });
            
            // Navigate directly to questionnaire after successful payment
            setTimeout(() => {
              navigateToQuestionnaire();
            }, 500);
          } else {
            throw new Error(result.error || 'Failed to process payment');
          }
        } catch (paymentError) {
          // Track payment error
          Analytics.trackEvent(Analytics.EVENTS.SUBSCRIPTION_PURCHASE, {
            product_id: productId,
            status: 'error',
            error_message: paymentError.message,
            from_login: true
          });
          
          // Log payment error
          ErrorLogger.logError(paymentError, 'LoginScreen.handlePayment', { 
            productId, email 
          });
          
          console.error('Payment error:', paymentError);
          Alert.alert(
            'Payment Error',
            'There was an issue processing your payment. You can try again later from your profile.',
            [
              { 
                text: 'OK', 
                onPress: () => {
                  // Check if user has active subscription despite payment error
                  // If yes, take them directly to questionnaire
                  if (hasActiveSubscription()) {
                    navigateToQuestionnaire();
                  } else {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Welcome' }],
                    });
                  }
                }
              }
            ]
          );
        } finally {
          setProcessingPayment(false);
        }
      } else {
        // No pending subscription, check if user has active subscription
        // and take them directly to the appropriate screen
        setTimeout(() => {
          if (hasActiveSubscription()) {
            // If they have an active subscription, take them to the questionnaire
            navigateToQuestionnaire();
          } else {
            // Otherwise, take them to the subscription screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'Subscription' }],
            });
          }
        }, 500);
      }
    } catch (err) {
      // Track unexpected error
      Analytics.trackEvent(Analytics.EVENTS.ERROR, {
        action: 'login',
        error_type: 'unexpected',
        error_message: err.message
      });
      
      // Log error
      ErrorLogger.logError(err, 'LoginScreen', { email });
      
      setError('An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Welcome Back</Text>
            <Text style={styles.headerSubtitle}>
              Sign in to continue your assessment journey
            </Text>
          </View>

          <View style={styles.formContainer}>
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {productId && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  Sign in to complete your subscription purchase
                </Text>
              </View>
            )}

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="outlined"
              autoCapitalize="none"
              keyboardType="email-address"
              outlineStyle={styles.inputOutline}
              theme={{ colors: { primary: theme.colors.primary } }}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              mode="outlined"
              secureTextEntry={secureTextEntry}
              outlineStyle={styles.inputOutline}
              theme={{ colors: { primary: theme.colors.primary } }}
              right={
                <TextInput.Icon
                  icon={secureTextEntry ? 'eye-off' : 'eye'}
                  onPress={toggleSecureEntry}
                  color={theme.colors.subtext}
                />
              }
            />

            <CustomButton
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              loading={loading || processingPayment}
              disabled={loading || processingPayment}
            >
              {processingPayment ? 'Processing Payment...' : 'Sign In'}
            </CustomButton>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity 
                onPress={() => {
                  // Track signup button click
                  Analytics.trackEvent('signup_button_click', {
                    from_screen: 'login',
                    has_product_id: !!productId
                  });
                  
                  if (productId) {
                    // If coming from subscription, pass the product ID to registration
                    navigation.navigate('Register', { productId });
                  } else {
                    navigation.navigate('Register');
                  }
                }}
              >
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              onPress={() => {
                // Track forgot password click
                Analytics.trackEvent('forgot_password_click');
                navigation.navigate('ForgotPassword');
              }}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>
                Forgot password?
              </Text>
            </TouchableOpacity>
            
            <CustomButton
              mode="text"
              onPress={() => navigation.navigate('Welcome')}
              style={styles.backButton}
            >
              Back to Welcome
            </CustomButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.xl,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl * 1.5,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.title1,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.subhead,
    color: theme.colors.subtext,
    textAlign: 'center',
    maxWidth: '80%',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  input: {
    marginBottom: theme.spacing.l,
    backgroundColor: theme.colors.background,
  },
  inputOutline: {
    borderRadius: theme.roundness,
  },
  errorContainer: {
    backgroundColor: theme.colors.lowScore + '20', // 20% opacity
    padding: theme.spacing.m,
    borderRadius: theme.roundness,
    marginBottom: theme.spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.lowScore,
  },
  errorText: {
    color: theme.colors.lowScore,
    fontSize: theme.typography.sizes.footnote,
  },
  infoContainer: {
    backgroundColor: theme.colors.primary + '10', // 10% opacity
    padding: theme.spacing.m,
    borderRadius: theme.roundness,
    marginBottom: theme.spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  infoText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.footnote,
    textAlign: 'center',
  },
  button: {
    marginTop: theme.spacing.m,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  signupText: {
    color: theme.colors.subtext,
  },
  signupLink: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.m,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.footnote,
  },
  backButton: {
    marginTop: theme.spacing.l,
  },
});

export default LoginScreen;