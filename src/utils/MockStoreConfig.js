// src/utils/MockStoreConfig.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUBSCRIPTION_PLANS } from '../config/subscriptionPlans';
import PurchaseValidator from './PurchaseValidator';
import Analytics from './Analytics';
import ErrorLogger from './ErrorLogger';

// Product IDs for app
export const PRODUCT_IDS = {
  ONE_DAY_ACCESS: 'com.yourdomain.statusai.oneday',
  MONTHLY_ACCESS: 'com.yourdomain.statusai.monthly'
};

// Mock product data matching subscription plans
const mockProducts = [
  {
    productId: PRODUCT_IDS.ONE_DAY_ACCESS,
    title: SUBSCRIPTION_PLANS.ONE_DAY.name,
    description: 'Access for one day',
    price: SUBSCRIPTION_PLANS.ONE_DAY.price,
    currency: 'GBP',
    localizedPrice: SUBSCRIPTION_PLANS.ONE_DAY.price
  },
  {
    productId: PRODUCT_IDS.MONTHLY_ACCESS,
    title: SUBSCRIPTION_PLANS.MONTHLY.name,
    description: 'Access for one month',
    price: SUBSCRIPTION_PLANS.MONTHLY.price,
    currency: 'GBP',
    localizedPrice: SUBSCRIPTION_PLANS.MONTHLY.price
  }
];

// Initialize connection (mock)
export const initConnection = async () => {
  console.log('Mock store connection initialized');
  
  // Track store initialization
  Analytics.trackEvent('store_init');
  
  return true;
};

// Get products (mock)
export const getProducts = async () => {
  console.log('Getting mock products');
  
  try {
    // Track product fetch
    Analytics.trackEvent('get_products');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProducts;
  } catch (error) {
    // Log error
    ErrorLogger.logError(error, 'MockStoreConfig.getProducts');
    
    // Track error
    Analytics.trackEvent(Analytics.EVENTS.ERROR, {
      action: 'get_products',
      error_message: error.message
    });
    
    throw error;
  }
};

