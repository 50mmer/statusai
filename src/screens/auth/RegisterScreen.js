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
import { Text, TextInput, Checkbox } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '../../components/CustomButton';
import { theme } from '../../theme';
import { useAuth, SUBSCRIPTION_TIERS } from '../../contexts/AuthContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as StoreConfig from '../../utils/MockStoreConfig';
import { SUBSCRIPTION_PLANS } from '../../config/subscriptionPlans';
import Analytics from '../../utils/Analytics';
import ErrorLogger from '../../utils/ErrorLogger';

const RegisterScreen = ({ navigation, route }) => {
  // Get the selected plan from the route params
  const { planSelected, productId } = route.params || { planSelected: SUBSCRIPTION_TIERS.NONE };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [planDetails, setPlanDetails] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  
  const { signUp, updateSubscription } = useAuth();

  // Track screen view when component mounts
  useEffect(() => {
    Analytics.trackScreenView('Register', { 
      has_product_id: !!productId,
      source: route.params?.source || 'direct'
    });
  }, [productId, route.params]);

  // Load plan details when component mounts
  useEffect(() => {
    const getPlanDetails = async () => {
      if (productId) {
        try {
          // Get product details
          await StoreConfig.initConnection();
          const products = await StoreConfig.getProducts();
          const selectedProduct = products.find(p => p.productId === productId);
          
          if (selectedProduct) {
            setPlanDetails(selectedProduct);
          }
        } catch (error) {
          // Log error
          ErrorLogger.logError(error, 'RegisterScreen.getPlanDetails');
          console.error('Error getting plan details:', error);
        }
      }
    };
    
    getPlanDetails();
  }, [productId]);

  const navigateToQuestionnaire = () => {
    console.log('Navigating to Questionnaire');
    
    // Reset navigation and go directly to Questionnaire
    navigation.reset({
      index: 0,
      routes: [{ name: 'Questionnaire' }]
    });
  };

  const handleRegister = async () => {
    // Basic validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!acceptedTerms || !acceptedPrivacy) {
      setError('You must accept the Terms of Service and Privacy Policy to continue');
      return;
    }

    if (!productId) {
      setError('Please select a subscription plan first');
      navigation.navigate('Subscription');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Track registration attempt
      Analytics.trackEvent(Analytics.EVENTS.USER_SIGNUP, {
        method: 'email',
        has_product_id: !!productId
      });
      
      // First, create the user account
      const { data, error: signupError } = await signUp(email, password);
      
      if (signupError) {
        // Track registration error
        Analytics.trackEvent(Analytics.EVENTS.ERROR, {
          action: 'signup',
          error_type: 'auth_error',
          error_message: signupError.message
        });
        
        // Log error
        ErrorLogger.logError(signupError, 'RegisterScreen', { email });
        
        throw signupError;
      }
      
      // Track successful registration
      Analytics.trackEvent(Analytics.EVENTS.USER_SIGNUP, {
        method: 'email',
        success: true,
        has_product_id: !!productId
      });
      
      // Set user ID for analytics
      if (data && data.user) {
        Analytics.setUserId(data.user.id);
      }

      // If a plan was selected, process payment
      if (productId) {
        setProcessingPayment(true);
        
        try {
          // Track subscription purchase attempt
          Analytics.trackEvent(Analytics.EVENTS.SUBSCRIPTION_PURCHASE, {
            product_id: productId,
            status: 'processing',
            from_signup: true
          });
          
          // Process the mock purchase
          const result = await StoreConfig.purchaseProduct(productId);
          
          if (result.success) {
            // Determine subscription type
            let subscriptionType = SUBSCRIPTION_TIERS.NONE;
            if (productId === StoreConfig.PRODUCT_IDS.ONE_DAY_ACCESS) {
              subscriptionType = SUBSCRIPTION_TIERS.ONE_DAY;
            } else if (productId === StoreConfig.PRODUCT_IDS.MONTHLY_ACCESS) {
              subscriptionType = SUBSCRIPTION_TIERS.MONTHLY;
            }
            
            // Update subscription information with expiry date
            await updateSubscription(subscriptionType, result.purchase.expiryDate);
            
            // Track successful purchase
            Analytics.trackEvent(Analytics.EVENTS.SUBSCRIPTION_PURCHASE, {
              product_id: productId,
              subscription_type: subscriptionType,
              status: 'success',
              from_signup: true
            });
            
            // Clear states before navigation
            setProcessingPayment(false);
            setLoading(false);
            
            // Alert the user of success and then navigate
            Alert.alert(
              'Success!',
              'Your account has been created and subscription activated.',
              [
                {
                  text: 'Start Assessment',
                  onPress: navigateToQuestionnaire
                }
              ],
              { cancelable: false }
            );
            
            return;
          } else {
            throw new Error(result.error || 'Failed to process payment');
          }
        } catch (paymentError) {
          // Track payment error
          Analytics.trackEvent(Analytics.EVENTS.SUBSCRIPTION_PURCHASE, {
            product_id: productId,
            status: 'error',
            error_message: paymentError.message,
            from_signup: true
          });
          
          // Log payment error
          ErrorLogger.logError(paymentError, 'RegisterScreen.handlePayment', { 
            productId, email 
          });
          
          console.error('Payment error:', paymentError);
          Alert.alert(
            'Payment Error',
            'There was an issue processing your payment. Please try again later from your profile.',
            [
              { 
                text: 'OK', 
                onPress: () => navigation.replace('Welcome')
              }
            ]
          );
        } finally {
          if (processingPayment) {
            setProcessingPayment(false);
          }
        }
      } else {
        // Navigate directly to welcome if no payment needed (should not happen with revised flow)
        navigation.replace('Welcome');
      }
      
    } catch (err) {
      // Track unexpected error
      Analytics.trackEvent(Analytics.EVENTS.ERROR, {
        action: 'signup',
        error_type: 'unexpected',
        error_message: err.message
      });
      
      // Log error
      ErrorLogger.logError(err, 'RegisterScreen', { email });
      
      setError(err.message || 'An unexpected error occurred');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };
  
  // Get plan name based on subscription tier
  const getPlanName = () => {
    if (planSelected === SUBSCRIPTION_TIERS.ONE_DAY) {
      return 'One-Day Access';
    } else if (planSelected === SUBSCRIPTION_TIERS.MONTHLY) {
      return 'Monthly Access';
    } else {
      return 'No plan selected';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>
              Sign up to access your assessment
            </Text>
          </View>

          <View style={styles.formContainer}>
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {productId && (
              <View style={styles.planSelectedContainer}>
                <Text style={styles.planSelectedLabel}>Selected Plan:</Text>
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>
                    {getPlanName()}
                  </Text>
                </View>
              </View>
            )}
            
            {planDetails && (
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Price:</Text>
                <Text style={styles.priceValue}>{planDetails.price}</Text>
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

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              mode="outlined"
              secureTextEntry={secureTextEntry}
              outlineStyle={styles.inputOutline}
              theme={{ colors: { primary: theme.colors.primary } }}
            />

            {/* Terms and Privacy checkboxes */}
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={acceptedTerms ? 'checked' : 'unchecked'}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
                color={theme.colors.primary}
              />
              <View style={styles.checkboxTextContainer}>
                <Text style={styles.checkboxText}>
                  I accept the 
                </Text>
                <TouchableOpacity onPress={() => {
                  Analytics.trackEvent('terms_link_click', { from: 'register' });
                  navigation.navigate('TermsOfService');
                }}>
                  <Text style={styles.checkboxLink}>Terms of Service</Text>
                </TouchableOpacity>
                <Text style={styles.checkboxText}> and </Text>
                <TouchableOpacity onPress={() => {
                  Analytics.trackEvent('privacy_link_click', { from: 'register' });
                  navigation.navigate('PrivacyPolicy');
                }}>
                  <Text style={styles.checkboxLink}>Privacy Policy</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.checkboxContainer}>
              <Checkbox
                status={acceptedPrivacy ? 'checked' : 'unchecked'}
                onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
                color={theme.colors.primary}
              />
              <View style={styles.checkboxTextContainer}>
                <Text style={styles.checkboxText}>
                  I understand that my subscription will automatically renew and I have read the 
                </Text>
                <TouchableOpacity onPress={() => {
                  Analytics.trackEvent('subscription_terms_link_click', { from: 'register' });
                  navigation.navigate('SubscriptionTerms');
                }}>
                  <Text style={styles.checkboxLink}>Subscription Terms</Text>
                </TouchableOpacity>
              </View>
            </View>

            <CustomButton
              mode="contained"
              onPress={handleRegister}
              style={styles.button}
              loading={loading || processingPayment}
              disabled={loading || processingPayment}
            >
              {processingPayment ? 'Processing Payment...' : 'Create Account & Pay'}
            </CustomButton>

            <View style={styles.secureContainer}>
              <MaterialCommunityIcons
                name="shield-check"
                size={18}
                color={theme.colors.subtext}
              />
              <Text style={styles.secureText}>Your data is securely stored</Text>
            </View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => {
                  Analytics.trackEvent('login_link_click', { from: 'register' });
                  if (productId) {
                    navigation.navigate('Login', { productId });
                  } else {
                    navigation.navigate('Login');
                  }
                }}
              >
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
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
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
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
  planSelectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.m,
  },
  planSelectedLabel: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text,
    marginRight: theme.spacing.s,
  },
  planBadge: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    borderRadius: 16,
  },
  planBadgeText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: theme.typography.sizes.footnote,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  priceLabel: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text,
    marginRight: theme.spacing.s,
  },
  priceValue: {
    fontSize: theme.typography.sizes.body,
    fontWeight: 'bold',
    color: theme.colors.primary,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.m,
  },
  checkboxTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: theme.spacing.s,
  },
  checkboxText: {
    fontSize: theme.typography.sizes.footnote,
    color: theme.colors.subtext,
  },
  checkboxLink: {
    fontSize: theme.typography.sizes.footnote,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  button: {
    marginVertical: theme.spacing.m,
  },
  secureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.m,
  },
  secureText: {
    color: theme.colors.subtext,
    fontSize: theme.typography.sizes.footnote,
    marginLeft: theme.spacing.s,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.l,
  },
  loginText: {
    color: theme.colors.subtext,
  },
  loginLink: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'center',
    marginTop: theme.spacing.l,
    padding: theme.spacing.m,
  },
  backText: {
    color: theme.colors.subtext,
    fontSize: theme.typography.sizes.body,
  },
});

export default RegisterScreen;