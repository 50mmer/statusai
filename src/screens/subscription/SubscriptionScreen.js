import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Text, Surface, Portal, Dialog } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '../../components/CustomButton';
import { theme } from '../../theme';
import { useAuth, SUBSCRIPTION_TIERS } from '../../contexts/AuthContext';
import * as StoreConfig from '../../utils/MockStoreConfig';
import { SUBSCRIPTION_PLANS, getTimeRemaining } from '../../config/subscriptionPlans';

const SubscriptionScreen = ({ navigation, route }) => {
  const { updateSubscription, subscription, subscriptionExpiryDate, hasActiveSubscription, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [products, setProducts] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Check if we need to redirect after subscription
  const { redirectTo, params } = route.params || {};

  console.log('SubscriptionScreen - Current user:', user?.email);
  console.log('SubscriptionScreen - Has active subscription:', hasActiveSubscription());
  console.log('SubscriptionScreen - Route params:', route.params);

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        // Initialize mock store
        await StoreConfig.initConnection();
        
        // Get product details
        const storeProducts = await StoreConfig.getProducts();
        setProducts(storeProducts);
        
        setLoading(false);
      } catch (error) {
        console.error('Store initialization error:', error);
        setLoading(false);
        Alert.alert(
          'Error', 
          'There was an error loading payment options. Please try again.'
        );
      }
    };
    
    // If we have an active subscription, check time remaining
    if (subscriptionExpiryDate) {
      setTimeRemaining(getTimeRemaining(subscriptionExpiryDate));
    }
    
    loadProducts();
    
    // Clean up
    return () => {
      StoreConfig.endConnection();
    };
  }, [subscriptionExpiryDate]);

  const navigateToQuestionnaire = () => {
    console.log('Navigating to Questionnaire from SubscriptionScreen');
    
    // Use reset to clear the navigation stack
    navigation.reset({
      index: 0,
      routes: [{ name: 'Questionnaire' }]
    });
  };

  const handleContinue = () => {
    if (!selectedPlan) {
      Alert.alert('Selection Required', 'Please select a plan to continue.');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Processing subscription with plan:', selectedPlan);
      
      // Determine subscription type based on selected plan
      let subscriptionType = SUBSCRIPTION_TIERS.NONE;
      
      if (selectedPlan === StoreConfig.PRODUCT_IDS.ONE_DAY_ACCESS) {
        subscriptionType = SUBSCRIPTION_TIERS.ONE_DAY;
      } else if (selectedPlan === StoreConfig.PRODUCT_IDS.MONTHLY_ACCESS) {
        subscriptionType = SUBSCRIPTION_TIERS.MONTHLY;
      }
      
      // Store selected plan in AsyncStorage for later reference during registration
      AsyncStorage.setItem('@selected_plan', selectedPlan);
      AsyncStorage.setItem('@selected_plan_type', subscriptionType);
      
      // If user is already logged in, process payment and update subscription
      if (user) {
        handlePurchase(selectedPlan, subscriptionType);
      } else {
        console.log('User not logged in, redirecting to Register with plan:', subscriptionType);
        // Otherwise, direct to registration with the selected plan
        navigation.navigate('Register', { 
          planSelected: subscriptionType,
          productId: selectedPlan
        });
      }
    } catch (err) {
      setError(err.message || 'An error occurred while processing your selection');
      Alert.alert('Error', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Called after successful login/registration or directly if already logged in
  const handlePurchase = async (productId, subscriptionType) => {
    setLoading(true);
    try {
      console.log('Processing purchase for product:', productId);
      
      // Process the mock purchase
      const result = await StoreConfig.purchaseProduct(productId);
      
      if (result.success) {
        console.log('Purchase successful, updating subscription');
        
        // Update subscription information
        await updateSubscription(subscriptionType, result.purchase.expiryDate);
        
        // Update time remaining
        setTimeRemaining(getTimeRemaining(result.purchase.expiryDate));
        
        // Show success message
        setShowSuccessDialog(true);
      } else {
        throw new Error(result.error || 'Failed to process payment');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while processing your payment');
      Alert.alert('Subscription Error', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessContinue = () => {
    setShowSuccessDialog(false);
    
    // Navigate to the redirectTo screen if provided
    if (redirectTo) {
      console.log('Navigating to redirectTo:', redirectTo);
      navigation.navigate(redirectTo, params || {});
    } else {
      console.log('No redirectTo provided, navigating to Questionnaire');
      navigateToQuestionnaire();
    }
  };

  // If user already has an active subscription, show management interface
  if (user && hasActiveSubscription()) {
    console.log('Showing active subscription management UI');
    
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Subscription Management</Text>
            <Text style={styles.headerSubtitle}>
              Your current subscription status
            </Text>
          </View>
          
          {/* Current subscription status */}
          <View style={styles.currentSubscriptionContainer}>
            <Text style={styles.currentSubscriptionTitle}>Current Subscription</Text>
            <View style={styles.subscriptionStatusCard}>
              <View style={styles.subscriptionStatusRow}>
                <Text style={styles.subscriptionType}>
                  {subscription === SUBSCRIPTION_TIERS.ONE_DAY ? 'One-Day Access' : 'Monthly Access'}
                </Text>
                <View style={styles.subscriptionBadge}>
                  <Text style={styles.subscriptionBadgeText}>ACTIVE</Text>
                </View>
              </View>
              <Text style={styles.timeRemaining}>{timeRemaining}</Text>
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <CustomButton
              mode="contained"
              onPress={navigateToQuestionnaire}
              style={styles.continueButton}
            >
              Continue to Assessment
            </CustomButton>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  // Otherwise show subscription options
  console.log('Showing subscription options UI');
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Subscription</Text>
          <Text style={styles.headerSubtitle}>
            Choose your access plan
          </Text>
        </View>

        {/* Subscription plans */}
        <View style={styles.plansContainer}>
          {products.map((product) => {
            const isOneDay = product.productId === StoreConfig.PRODUCT_IDS.ONE_DAY_ACCESS;
            const plan = isOneDay ? SUBSCRIPTION_PLANS.ONE_DAY : SUBSCRIPTION_PLANS.MONTHLY;
            
            return (
              <TouchableOpacity
                key={product.productId}
                style={[
                  styles.planCard,
                  selectedPlan === product.productId && styles.selectedPlan,
                  !isOneDay && styles.popularPlan
                ]}
                onPress={() => setSelectedPlan(product.productId)}
                activeOpacity={0.8}
              >
                {!isOneDay && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </View>
                )}
                
                <Text style={styles.planTitle}>{product.title}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.planPrice}>{product.price}</Text>
                  <Text style={styles.planType}>{plan.duration}</Text>
                </View>

                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={20}
                        color={theme.colors.primary}
                        style={styles.featureIcon}
                      />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {selectedPlan === product.productId && (
                  <View style={styles.selectedIndicator}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={24}
                      color={theme.colors.highScore}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            mode="contained"
            onPress={handleContinue}
            style={styles.continueButton}
            loading={loading}
            disabled={!selectedPlan || loading}
          >
            {user ? 'Purchase Access' : 'Continue to Register'}
          </CustomButton>

          {!user && (
            <CustomButton
              mode="outlined"
              onPress={() => navigation.navigate('Login', { productId: selectedPlan })}
              style={styles.signInButton}
              disabled={!selectedPlan || loading}
            >
              Already have an account? Sign In
            </CustomButton>
          )}

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.secureContainer}>
          <MaterialCommunityIcons
            name="shield-check"
            size={18}
            color={theme.colors.subtext}
          />
          <Text style={styles.secureText}>Secure payment processing</Text>
        </View>

        {/* Success Dialog */}
        <Portal>
          <Dialog
            visible={showSuccessDialog}
            onDismiss={handleSuccessContinue}
            style={styles.dialog}
          >
            <View style={styles.successIconContainer}>
              <MaterialCommunityIcons
                name="check-circle"
                size={60}
                color={theme.colors.highScore}
              />
            </View>
            <Dialog.Title style={styles.dialogTitle}>
              Purchase Successful!
            </Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogContent}>
                Thank you for your purchase. You now have access to all features!
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <CustomButton
                mode="contained"
                onPress={handleSuccessContinue}
              >
                Continue
              </CustomButton>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
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
    maxWidth: '90%',
  },
  currentSubscriptionContainer: {
    marginBottom: theme.spacing.xl,
  },
  currentSubscriptionTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  subscriptionStatusCard: {
    backgroundColor: theme.colors.highlight,
    borderRadius: theme.roundness,
    padding: theme.spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.highScore,
  },
  subscriptionStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subscriptionType: {
    fontSize: theme.typography.sizes.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
  subscriptionBadge: {
    backgroundColor: theme.colors.highScore + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subscriptionBadgeText: {
    color: theme.colors.highScore,
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeRemaining: {
    fontSize: theme.typography.sizes.footnote,
    color: theme.colors.subtext,
  },
  plansContainer: {
    width: '100%',
  },
  planCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.xl,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  selectedPlan: {
    borderColor: theme.colors.primary,
  },
  popularPlan: {
    borderColor: theme.colors.highScore,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 16,
    backgroundColor: theme.colors.highScore,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    borderRadius: 16,
    zIndex: 1,
  },
  popularText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  planTitle: {
    fontSize: theme.typography.sizes.title3,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.s,
  },
  priceContainer: {
    marginTop: theme.spacing.m,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  planType: {
    fontSize: theme.typography.sizes.subhead,
    color: theme.colors.subtext,
    marginTop: 4,
  },
  featuresContainer: {
    marginTop: theme.spacing.l,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  featureIcon: {
    marginRight: theme.spacing.m,
  },
  featureText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  buttonContainer: {
    marginTop: theme.spacing.l,
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    maxWidth: 320,
  },
  signInButton: {
    width: '100%',
    maxWidth: 320,
    marginTop: theme.spacing.m,
  },
  backButton: {
    marginTop: theme.spacing.l,
    padding: theme.spacing.m,
  },
  backText: {
    color: theme.colors.subtext,
    fontSize: theme.typography.sizes.body,
  },
  secureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  secureText: {
    color: theme.colors.subtext,
    fontSize: theme.typography.sizes.footnote,
    marginLeft: theme.spacing.s,
  },
  dialog: {
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surface,
  },
  successIconContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.l,
  },
  dialogTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  dialogContent: {
    textAlign: 'center',
    fontSize: theme.typography.sizes.subhead,
    color: theme.colors.subtext,
  },
});

export default SubscriptionScreen;