// Purchase a product (mock)
export const purchaseProduct = async (productId) => {
  console.log(`Mock purchasing product: ${productId}`);
  
  try {
    // Track purchase attempt
    Analytics.trackEvent('purchase_attempt', {
      product_id: productId
    });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Validate product ID
    if (!Object.values(PRODUCT_IDS).includes(productId)) {
      throw new Error(`Invalid product ID: ${productId}`);
    }
    
    // Calculate expiry date based on product type
    const now = new Date();
    let expiryDate = new Date();
    
    if (productId === PRODUCT_IDS.ONE_DAY_ACCESS) {
      expiryDate = new Date(now.getTime() + SUBSCRIPTION_PLANS.ONE_DAY.durationInMs);
    } else if (productId === PRODUCT_IDS.MONTHLY_ACCESS) {
      expiryDate = new Date(now.getTime() + SUBSCRIPTION_PLANS.MONTHLY.durationInMs);
    }
    
    // Generate receipt
    const purchaseReceipt = {
      productId,
      transactionId: 'mock-transaction-' + Math.random().toString(36).substring(2, 15),
      transactionDate: now.toISOString(),
      expiryDate: expiryDate.toISOString(),
      quantity: 1
    };
    
    // Validate purchase with backend
    const validationResult = await PurchaseValidator.validatePurchase(purchaseReceipt);
    
    if (!validationResult.success) {
      throw new Error(`Purchase validation failed: ${validationResult.error}`);
    }
    
    // Store purchase data in AsyncStorage
    await AsyncStorage.setItem('@payment_status', 'paid');
    await AsyncStorage.setItem('@payment_product', productId);
    await AsyncStorage.setItem('@payment_date', now.toISOString());
    await AsyncStorage.setItem('@payment_expiry', expiryDate.toISOString());
    
    // Track successful purchase
    Analytics.trackEvent('purchase_success', {
      product_id: productId,
      transaction_id: purchaseReceipt.transactionId,
      expiry_date: expiryDate.toISOString()
    });
    
    return { 
      success: true, 
      purchase: purchaseReceipt
    };
  } catch (error) {
    // Log error
    ErrorLogger.logError(error, 'MockStoreConfig.purchaseProduct', { productId });
    
    // Track purchase error
    Analytics.trackEvent(Analytics.EVENTS.ERROR, {
      action: 'purchase_product',
      product_id: productId,
      error_message: error.message
    });
    
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify purchase status and check if subscription is still valid
export const verifyPurchase = async () => {
  try {
    const status = await AsyncStorage.getItem('@payment_status');
    const expiryDateString = await AsyncStorage.getItem('@payment_expiry');
    
    if (status === 'paid' && expiryDateString) {
      const expiryDate = new Date(expiryDateString);
      const now = new Date();
      
      // Return true if subscription is still valid
      return expiryDate > now;
    }
    
    return false;
  } catch (error) {
    // Log error
    ErrorLogger.logError(error, 'MockStoreConfig.verifyPurchase');
    
    console.error('Verification error:', error);
    return false;
  }
};

// Get purchase history with expiry information
export const getPurchaseHistory = async () => {
  try {
    const product = await AsyncStorage.getItem('@payment_product');
    const date = await AsyncStorage.getItem('@payment_date');
    const expiryDateString = await AsyncStorage.getItem('@payment_expiry');
    
    if (product && date) {
      const expiryDate = expiryDateString ? new Date(expiryDateString) : null;
      const now = new Date();
      
      return {
        productId: product,
        purchaseDate: new Date(date),
        expiryDate: expiryDate,
        isActive: expiryDate ? (expiryDate > now) : false
      };
    }
    
    return null;
  } catch (error) {
    // Log error
    ErrorLogger.logError(error, 'MockStoreConfig.getPurchaseHistory');
    
    console.error('Failed to get purchase history:', error);
    return null;
  }
};

// Get current subscription details
export const getCurrentSubscription = async () => {
  try {
    const productId = await AsyncStorage.getItem('@payment_product');
    const expiryDateString = await AsyncStorage.getItem('@payment_expiry');
    
    if (!productId || !expiryDateString) return null;
    
    const expiryDate = new Date(expiryDateString);
    const now = new Date();
    
    // Check if subscription is expired
    if (expiryDate <= now) {
      return null;
    }
    
    // Determine subscription type
    let subscriptionType = '';
    if (productId === PRODUCT_IDS.ONE_DAY_ACCESS) {
      subscriptionType = 'one_day';
    } else if (productId === PRODUCT_IDS.MONTHLY_ACCESS) {
      subscriptionType = 'monthly';
    }
    
    return {
      type: subscriptionType,
      expiryDate: expiryDateString,
      isActive: true
    };
  } catch (error) {
    // Log error
    ErrorLogger.logError(error, 'MockStoreConfig.getCurrentSubscription');
    
    console.error('Error getting current subscription:', error);
    return null;
  }
};

// Restore purchases
export const restorePurchases = async () => {
  try {
    // Track restore attempt
    Analytics.trackEvent('restore_purchases_attempt');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get receipts from our local validation store
    const receipts = await PurchaseValidator.getPurchaseReceipts();
    
    if (!receipts || receipts.length === 0) {
      return { success: false, message: 'No purchases found to restore' };
    }
    
    // Filter for valid, non-expired receipts
    const now = new Date();
    const validReceipts = receipts.filter(receipt => {
      if (!receipt.expiryDate) return true; // Non-subscription
      const expiryDate = new Date(receipt.expiryDate);
      return expiryDate > now;
    });
    
    if (validReceipts.length === 0) {
      return { success: false, message: 'No active subscriptions found' };
    }
    
    // Sort by expiry date (most recent last)
    validReceipts.sort((a, b) => {
      if (!a.expiryDate) return -1;
      if (!b.expiryDate) return 1;
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    });
    
    // Get the most recent receipt
    const latestReceipt = validReceipts[validReceipts.length - 1];
    
    // Update local store with restored receipt
    await AsyncStorage.setItem('@payment_status', 'paid');
    await AsyncStorage.setItem('@payment_product', latestReceipt.productId);
    await AsyncStorage.setItem('@payment_date', latestReceipt.transactionDate);
    await AsyncStorage.setItem('@payment_expiry', latestReceipt.expiryDate);
    
    // Track successful restore
    Analytics.trackEvent('restore_purchases_success', {
      product_id: latestReceipt.productId,
      transaction_id: latestReceipt.transactionId,
      expiry_date: latestReceipt.expiryDate
    });
    
    return { 
      success: true,
      receipt: latestReceipt
    };
  } catch (error) {
    // Log error
    ErrorLogger.logError(error, 'MockStoreConfig.restorePurchases');
    
    // Track restore error
    Analytics.trackEvent(Analytics.EVENTS.ERROR, {
      action: 'restore_purchases',
      error_message: error.message
    });
    
    console.error('Failed to restore purchases:', error);
    return { 
      success: false, 
      error: error.message
    };
  }
};

// Mock purchase listener handler
export const setupPurchaseListener = (callback) => {
  console.log('Mock purchase listener setup');
  
  // Nothing to do for mock implementation
  return () => {
    console.log('Mock purchase listener removed');
  };
};

// Disconnect (mock)
export const endConnection = async () => {
  console.log('Mock store connection ended');
  return true;
};

export default {
  PRODUCT_IDS,
  initConnection,
  getProducts,
  purchaseProduct,
  verifyPurchase,
  getPurchaseHistory,
  getCurrentSubscription,
  restorePurchases,
  setupPurchaseListener,
  endConnection
};