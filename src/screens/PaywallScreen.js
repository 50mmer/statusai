import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CustomButton from '../components/CustomButton';
import { theme } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import mock store config instead of native module
import * as StoreConfig from '../utils/MockStoreConfig';

// Get screen dimensions
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PaywallScreen = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const { updateSubscription } = useAuth();
  
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
    
    loadProducts();
    
    // Clean up
    return () => {
      StoreConfig.endConnection();
    };
  }, []);

  // Map store products to plan objects for display
  const plans = products.length > 0 ? products.map(product => ({
    id: product.productId,
    title: product.productId === StoreConfig.PRODUCT_IDS.ONE_TIME_ASSESSMENT ? 
      'One-Time Assessment' : 'Premium',
    price: product.localizedPrice || product.price,
    type: 'One-time payment',
    features: product.productId === StoreConfig.PRODUCT_IDS.ONE_TIME_ASSESSMENT ? [
      'Full assessment',
      'Detailed category breakdown',
      'Global percentile ranking',
      '10-year prediction'
    ] : [
      'Everything in Basic',
      'Unlimited reassessments',
      'Progress tracking',
      'Detailed analytics'
    ],
    isPopular: product.productId === StoreConfig.PRODUCT_IDS.PREMIUM_SUBSCRIPTION
  })) : [
    // Fallback plans if products can't be loaded
    {
      id: StoreConfig.PRODUCT_IDS.ONE_TIME_ASSESSMENT,
      title: 'One-Time Assessment',
      price: '$9.99',
      type: 'One-time payment',
      features: [
        'Full assessment',
        'Detailed category breakdown',
        'Global percentile ranking',
        '10-year prediction'
      ]
    },
    {
      id: StoreConfig.PRODUCT_IDS.PREMIUM_SUBSCRIPTION,
      title: 'Premium',
      price: '$19.99',
      type: 'One-time payment',
      features: [
        'Everything in Basic',
        'Unlimited reassessments',
        'Progress tracking',
        'Detailed analytics'
      ],
      isPopular: true
    }
  ];

  const handlePurchase = async () => {
    if (!selectedPlan) {
      Alert.alert('Selection Required', 'Please select a plan to continue.');
      return;
    }
    
    setPurchasing(true);
    
    try {
      // Process the mock purchase
      const result = await StoreConfig.purchaseProduct(selectedPlan);
      
      if (result.success) {
        // Update subscription tier based on selected plan
        const tier = selectedPlan === StoreConfig.PRODUCT_IDS.PREMIUM_SUBSCRIPTION 
          ? 'premium' : 'free';
        
        await updateSubscription(tier);
        
        // Navigate to signup screen
        navigation.navigate('Register', { planSelected: tier });
      } else {
        Alert.alert('Purchase Error', result.error || 'Failed to process payment.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert(
        'Purchase Error', 
        'There was an error processing your purchase. Please try again.'
      );
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading payment options...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Choose Your Plan</Text>
          <Text style={styles.headerSubtitle}>
            Get insights on where you stand globally
          </Text>
        </View>

        {/* Pricing plans */}
        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.selectedPlan,
                plan.isPopular && styles.popularPlan
              ]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.8}
            >
              {plan.isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
              )}
              
              <Text style={styles.planTitle}>{plan.title}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planType}>{plan.type}</Text>
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

              {selectedPlan === plan.id && (
                <View style={styles.selectedIndicator}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color={theme.colors.highScore}
                  />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            mode="contained"
            onPress={handlePurchase}
            style={styles.continueButton}
            loading={purchasing}
            disabled={!selectedPlan || purchasing}
          >
            Continue
          </CustomButton>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>Back to Home</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.l,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.body,
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
});

export default PaywallScreen;